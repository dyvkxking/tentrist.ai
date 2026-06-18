// Package handlers provides HTTP handlers for the Tentrist API.
package handlers

import (
	"encoding/hex"
	"encoding/json"
	"fmt"
	"math/big"
	"net/http"
	"sort"
	"sync"
	"time"

	"github.com/gorilla/mux"

	"github.com/tentrist.ai/backend/pkg/types"
)

// JobHandler handles job-related API requests.
type JobHandler struct {
	mu    sync.RWMutex
	jobs  map[string]*types.Job
	slas  map[string]*types.SLABenchmark

	// Runtime metering tracker: jobID -> MeteringRecord
	metering map[string]*MeteringRecord

	// Node selector for serverless routing
	nodeSelector NodeSelector

	// External dependencies
	contractClient interface{}
	supabaseClient interface{}
}

// NodeSelector interface for querying healthy standby nodes.
type NodeSelector interface {
	GetHealthyStandbyNodes(minCapacity uint64) []string
}

// NodeSelectorFunc adapter for function-based selectors.
type NodeSelectorFunc func(minCapacity uint64) []string

func (f NodeSelectorFunc) GetHealthyStandbyNodes(minCapacity uint64) []string {
	return f(minCapacity)
}

// MeteringRecord tracks high-speed runtime metering for a job packet.
type MeteringRecord struct {
	JobID       string
	UnitIndex   int
	NodeID      string
	StartTime   time.Time
	EndTime     time.Time
	Units       uint64 // units processed (ms for TimeBased, tokens for TokenBased)
	BilledMicroUSDC *big.Int
	Status      MeteringStatus
}

// MeteringStatus represents the state of a metering record.
type MeteringStatus uint8

const (
	MeteringPending MeteringStatus = 0
	MeteringActive MeteringStatus = 1
	MeteringDone   MeteringStatus = 2
)

// NewJobHandler creates a new JobHandler with in-memory storage.
func NewJobHandler() *JobHandler {
	return &JobHandler{
		jobs:     make(map[string]*types.Job),
		slas:     make(map[string]*types.SLABenchmark),
		metering: make(map[string]*MeteringRecord),
	}
}

// NewJobHandlerWithSelector creates a JobHandler with a custom node selector.
func NewJobHandlerWithSelector(selector NodeSelector) *JobHandler {
	h := NewJobHandler()
	h.nodeSelector = selector
	return h
}

// SetContractClient sets the contract client for blockchain interactions.
func (h *JobHandler) SetContractClient(client interface{}) {
	h.contractClient = client
}

// SetSupabaseClient sets the Supabase client for database operations.
func (h *JobHandler) SetSupabaseClient(client interface{}) {
	h.supabaseClient = client
}

// ServerlessJobSubmitRequest represents a serverless job submission request.
// This replaces the old model where users specified node addresses.
type ServerlessJobSubmitRequest struct {
	ClientID             string `json:"clientId"`
	RequiredUptime       uint64 `json:"requiredUptime"`
	RequiredThroughput    uint64 `json:"requiredThroughput"`
	DeadlineTimestamp    int64  `json:"deadlineTimestamp"`
	WorkloadPayload      []byte `json:"workloadPayload"` // raw workload data
	IsServerless         bool   `json:"isServerless"`   // true = serverless, false = dedicated
}

// ServerlessJobSubmitResponse represents the response after serverless job submission.
type ServerlessJobSubmitResponse struct {
	JobID          string   `json:"jobId"`
	Status         string   `json:"status"`
	AssignedNode   string   `json:"assignedNode,omitempty"` // auto-assigned node
	CheckpointRef  string   `json:"checkpointRef,omitempty"`
	EstimatedRate  string   `json:"estimatedRate"`  // estimated rate per unit in micro-USDC
	CreatedAt      int64    `json:"createdAt"`
}

// MeteringResponse represents a metering record response.
type MeteringResponse struct {
	JobID          string `json:"jobId"`
	UnitIndex      int    `json:"unitIndex"`
	NodeID         string `json:"nodeId"`
	DurationMs     int64  `json:"durationMs"`
	Units          uint64 `json:"units"`
	BilledMicroUSDC string `json:"billedMicroUSDC"`
	Status         string `json:"status"`
}

// Legacy request types for backward compatibility
type JobSubmitRequest ServerlessJobSubmitRequest

// JobSubmitResponse represents the response after submitting a job.
type JobSubmitResponse struct {
	JobID     string `json:"jobId"`
	Status   string `json:"status"`
	CreatedAt int64  `json:"createdAt"`
}

// JobStatusResponse represents a job status response.
type JobStatusResponse struct {
	JobID          string   `json:"jobId"`
	ClientID       string   `json:"clientId"`
	Status         string   `json:"status"`
	AssignedNodes  []string `json:"assignedNodes"`
	CheckpointRef string   `json:"checkpointRef"`
	CreatedAt     int64    `json:"createdAt"`
	Deadline      int64    `json:"deadline"`
	// Serverless fields
	IsServerless  bool   `json:"isServerless"`
	TotalBilled  string `json:"totalBilledMicroUSDC,omitempty"`
	UsageCounter  uint64 `json:"usageCounter,omitempty"`
}

// SLAResponse represents an SLA benchmark response.
type SLAResponse struct {
	JobID                 string `json:"jobId"`
	RequiredUptime        uint64 `json:"requiredUptime"`
	RequiredThroughput     uint64 `json:"requiredThroughput"`
	Deadline              int64  `json:"deadline"`
	Fulfilled             bool   `json:"fulfilled"`
}

// CancelResponse represents a job cancellation response.
type CancelResponse struct {
	JobID   string `json:"jobId"`
	Status  string `json:"status"`
	Message string `json:"message"`
}

// ServeJobs registers all job routes on the given router.
func (h *JobHandler) ServeJobs(r *mux.Router) {
	r.HandleFunc("/api/v1/jobs", h.SubmitJob).Methods(http.MethodPost)
	r.HandleFunc("/api/v1/jobs/serverless", h.SubmitServerlessJob).Methods(http.MethodPost)
	r.HandleFunc("/api/v1/jobs/{id}", h.GetJob).Methods(http.MethodGet)
	r.HandleFunc("/api/v1/jobs/{id}/sla", h.GetSLA).Methods(http.MethodGet)
	r.HandleFunc("/api/v1/jobs/{id}/cancel", h.CancelJob).Methods(http.MethodPost)
	r.HandleFunc("/api/v1/jobs/{id}/metering", h.GetMetering).Methods(http.MethodGet)
	r.HandleFunc("/api/v1/jobs/{id}/metering/start", h.StartMetering).Methods(http.MethodPost)
	r.HandleFunc("/api/v1/jobs/{id}/metering/stop", h.StopMetering).Methods(http.MethodPost)
}

// SubmitJob handles POST /api/v1/jobs — Submit new compute job (legacy/dedicated model).
func (h *JobHandler) SubmitJob(w http.ResponseWriter, r *http.Request) {
	var req ServerlessJobSubmitRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, fmt.Sprintf("invalid request body: %v", err), http.StatusBadRequest)
		return
	}

	if req.ClientID == "" {
		http.Error(w, "clientId is required", http.StatusBadRequest)
		return
	}

	if req.RequiredUptime == 0 || req.RequiredUptime > 10000 {
		http.Error(w, "requiredUptime must be between 1 and 10000 (basis points)", http.StatusBadRequest)
		return
	}

	if req.RequiredThroughput == 0 {
		http.Error(w, "requiredThroughput must be greater than 0", http.StatusBadRequest)
		return
	}

	if req.DeadlineTimestamp == 0 {
		http.Error(w, "deadlineTimestamp is required", http.StatusBadRequest)
		return
	}

	// Generate a new job ID
	var jobIDBytes [32]byte
	for i := range jobIDBytes {
		jobIDBytes[i] = byte(time.Now().UnixNano() % 256)
	}
	jobID := hex.EncodeToString(jobIDBytes[:])

	deadline := time.Unix(req.DeadlineTimestamp, 0)
	now := time.Now()

	// Create the job (legacy model - not serverless)
	job := &types.Job{
		ID:        jobIDBytes,
		ClientID:  parseAddress(req.ClientID),
		Status:    types.JobPending,
		CreatedAt: now,
		Deadline:  deadline,
		// Legacy: no metering fields populated for dedicated model
	}

	// Create SLA benchmark
	sla := &types.SLABenchmark{
		RequiredUptime:     req.RequiredUptime,
		RequiredThroughput: req.RequiredThroughput,
		Deadline:          deadline,
		Fulfilled:         false,
	}

	h.mu.Lock()
	h.jobs[jobID] = job
	h.slas[jobID] = sla
	h.mu.Unlock()

	resp := JobSubmitResponse{
		JobID:     jobID,
		Status:    "pending",
		CreatedAt: now.Unix(),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}

// SubmitServerlessJob handles POST /api/v1/jobs/serverless — Submit job to serverless pool.
// This dynamically queries healthy standby nodes and proxies execution to them.
func (h *JobHandler) SubmitServerlessJob(w http.ResponseWriter, r *http.Request) {
	var req ServerlessJobSubmitRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, fmt.Sprintf("invalid request body: %v", err), http.StatusBadRequest)
		return
	}

	if req.ClientID == "" {
		http.Error(w, "clientId is required", http.StatusBadRequest)
		return
	}

	if req.RequiredUptime == 0 || req.RequiredUptime > 10000 {
		http.Error(w, "requiredUptime must be between 1 and 10000 (basis points)", http.StatusBadRequest)
		return
	}

	if req.DeadlineTimestamp == 0 {
		http.Error(w, "deadlineTimestamp is required", http.StatusBadRequest)
		return
	}

	// Generate a new job ID
	var jobIDBytes [32]byte
	for i := range jobIDBytes {
		jobIDBytes[i] = byte(time.Now().UnixNano() % 256)
	}
	jobID := hex.EncodeToString(jobIDBytes[:])

	deadline := time.Unix(req.DeadlineTimestamp, 0)
	now := time.Now()

	// Default metering to TimeBased if not specified
	meteredType := types.TimeBased
	ratePerUnit := types.RatePerUnit{
		MicroUSDCPerUnit: 100, // 100 micro-USDC per ms default
		UnitType:          meteredType,
	}

	// Query healthy standby nodes dynamically
	var assignedNode string
	if h.nodeSelector != nil {
		healthyNodes := h.nodeSelector.GetHealthyStandbyNodes(1024) // min 1GB VRAM
		if len(healthyNodes) > 0 {
			// Sort by reputation (highest first) for load balancing
			sort.Slice(healthyNodes, func(i, j int) bool {
				return healthyNodes[i] > healthyNodes[j] // placeholder - actual sorting would use node data
			})
			assignedNode = healthyNodes[0]
		}
	}

	// If no node selector or no healthy nodes, use placeholder
	if assignedNode == "" {
		assignedNode = "pool-standby-001"
	}

	// Create the serverless job
	job := &types.Job{
		ID:        jobIDBytes,
		ClientID:  parseAddress(req.ClientID),
		Status:    types.JobRunning, // Immediately set to running when assigned
		CreatedAt: now,
		Deadline:  deadline,
		// Serverless metering fields
		MeteredType:  meteredType,
		RatePerUnit:  ratePerUnit,
		UsageCounter:  0,
		TotalBilled:  big.NewInt(0),
		IsServerless: true,
	}

	// Set assigned node address
	if len(assignedNode) >= 2 && assignedNode[:2] == "0x" {
		nodeBytes, _ := hex.DecodeString(assignedNode[2:])
		if len(nodeBytes) == 20 {
			var nodeAddr [20]byte
			copy(nodeAddr[:], nodeBytes)
			job.AssignedNodes = [][20]byte{nodeAddr}
		}
	}

	// Create SLA benchmark
	sla := &types.SLABenchmark{
		RequiredUptime:     req.RequiredUptime,
		RequiredThroughput: req.RequiredThroughput,
		Deadline:          deadline,
		Fulfilled:         false,
	}

	// Initialize metering record for this job
	h.mu.Lock()
	h.jobs[jobID] = job
	h.slas[jobID] = sla
	h.metering[jobID] = &MeteringRecord{
		JobID:    jobID,
		StartTime: now,
		Status:   MeteringActive,
	}
	h.mu.Unlock()

	resp := ServerlessJobSubmitResponse{
		JobID:         jobID,
		Status:        "running",
		AssignedNode:  assignedNode,
		EstimatedRate: fmt.Sprintf("%d micro-USDC per ms", ratePerUnit.MicroUSDCPerUnit),
		CreatedAt:    now.Unix(),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}

// GetJob handles GET /api/v1/jobs/:id — Get job status.
func (h *JobHandler) GetJob(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	jobID := vars["id"]

	h.mu.RLock()
	job, exists := h.jobs[jobID]
	h.mu.RUnlock()

	if !exists {
		http.Error(w, "job not found", http.StatusNotFound)
		return
	}

	assignedNodes := make([]string, len(job.AssignedNodes))
	for i, node := range job.AssignedNodes {
		assignedNodes[i] = hex.EncodeToString(node[:])
	}

	resp := JobStatusResponse{
		JobID:         jobID,
		ClientID:      hex.EncodeToString(job.ClientID[:]),
		Status:        jobStatusToString(job.Status),
		AssignedNodes: assignedNodes,
		CheckpointRef: job.CheckpointRef,
		CreatedAt:     job.CreatedAt.Unix(),
		Deadline:      job.Deadline.Unix(),
		IsServerless:  job.IsServerless,
	}

	if job.TotalBilled != nil {
		resp.TotalBilled = job.TotalBilled.String()
	}
	resp.UsageCounter = job.UsageCounter

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// GetSLA handles GET /api/v1/jobs/:id/sla — Get SLA benchmarks.
func (h *JobHandler) GetSLA(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	jobID := vars["id"]

	h.mu.RLock()
	sla, exists := h.slas[jobID]
	h.mu.RUnlock()

	if !exists {
		http.Error(w, "SLA not found for job", http.StatusNotFound)
		return
	}

	resp := SLAResponse{
		JobID:              jobID,
		RequiredUptime:     sla.RequiredUptime,
		RequiredThroughput: sla.RequiredThroughput,
		Deadline:          sla.Deadline.Unix(),
		Fulfilled:         sla.Fulfilled,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// CancelJob handles POST /api/v1/jobs/:id/cancel — Cancel job.
func (h *JobHandler) CancelJob(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	jobID := vars["id"]

	h.mu.Lock()
	defer h.mu.Unlock()

	job, exists := h.jobs[jobID]
	if !exists {
		http.Error(w, "job not found", http.StatusNotFound)
		return
	}

	if job.Status != types.JobPending && job.Status != types.JobRunning {
		http.Error(w, "job cannot be cancelled in current state", http.StatusConflict)
		return
	}

	job.Status = types.JobFailed

	// Stop metering if active
	if mr, ok := h.metering[jobID]; ok && mr.Status == MeteringActive {
		mr.EndTime = time.Now()
		mr.Status = MeteringDone
	}

	resp := CancelResponse{
		JobID:   jobID,
		Status:  "cancelled",
		Message: "job has been cancelled successfully",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// GetMetering handles GET /api/v1/jobs/:id/metering — Get metering record.
func (h *JobHandler) GetMetering(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	jobID := vars["id"]

	h.mu.RLock()
	mr, exists := h.metering[jobID]
	h.mu.RUnlock()

	if !exists {
		http.Error(w, "metering record not found for job", http.StatusNotFound)
		return
	}

	durationMs := int64(0)
	if !mr.EndTime.IsZero() {
		durationMs = mr.EndTime.Sub(mr.StartTime).Milliseconds()
	} else if mr.Status == MeteringActive {
		durationMs = time.Since(mr.StartTime).Milliseconds()
	}

	billedStr := "0"
	if mr.BilledMicroUSDC != nil {
		billedStr = mr.BilledMicroUSDC.String()
	}

	resp := MeteringResponse{
		JobID:           jobID,
		UnitIndex:       mr.UnitIndex,
		NodeID:          mr.NodeID,
		DurationMs:      durationMs,
		Units:           mr.Units,
		BilledMicroUSDC: billedStr,
		Status:          meteringStatusToString(mr.Status),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// StartMetering handles POST /api/v1/jobs/:id/metering/start — Start metering a work unit.
func (h *JobHandler) StartMetering(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	jobID := vars["id"]

	var req struct {
		UnitIndex int    `json:"unitIndex"`
		NodeID   string `json:"nodeId"`
		Units    uint64 `json:"units"` // initial units to track
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, fmt.Sprintf("invalid request body: %v", err), http.StatusBadRequest)
		return
	}

	h.mu.Lock()
	defer h.mu.Unlock()

	mr, exists := h.metering[jobID]
	if !exists {
		// Create new metering record
		mr = &MeteringRecord{
			JobID:     jobID,
			UnitIndex: req.UnitIndex,
			NodeID:    req.NodeID,
			Units:     req.Units,
			StartTime: time.Now(),
			Status:    MeteringActive,
		}
		h.metering[jobID] = mr
	} else {
		// Update existing record
		mr.UnitIndex = req.UnitIndex
		mr.NodeID = req.NodeID
		mr.Units = req.Units
		mr.StartTime = time.Now()
		mr.EndTime = time.Time{}
		mr.Status = MeteringActive
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"jobId":     jobID,
		"status":    "metering_started",
		"startTime": mr.StartTime.Unix(),
	})
}

// StopMetering handles POST /api/v1/jobs/:id/metering/stop — Stop metering and calculate bill.
func (h *JobHandler) StopMetering(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	jobID := vars["id"]

	var req struct {
		Units uint64 `json:"units"` // final units processed
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, fmt.Sprintf("invalid request body: %v", err), http.StatusBadRequest)
		return
	}

	h.mu.Lock()
	defer h.mu.Unlock()

	mr, exists := h.metering[jobID]
	if !exists {
		http.Error(w, "metering record not found for job", http.StatusNotFound)
		return
	}

	if mr.Status != MeteringActive {
		http.Error(w, "metering is not active", http.StatusConflict)
		return
	}

	// Stop metering
	mr.EndTime = time.Now()
	mr.Units = req.Units
	mr.Status = MeteringDone

	// Calculate bill
	job, jobExists := h.jobs[jobID]
	billed := big.NewInt(0)
	if jobExists {
		// Billed = rate per unit * units
		rate := job.RatePerUnit.MicroUSDCPerUnit
		billed = big.NewInt(0).Mul(big.NewInt(int64(req.Units)), big.NewInt(int64(rate)))
		mr.BilledMicroUSDC = billed

		// Update job total billed
		job.TotalBilled = big.NewInt(0).Add(job.TotalBilled, billed)
		job.UsageCounter += req.Units
	}

	durationMs := mr.EndTime.Sub(mr.StartTime).Milliseconds()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"jobId":           jobID,
		"status":          "metering_stopped",
		"durationMs":      durationMs,
		"unitsProcessed":   req.Units,
		"billedMicroUSDC":  billed.String(),
	})
}

// Helper functions

func parseAddress(s string) [20]byte {
	var addr [20]byte
	data, err := hex.DecodeString(s)
	if err != nil || len(data) != 20 {
		// Return empty address if invalid
		return addr
	}
	copy(addr[:], data)
	return addr
}

func jobStatusToString(status types.JobStatus) string {
	switch status {
	case types.JobPending:
		return "pending"
	case types.JobRunning:
		return "running"
	case types.JobCompleted:
		return "completed"
	case types.JobFailed:
		return "failed"
	case types.JobRequeued:
		return "requeued"
	default:
		return "unknown"
	}
}

func meteringStatusToString(status MeteringStatus) string {
	switch status {
	case MeteringPending:
		return "pending"
	case MeteringActive:
		return "active"
	case MeteringDone:
		return "done"
	default:
		return "unknown"
	}
}

// AddJobForTesting adds a job directly to the handler for testing purposes.
func (h *JobHandler) AddJobForTesting(jobID string, job *types.Job, sla *types.SLABenchmark) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.jobs[jobID] = job
	if sla != nil {
		h.slas[jobID] = sla
	}
}

// GetJobForTesting retrieves a job for testing purposes.
func (h *JobHandler) GetJobForTesting(jobID string) (*types.Job, *types.SLABenchmark, bool) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	job, exists := h.jobs[jobID]
	if !exists {
		return nil, nil, false
	}
	sla, hasSLA := h.slas[jobID]
	return job, sla, hasSLA
}

// UpdateJobStatusForTesting updates job status for testing.
func (h *JobHandler) UpdateJobStatusForTesting(jobID string, status types.JobStatus) bool {
	h.mu.Lock()
	defer h.mu.Unlock()
	job, exists := h.jobs[jobID]
	if !exists {
		return false
	}
	job.Status = status
	return true
}

// GetMeteringForTesting retrieves metering record for testing.
func (h *JobHandler) GetMeteringForTesting(jobID string) (*MeteringRecord, bool) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	mr, exists := h.metering[jobID]
	return mr, exists
}

// AddMeteringForTesting adds a metering record for testing.
func (h *JobHandler) AddMeteringForTesting(jobID string, mr *MeteringRecord) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.metering[jobID] = mr
}

// GenerateJobID generates a new job ID string.
func GenerateJobID() string {
	jobIDBytes := make([]byte, 32)
	for i := range jobIDBytes {
		jobIDBytes[i] = byte(time.Now().UnixNano() % 256)
	}
	return hex.EncodeToString(jobIDBytes)
}

// ParseBigInt parses a string into a big.Int.
func ParseBigInt(s string) *big.Int {
	val, ok := new(big.Int).SetString(s, 10)
	if !ok {
		return big.NewInt(0)
	}
	return val
}
