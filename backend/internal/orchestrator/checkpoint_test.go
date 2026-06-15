package orchestrator

import (
	"sync"
	"testing"
)

func TestNewCheckpointManager(t *testing.T) {
	cm := NewCheckpointManager()
	if cm == nil {
		t.Fatal("expected non-nil CheckpointManager")
	}
	if cm.storage == nil {
		t.Error("expected storage to be initialized")
	}
	if cm.byJobID == nil {
		t.Error("expected byJobID to be initialized")
	}
	if cm.lastCheckpoint == nil {
		t.Error("expected lastCheckpoint to be initialized")
	}
}

func TestSaveCheckpoint(t *testing.T) {
	cm := NewCheckpointManager()

	unit := WorkUnit{
		JobID:     "job1",
		UnitIndex: 0,
		NodeID:    "node1",
	}

	ref, err := cm.SaveCheckpoint("job1", unit, []byte("state data"))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if ref == "" {
		t.Error("expected non-empty checkpoint reference")
	}

	if cm.GetCheckpointCount() != 1 {
		t.Errorf("expected 1 checkpoint, got %d", cm.GetCheckpointCount())
	}
}

func TestSaveCheckpoint_EmptyJobID(t *testing.T) {
	cm := NewCheckpointManager()

	unit := WorkUnit{JobID: "", UnitIndex: 0}

	_, err := cm.SaveCheckpoint("", unit, []byte("state"))
	if err == nil {
		t.Error("expected error for empty jobID")
	}
}

func TestSaveCheckpoint_NilState(t *testing.T) {
	cm := NewCheckpointManager()

	unit := WorkUnit{JobID: "job1", UnitIndex: 0}

	ref, err := cm.SaveCheckpoint("job1", unit, nil)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if ref == "" {
		t.Error("expected non-empty reference")
	}

	cp, err := cm.GetCheckpoint(ref)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if cp.State == nil {
		t.Error("expected non-nil state (empty slice)")
	}
}

func TestSaveCheckpoint_MultipleCheckpoints(t *testing.T) {
	cm := NewCheckpointManager()

	// Save multiple checkpoints for the same job
	for i := 0; i < 3; i++ {
		unit := WorkUnit{JobID: "job1", UnitIndex: i, NodeID: "node1"}
		_, err := cm.SaveCheckpoint("job1", unit, []byte("state"))
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
	}

	if cm.GetCheckpointCount() != 3 {
		t.Errorf("expected 3 checkpoints, got %d", cm.GetCheckpointCount())
	}

	if cm.GetJobCount() != 1 {
		t.Errorf("expected 1 job, got %d", cm.GetJobCount())
	}
}

func TestGetCheckpoint(t *testing.T) {
	cm := NewCheckpointManager()

	unit := WorkUnit{JobID: "job1", UnitIndex: 0, NodeID: "node1"}
	originalRef, _ := cm.SaveCheckpoint("job1", unit, []byte("test state"))

	cp, err := cm.GetCheckpoint(originalRef)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if cp.JobID != "job1" {
		t.Errorf("expected JobID=job1, got %s", cp.JobID)
	}

	if cp.UnitIndex != 0 {
		t.Errorf("expected UnitIndex=0, got %d", cp.UnitIndex)
	}

	if string(cp.State) != "test state" {
		t.Errorf("expected State='test state', got '%s'", string(cp.State))
	}
}

func TestGetCheckpoint_NotFound(t *testing.T) {
	cm := NewCheckpointManager()

	_, err := cm.GetCheckpoint("nonexistent-ref")
	if err == nil {
		t.Error("expected error for nonexistent checkpoint")
	}
}

func TestGetCheckpoint_EmptyRef(t *testing.T) {
	cm := NewCheckpointManager()

	_, err := cm.GetCheckpoint("")
	if err == nil {
		t.Error("expected error for empty reference")
	}
}

func TestGetLastCheckpoint(t *testing.T) {
	cm := NewCheckpointManager()

	// Save multiple checkpoints
	for i := 0; i < 3; i++ {
		unit := WorkUnit{JobID: "job1", UnitIndex: i, NodeID: "node1"}
		cm.SaveCheckpoint("job1", unit, []byte("state"))
	}

	last, err := cm.GetLastCheckpoint("job1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if last.UnitIndex != 2 {
		t.Errorf("expected last checkpoint UnitIndex=2, got %d", last.UnitIndex)
	}

	if last.Sequence != 3 {
		t.Errorf("expected last checkpoint Sequence=3, got %d", last.Sequence)
	}
}

func TestGetLastCheckpoint_NoCheckpoints(t *testing.T) {
	cm := NewCheckpointManager()

	_, err := cm.GetLastCheckpoint("nonexistent-job")
	if err == nil {
		t.Error("expected error for nonexistent job")
	}
}

func TestGetCheckpointsForJob(t *testing.T) {
	cm := NewCheckpointManager()

	// Save checkpoints for two different jobs
	for i := 0; i < 3; i++ {
		unit := WorkUnit{JobID: "job1", UnitIndex: i, NodeID: "node1"}
		cm.SaveCheckpoint("job1", unit, []byte("state"))
	}

	for i := 0; i < 2; i++ {
		unit := WorkUnit{JobID: "job2", UnitIndex: i, NodeID: "node2"}
		cm.SaveCheckpoint("job2", unit, []byte("state"))
	}

	checkpoints, err := cm.GetCheckpointsForJob("job1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(checkpoints) != 3 {
		t.Errorf("expected 3 checkpoints for job1, got %d", len(checkpoints))
	}
}

func TestGetCheckpointsForJob_EmptyJobID(t *testing.T) {
	cm := NewCheckpointManager()

	_, err := cm.GetCheckpointsForJob("")
	if err == nil {
		t.Error("expected error for empty jobID")
	}
}

func TestClearCheckpoints(t *testing.T) {
	cm := NewCheckpointManager()

	// Save checkpoints
	for i := 0; i < 3; i++ {
		unit := WorkUnit{JobID: "job1", UnitIndex: i, NodeID: "node1"}
		cm.SaveCheckpoint("job1", unit, []byte("state"))
	}

	err := cm.ClearCheckpoints("job1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if cm.GetCheckpointCount() != 0 {
		t.Errorf("expected 0 checkpoints after clear, got %d", cm.GetCheckpointCount())
	}

	if cm.GetJobCount() != 0 {
		t.Errorf("expected 0 jobs after clear, got %d", cm.GetJobCount())
	}
}

func TestClearCheckpoints_NoExist(t *testing.T) {
	cm := NewCheckpointManager()

	err := cm.ClearCheckpoints("nonexistent-job")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestClearCheckpoints_EmptyJobID(t *testing.T) {
	cm := NewCheckpointManager()

	err := cm.ClearCheckpoints("")
	if err == nil {
		t.Error("expected error for empty jobID")
	}
}

func TestCheckpointManager_ConcurrentAccess(t *testing.T) {
	cm := NewCheckpointManager()

	var wg sync.WaitGroup

	// Concurrent writes
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func(jobNum int) {
			defer wg.Done()
			for j := 0; j < 10; j++ {
				unit := WorkUnit{JobID: "job", UnitIndex: j, NodeID: "node1"}
				cm.SaveCheckpoint("job", unit, []byte("state"))
			}
		}(i)
	}

	wg.Wait()

	// Just verify no panic and data is consistent
	count := cm.GetCheckpointCount()
	if count == 0 {
		t.Error("expected some checkpoints after concurrent writes")
	}
}

func TestCheckpoint_CopyIsolation(t *testing.T) {
	cm := NewCheckpointManager()

	unit := WorkUnit{JobID: "job1", UnitIndex: 0, NodeID: "node1"}
	ref, _ := cm.SaveCheckpoint("job1", unit, []byte("original state"))

	// Get checkpoint and modify returned copy
	cp, _ := cm.GetCheckpoint(ref)
	cp.State = []byte("modified state")

	// Get again and verify original is unchanged
	cp2, _ := cm.GetCheckpoint(ref)
	if string(cp2.State) != "original state" {
		t.Errorf("expected original state, got '%s'", string(cp2.State))
	}
}
