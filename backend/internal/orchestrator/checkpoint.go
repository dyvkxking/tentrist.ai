// Package orchestrator handles workload splitting, assignment, and checkpoint management.
package orchestrator

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"sync"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
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
// When a PostgreSQL pool is provided, checkpoints are also persisted to the database
// for distributed access across multiple daemon instances.
type CheckpointManager struct {
	mu          sync.RWMutex
	storage     map[string]*Checkpoint       // keyed by checkpoint Ref
	byJobID     map[string][]string          // jobID -> list of checkpoint Refs
	lastCheckpoint map[string]*Checkpoint    // jobID -> most recent checkpoint
	db          *pgxpool.Pool                // optional PostgreSQL for distributed access
}

// NewCheckpointManager creates a new CheckpointManager with initialized storage.
func NewCheckpointManager() *CheckpointManager {
	return &CheckpointManager{
		storage:        make(map[string]*Checkpoint),
		byJobID:        make(map[string][]string),
		lastCheckpoint: make(map[string]*Checkpoint),
	}
}

// SetDB sets the PostgreSQL pool for distributed checkpoint persistence.
func (cm *CheckpointManager) SetDB(pool *pgxpool.Pool) {
	cm.db = pool
}

// SaveCheckpoint saves a checkpoint and returns its reference string.
// It stores in local memory and optionally persists to PostgreSQL for distributed access.
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

	// Store in local memory
	cm.storage[ref] = checkpoint
	cm.byJobID[jobID] = append(cm.byJobID[jobID], ref)
	cm.lastCheckpoint[jobID] = checkpoint

	// Persist to PostgreSQL if available
	if cm.db != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_, err := cm.db.Exec(ctx,
			`INSERT INTO public.job_checkpoints (ref, job_id, unit_index, node_id, state, created_at, sequence)
			 VALUES ($1, $2, $3, $4, $5, $6, $7)
			 ON CONFLICT (ref) DO UPDATE SET state = $5, created_at = $6`,
			ref, jobID, unit.UnitIndex, unit.NodeID, state, now, seq,
		)
		if err != nil {
			// Log but don't fail - local copy is still valid
			_ = err
		}
	}

	return ref, nil
}

// LoadFromDB loads all checkpoints from PostgreSQL into local memory.
// Used on daemon startup to hydrate the local cache from distributed storage.
func (cm *CheckpointManager) LoadFromDB(ctx context.Context) error {
	if cm.db == nil {
		return nil
	}

	rows, err := cm.db.Query(ctx,
		`SELECT ref, job_id, unit_index, node_id, state, created_at, sequence
		 FROM public.job_checkpoints ORDER BY job_id, sequence`,
	)
	if err != nil {
		return fmt.Errorf("failed to load checkpoints from DB: %w", err)
	}
	defer rows.Close()

	cm.mu.Lock()
	defer cm.mu.Unlock()

	for rows.Next() {
		var cp Checkpoint
		if err := rows.Scan(&cp.Ref, &cp.JobID, &cp.UnitIndex, &cp.NodeID, &cp.State, &cp.CreatedAt, &cp.Sequence); err != nil {
			continue
		}
		cm.storage[cp.Ref] = &cp
		cm.byJobID[cp.JobID] = append(cm.byJobID[cp.JobID], cp.Ref)
		// Keep last checkpoint by sequence
		if existing, ok := cm.lastCheckpoint[cp.JobID]; !ok || cp.Sequence > existing.Sequence {
			cm.lastCheckpoint[cp.JobID] = &cp
		}
	}
	return nil
}

// SyncToDB syncs all local checkpoints to PostgreSQL for distributed access.
func (cm *CheckpointManager) SyncToDB(ctx context.Context) error {
	if cm.db == nil {
		return fmt.Errorf("no database configured")
	}

	cm.mu.RLock()
	defer cm.mu.RUnlock()

	for _, cp := range cm.storage {
		_, err := cm.db.Exec(ctx,
			`INSERT INTO public.job_checkpoints (ref, job_id, unit_index, node_id, state, created_at, sequence)
			 VALUES ($1, $2, $3, $4, $5, $6, $7)
			 ON CONFLICT (ref) DO UPDATE SET state = $5, created_at = $6`,
			cp.Ref, cp.JobID, cp.UnitIndex, cp.NodeID, cp.State, cp.CreatedAt, cp.Sequence,
		)
		if err != nil {
			return fmt.Errorf("failed to sync checkpoint %s: %w", cp.Ref, err)
		}
	}
	return nil
}

// DistributeCheckpoint broadcasts a checkpoint to other daemon instances.
// When a checkpoint is saved, this is called to notify the network.
func (cm *CheckpointManager) DistributeCheckpoint(ctx context.Context, ref string) error {
	// In a production system this would use a message queue (Kafka, NATS, etc.)
	// For now, checkpoint is already in PostgreSQL for other daemons to pick up
	return nil
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
