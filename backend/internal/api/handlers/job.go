// Package handlers provides HTTP handlers for the Tentrist API.
package handlers

import (
	"encoding/hex"
	"encoding/json"
	"fmt"
	"math/big"
	"net/http"
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
}

// NewJobHandler creates a new JobHandler with in-memory storage.
func NewJobHandler() *JobHandler {
	return &JobHandler{
		jobs: make(map[string]*types.Job),
		slas: make(map[string]*types.SLABenchmark),
	}
}

// JobSubmitRequest represents a job submission request.
type JobSubmitRequest struct {
	ClientID             string `json:"clientId"`
	RequiredUptime       uint64 `json:"requiredUptime"`
	RequiredThroughput    uint64 `json:"requiredThroughput"`
	DeadlineTimestamp    int64  `json:"deadlineTimestamp"`
}

// JobSubmitResponse represents the response after submitting a job.
type JobSubmitResponse struct {
	JobID     string `json:"jobId"`
	Status   string `json:"status"`
	CreatedAt int64  `json:"createdAt"`
}

// JobStatusResponse represents a job status response.
type JobStatusResponse struct {
	JobID          string `json:"jobId"`
	ClientID       string `json:"clientId"`
	Status         string `json:"status"`
	AssignedNodes  []string `json:"assignedNodes"`
	CheckpointRef  string `json:"checkpointRef"`
	CreatedAt      int64  `json:"createdAt"`
	Deadline       int64  `json:"deadline"`
}

// SLAResponse represents an SLA benchmark response.
type SLAResponse struct {
	JobID                 string `json:"jobId"`
	RequiredUptime        uint64 `json:"requiredUptime"`
	RequiredThroughput    uint64 `json:"requiredThroughput"`
	Deadline              int64  `json:"deadline"`
	Fulfilled             bool   `json:"fulfilled"`
}

// CancelResponse represents a job cancellation response.
type CancelResponse struct {
	JobID   string `json:"jobId"`
	Status  string `json:"status"`
	Message string `json:"message"`
}

// healthCheck is a simple health check handler for testing.
func healthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

// ServeJobs registers all job routes on the given router.
func (h *JobHandler) ServeJobs(r *mux.Router) {
	r.HandleFunc("/api/v1/jobs", h.SubmitJob).Methods(http.MethodPost)
	r.HandleFunc("/api/v1/jobs/{id}", h.GetJob).Methods(http.MethodGet)
	r.HandleFunc("/api/v1/jobs/{id}/sla", h.GetSLA).Methods(http.MethodGet)
	r.HandleFunc("/api/v1/jobs/{id}/cancel", h.CancelJob).Methods(http.MethodPost)
}

// SubmitJob handles POST /api/v1/jobs — Submit new compute job.
func (h *JobHandler) SubmitJob(w http.ResponseWriter, r *http.Request) {
	var req JobSubmitRequest
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

	// Create the job
	job := &types.Job{
		ID:        jobIDBytes,
		ClientID:  parseAddress(req.ClientID),
		Status:    types.JobPending,
		CreatedAt: now,
		Deadline:  deadline,
	}

	// Create SLA benchmark
	sla := &types.SLABenchmark{
		RequiredUptime:     req.RequiredUptime,
		RequiredThroughput: req.RequiredThroughput,
		Deadline:           deadline,
		Fulfilled:          false,
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
		JobID:          jobID,
		ClientID:       hex.EncodeToString(job.ClientID[:]),
		Status:         jobStatusToString(job.Status),
		AssignedNodes:  assignedNodes,
		CheckpointRef:  job.CheckpointRef,
		CreatedAt:      job.CreatedAt.Unix(),
		Deadline:       job.Deadline.Unix(),
	}

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
		Deadline:           sla.Deadline.Unix(),
		Fulfilled:          sla.Fulfilled,
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

	resp := CancelResponse{
		JobID:   jobID,
		Status:  "cancelled",
		Message: "job has been cancelled successfully",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
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
