// Package test provides in-memory storage for integration testing.
// This storage persists node, job, and checkpoint state during test sweeps.
package test

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"sync"
	"time"

	"github.com/tentrist.ai/backend/internal/orchestrator"
	"github.com/tentrist.ai/backend/pkg/types"
)

// =============================================================================
// In-Memory Test Store
// =============================================================================

// Store is a thread-safe in-memory store for integration testing.
// It persists nodes, jobs, checkpoints, and slash events across test sweeps.
type Store struct {
	mu      sync.RWMutex
	nodes   map[string]*types.Node
	jobs    map[string]*types.Job
	slas    map[string]*types.SLABenchmark
	checkpoints map[string]*Checkpoint
	slashEvents []SlashEvent
	heartbeats  []HeartbeatEvent
}

// Checkpoint mirrors the orchestrator.Checkpoint for test storage.
type Checkpoint struct {
	Ref       string
	JobID     string
	UnitIndex int
	NodeID    string
	State     []byte
	CreatedAt time.Time
	Sequence  int
}

// SlashEvent records a slash operation.
type SlashEvent struct {
	Node      string
	Client   string
	JobID    string
	Amount   uint64
	Reason   string
	Timestamp time.Time
}

// HeartbeatEvent records a heartbeat.
type HeartbeatEvent struct {
	NodeID   string
	VRAMUsed uint64
	VRAMTotal uint64
	Latency  uint64
	Timestamp time.Time
}

// NewStore creates a new in-memory test store.
func NewStore() *Store {
	return &Store{
		nodes:      make(map[string]*types.Node),
		jobs:       make(map[string]*types.Job),
		slas:       make(map[string]*types.SLABenchmark),
		checkpoints: make(map[string]*Checkpoint),
		slashEvents: make([]SlashEvent, 0),
		heartbeats:  make([]HeartbeatEvent, 0),
	}
}

// Reset clears all stored data (for test isolation).
func (s *Store) Reset() {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.nodes = make(map[string]*types.Node)
	s.jobs = make(map[string]*types.Job)
	s.slas = make(map[string]*types.SLABenchmark)
	s.checkpoints = make(map[string]*Checkpoint)
	s.slashEvents = make([]SlashEvent, 0)
	s.heartbeats = make([]HeartbeatEvent, 0)
}

// =============================================================================
// Node Operations
// =============================================================================

// SetNode stores a node.
func (s *Store) SetNode(id string, node *types.Node) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.nodes[id] = node
}

// GetNode retrieves a node.
func (s *Store) GetNode(id string) (*types.Node, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	node, ok := s.nodes[id]
	return node, ok
}

// GetAllNodes returns all nodes.
func (s *Store) GetAllNodes() map[string]*types.Node {
	s.mu.RLock()
	defer s.mu.RUnlock()
	result := make(map[string]*types.Node, len(s.nodes))
	for k, v := range s.nodes {
		result[k] = v
	}
	return result
}

// GetNodeCount returns the number of nodes.
func (s *Store) GetNodeCount() int {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return len(s.nodes)
}

// GetOnlineNodes returns all online nodes.
func (s *Store) GetOnlineNodes() []*types.Node {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var online []*types.Node
	for _, node := range s.nodes {
		if node.Status == types.NodeOnline {
			online = append(online, node)
		}
	}
	return online
}

// GetEligibleNodes returns nodes with sufficient stake.
func (s *Store) GetEligibleNodes(minStake uint64) []*types.Node {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var eligible []*types.Node
	for _, node := range s.nodes {
		if node.Status == types.NodeOnline && node.StakeAmount.Uint64() >= minStake {
			eligible = append(eligible, node)
		}
	}
	return eligible
}

// =============================================================================
// Job Operations
// =============================================================================

// SetJob stores a job.
func (s *Store) SetJob(id string, job *types.Job) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.jobs[id] = job
}

// GetJob retrieves a job.
func (s *Store) GetJob(id string) (*types.Job, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	job, ok := s.jobs[id]
	return job, ok
}

// GetAllJobs returns all jobs.
func (s *Store) GetAllJobs() map[string]*types.Job {
	s.mu.RLock()
	defer s.mu.RUnlock()
	result := make(map[string]*types.Job, len(s.jobs))
	for k, v := range s.jobs {
		result[k] = v
	}
	return result
}

// GetJobCount returns the number of jobs.
func (s *Store) GetJobCount() int {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return len(s.jobs)
}

// GetJobsByStatus returns jobs with a specific status.
func (s *Store) GetJobsByStatus(status types.JobStatus) []*types.Job {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var result []*types.Job
	for _, job := range s.jobs {
		if job.Status == status {
			result = append(result, job)
		}
	}
	return result
}

// =============================================================================
// SLA Operations
// =============================================================================

// SetSLA stores an SLA benchmark.
func (s *Store) SetSLA(jobID string, sla *types.SLABenchmark) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.slas[jobID] = sla
}

// GetSLA retrieves an SLA benchmark.
func (s *Store) GetSLA(jobID string) (*types.SLABenchmark, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	sla, ok := s.slas[jobID]
	return sla, ok
}

// =============================================================================
// Checkpoint Operations
// =============================================================================

// SaveCheckpoint saves a checkpoint and returns its reference.
func (s *Store) SaveCheckpoint(jobID string, unit orchestrator.WorkUnit, state []byte) (string, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Generate reference
	now := time.Now()
	hashInput := fmt.Sprintf("%s-%d-%d", jobID, unit.UnitIndex, now.UnixNano())
	hash := sha256.Sum256([]byte(hashInput))
	ref := hex.EncodeToString(hash[:])

	// Get sequence number
	seq := 1
	for _, cp := range s.checkpoints {
		if cp.JobID == jobID {
			seq++
		}
	}

	cp := &Checkpoint{
		Ref:       ref,
		JobID:    jobID,
		UnitIndex: unit.UnitIndex,
		NodeID:   unit.NodeID,
		State:    state,
		CreatedAt: now,
		Sequence: seq,
	}
	s.checkpoints[ref] = cp
	return ref, nil
}

// GetCheckpoint retrieves a checkpoint by reference.
func (s *Store) GetCheckpoint(ref string) (*Checkpoint, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	cp, ok := s.checkpoints[ref]
	return cp, ok
}

// GetLastCheckpoint retrieves the most recent checkpoint for a job.
func (s *Store) GetLastCheckpoint(jobID string) (*Checkpoint, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var last *Checkpoint
	for _, cp := range s.checkpoints {
		if cp.JobID == jobID {
			if last == nil || cp.Sequence > last.Sequence {
				last = cp
			}
		}
	}
	return last, last != nil
}

// GetCheckpointsForJob returns all checkpoints for a job.
func (s *Store) GetCheckpointsForJob(jobID string) []*Checkpoint {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var checkpoints []*Checkpoint
	for _, cp := range s.checkpoints {
		if cp.JobID == jobID {
			checkpoints = append(checkpoints, cp)
		}
	}
	return checkpoints
}

// ClearCheckpoints removes all checkpoints for a job.
func (s *Store) ClearCheckpoints(jobID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	for ref, cp := range s.checkpoints {
		if cp.JobID == jobID {
			delete(s.checkpoints, ref)
		}
	}
	return nil
}

// GetCheckpointCount returns the total number of checkpoints.
func (s *Store) GetCheckpointCount() int {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return len(s.checkpoints)
}

// =============================================================================
// Slash Event Operations
// =============================================================================

// RecordSlash records a slash event.
func (s *Store) RecordSlash(nodeID, clientID, jobID string, amount uint64, reason string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.slashEvents = append(s.slashEvents, SlashEvent{
		Node:      nodeID,
		Client:   clientID,
		JobID:    jobID,
		Amount:   amount,
		Reason:   reason,
		Timestamp: time.Now(),
	})
}

// GetSlashEvents returns all slash events.
func (s *Store) GetSlashEvents() []SlashEvent {
	s.mu.RLock()
	defer s.mu.RUnlock()
	events := make([]SlashEvent, len(s.slashEvents))
	copy(events, s.slashEvents)
	return events
}

// GetSlashCount returns the number of slash events.
func (s *Store) GetSlashCount() int {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return len(s.slashEvents)
}

// GetSlashEventsForNode returns all slash events for a specific node.
func (s *Store) GetSlashEventsForNode(nodeID string) []SlashEvent {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var events []SlashEvent
	for _, e := range s.slashEvents {
		if e.Node == nodeID {
			events = append(events, e)
		}
	}
	return events
}

// =============================================================================
// Heartbeat Event Operations
// =============================================================================

// RecordHeartbeat records a heartbeat event.
func (s *Store) RecordHeartbeat(nodeID string, vramUsed, vramTotal, latency uint64) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.heartbeats = append(s.heartbeats, HeartbeatEvent{
		NodeID:   nodeID,
		VRAMUsed: vramUsed,
		VRAMTotal: vramTotal,
		Latency:  latency,
		Timestamp: time.Now(),
	})
}

// GetHeartbeats returns all heartbeat events.
func (s *Store) GetHeartbeats() []HeartbeatEvent {
	s.mu.RLock()
	defer s.mu.RUnlock()
	events := make([]HeartbeatEvent, len(s.heartbeats))
	copy(events, s.heartbeats)
	return events
}

// GetHeartbeatCount returns the number of heartbeats.
func (s *Store) GetHeartbeatCount() int {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return len(s.heartbeats)
}

// GetHeartbeatsForNode returns all heartbeats for a specific node.
func (s *Store) GetHeartbeatsForNode(nodeID string) []HeartbeatEvent {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var events []HeartbeatEvent
	for _, e := range s.heartbeats {
		if e.NodeID == nodeID {
			events = append(events, e)
		}
	}
	return events
}

// GetLastHeartbeatForNode returns the most recent heartbeat for a node.
func (s *Store) GetLastHeartbeatForNode(nodeID string) (*HeartbeatEvent, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var last *HeartbeatEvent
	for _, e := range s.heartbeats {
		if e.NodeID == nodeID {
			if last == nil || e.Timestamp.After(last.Timestamp) {
				last = &e
			}
		}
	}
	return last, last != nil
}

// =============================================================================
// Snapshot & Restore (for test isolation)
// =============================================================================

// Snapshot creates a point-in-time snapshot of the store.
func (s *Store) Snapshot() *StoreSnapshot {
	s.mu.RLock()
	defer s.mu.RUnlock()

	snapshot := &StoreSnapshot{
		Nodes:      make(map[string]*types.Node),
		Jobs:       make(map[string]*types.Job),
		SLAs:       make(map[string]*types.SLABenchmark),
		SlashCount: len(s.slashEvents),
		HBCount:    len(s.heartbeats),
	}

	for k, v := range s.nodes {
		snapshot.Nodes[k] = v
	}
	for k, v := range s.jobs {
		snapshot.Jobs[k] = v
	}
	for k, v := range s.slas {
		snapshot.SLAs[k] = v
	}

	return snapshot
}

// StoreSnapshot holds a point-in-time snapshot.
type StoreSnapshot struct {
	Nodes      map[string]*types.Node
	Jobs       map[string]*types.Job
	SLAs       map[string]*types.SLABenchmark
	SlashCount int
	HBCount    int
}

// Diff compares a snapshot to current state.
func (s *Store) Diff(snap *StoreSnapshot) *StoreDiff {
	s.mu.RLock()
	defer s.mu.RUnlock()

	diff := &StoreDiff{}

	// Count new nodes
	for id := range s.nodes {
		if _, ok := snap.Nodes[id]; !ok {
			diff.NewNodes = append(diff.NewNodes, id)
		}
	}

	// Count new jobs
	for id := range s.jobs {
		if _, ok := snap.Jobs[id]; !ok {
			diff.NewJobs = append(diff.NewJobs, id)
		}
	}

	// Count new slash events
	diff.NewSlashEvents = len(s.slashEvents) - snap.SlashCount

	// Count new heartbeats
	diff.NewHeartbeats = len(s.heartbeats) - snap.HBCount

	return diff
}

// StoreDiff holds differences between snapshots.
type StoreDiff struct {
	NewNodes        []string
	NewJobs        []string
	NewSlashEvents int
	NewHeartbeats  int
}
