// Package orchestrator handles workload splitting, assignment, and checkpoint management.
package orchestrator

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"sync"
	"time"
)

// Checkpoint represents a snapshot of work unit state at a specific point.
type Checkpoint struct {
	Ref       string    // unique reference for this checkpoint
	JobID     string    // the parent job ID
	UnitIndex int       // the work unit this checkpoint belongs to
	NodeID    string    // the node that created this checkpoint
	State     []byte    // checkpoint state data
	CreatedAt time.Time // when the checkpoint was created
	Sequence  int       // sequence number for ordering checkpoints
}

// CheckpointManager manages checkpoints for resumable compute jobs.
// It uses a thread-safe RWMutex map to store and retrieve checkpoints.
type CheckpointManager struct {
	mu          sync.RWMutex
	storage     map[string]*Checkpoint       // keyed by checkpoint Ref
	byJobID     map[string][]string          // jobID -> list of checkpoint Refs
	lastCheckpoint map[string]*Checkpoint    // jobID -> most recent checkpoint
}

// NewCheckpointManager creates a new CheckpointManager with initialized storage.
func NewCheckpointManager() *CheckpointManager {
	return &CheckpointManager{
		storage:        make(map[string]*Checkpoint),
		byJobID:        make(map[string][]string),
		lastCheckpoint: make(map[string]*Checkpoint),
	}
}

// SaveCheckpoint saves a checkpoint and returns its reference string.
func (cm *CheckpointManager) SaveCheckpoint(jobID string, unit WorkUnit, state []byte) (string, error) {
	if jobID == "" {
		return "", fmt.Errorf("jobID cannot be empty")
	}

	if state == nil {
		state = []byte{}
	}

	cm.mu.Lock()
	defer cm.mu.Unlock()

	// Generate checkpoint reference using hash of jobID + unitIndex + timestamp
	now := time.Now()
	hashInput := fmt.Sprintf("%s-%d-%d", jobID, unit.UnitIndex, now.UnixNano())
	hash := sha256.Sum256([]byte(hashInput))
	ref := hex.EncodeToString(hash[:])

	// Get next sequence number for this job
	seq := len(cm.byJobID[jobID]) + 1

	checkpoint := &Checkpoint{
		Ref:       ref,
		JobID:     jobID,
		UnitIndex: unit.UnitIndex,
		NodeID:    unit.NodeID,
		State:     state,
		CreatedAt: now,
		Sequence:  seq,
	}

	// Store checkpoint
	cm.storage[ref] = checkpoint
	cm.byJobID[jobID] = append(cm.byJobID[jobID], ref)
	cm.lastCheckpoint[jobID] = checkpoint

	return ref, nil
}

// GetCheckpoint retrieves a checkpoint by its reference.
func (cm *CheckpointManager) GetCheckpoint(ref string) (*Checkpoint, error) {
	if ref == "" {
		return nil, fmt.Errorf("checkpoint reference cannot be empty")
	}

	cm.mu.RLock()
	defer cm.mu.RUnlock()

	checkpoint, exists := cm.storage[ref]
	if !exists {
		return nil, fmt.Errorf("checkpoint with ref %s not found", ref)
	}

	// Return a copy to avoid race conditions
	copy := &Checkpoint{
		Ref:       checkpoint.Ref,
		JobID:     checkpoint.JobID,
		UnitIndex: checkpoint.UnitIndex,
		NodeID:    checkpoint.NodeID,
		State:     checkpoint.State,
		CreatedAt: checkpoint.CreatedAt,
		Sequence:  checkpoint.Sequence,
	}

	return copy, nil
}

// GetLastCheckpoint retrieves the most recent checkpoint for a job.
func (cm *CheckpointManager) GetLastCheckpoint(jobID string) (*Checkpoint, error) {
	if jobID == "" {
		return nil, fmt.Errorf("jobID cannot be empty")
	}

	cm.mu.RLock()
	defer cm.mu.RUnlock()

	checkpoint, exists := cm.lastCheckpoint[jobID]
	if !exists {
		return nil, fmt.Errorf("no checkpoints found for job %s", jobID)
	}

	// Return a copy
	copy := &Checkpoint{
		Ref:       checkpoint.Ref,
		JobID:     checkpoint.JobID,
		UnitIndex: checkpoint.UnitIndex,
		NodeID:    checkpoint.NodeID,
		State:     checkpoint.State,
		CreatedAt: checkpoint.CreatedAt,
		Sequence:  checkpoint.Sequence,
	}

	return copy, nil
}

// GetCheckpointsForJob returns all checkpoints for a given job.
func (cm *CheckpointManager) GetCheckpointsForJob(jobID string) ([]*Checkpoint, error) {
	if jobID == "" {
		return nil, fmt.Errorf("jobID cannot be empty")
	}

	cm.mu.RLock()
	defer cm.mu.RUnlock()

	refs, exists := cm.byJobID[jobID]
	if !exists {
		return nil, fmt.Errorf("no checkpoints found for job %s", jobID)
	}

	checkpoints := make([]*Checkpoint, 0, len(refs))
	for _, ref := range refs {
		if cp, ok := cm.storage[ref]; ok {
			checkpoints = append(checkpoints, cp)
		}
	}

	return checkpoints, nil
}

// ClearCheckpoints removes all checkpoints for a given job.
func (cm *CheckpointManager) ClearCheckpoints(jobID string) error {
	if jobID == "" {
		return fmt.Errorf("jobID cannot be empty")
	}

	cm.mu.Lock()
	defer cm.mu.Unlock()

	refs, exists := cm.byJobID[jobID]
	if !exists {
		return nil // nothing to clear
	}

	for _, ref := range refs {
		delete(cm.storage, ref)
	}

	delete(cm.byJobID, jobID)
	delete(cm.lastCheckpoint, jobID)

	return nil
}

// GetCheckpointCount returns the number of checkpoints stored.
func (cm *CheckpointManager) GetCheckpointCount() int {
	cm.mu.RLock()
	defer cm.mu.RUnlock()
	return len(cm.storage)
}

// GetJobCount returns the number of jobs with checkpoints.
func (cm *CheckpointManager) GetJobCount() int {
	cm.mu.RLock()
	defer cm.mu.RUnlock()
	return len(cm.byJobID)
}
