package orchestrator

import (
	"math/big"
	"testing"

	"github.com/tentrist.ai/backend/pkg/types"
)

func TestNewWorkloadSplitter(t *testing.T) {
	ws := NewWorkloadSplitter()
	if ws == nil {
		t.Fatal("expected non-nil WorkloadSplitter")
	}
	if ws.eligibleNodes == nil {
		t.Error("expected eligibleNodes to be initialized")
	}
}

func TestSetEligibleNodes(t *testing.T) {
	ws := NewWorkloadSplitter()

	nodes := []NodeCapacity{
		{NodeID: "node1", Reputation: big.NewInt(100), AvailableMB: 1000, IsOnline: true},
		{NodeID: "node2", Reputation: big.NewInt(200), AvailableMB: 2000, IsOnline: true},
	}

	ws.SetEligibleNodes(nodes)

	if len(ws.eligibleNodes) != 2 {
		t.Errorf("expected 2 nodes, got %d", len(ws.eligibleNodes))
	}
}

func TestSplitWorkload_NoEligibleNodes(t *testing.T) {
	ws := NewWorkloadSplitter()

	var jobID [32]byte
	job := &types.Job{
		ID:     jobID,
		Status: types.JobPending,
	}

	_, err := ws.SplitWorkload(job, 1000)
	if err == nil {
		t.Error("expected error when no eligible nodes")
	}
}

func TestSplitWorkload_NilJob(t *testing.T) {
	ws := NewWorkloadSplitter()
	ws.SetEligibleNodes([]NodeCapacity{
		{NodeID: "node1", AvailableMB: 1000, IsOnline: true},
	})

	_, err := ws.SplitWorkload(nil, 1000)
	if err == nil {
		t.Error("expected error for nil job")
	}
}

func TestSplitWorkload_SingleNode(t *testing.T) {
	ws := NewWorkloadSplitter()
	ws.SetEligibleNodes([]NodeCapacity{
		{NodeID: "node1", Reputation: big.NewInt(100), AvailableMB: 1000, IsOnline: true},
	})

	var jobID [32]byte
	job := &types.Job{
		ID:     jobID,
		Status: types.JobPending,
	}

	units, err := ws.SplitWorkload(job, 1000)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(units) != 1 {
		t.Errorf("expected 1 work unit, got %d", len(units))
	}

	if units[0].TotalUnits != 1 {
		t.Errorf("expected TotalUnits=1, got %d", units[0].TotalUnits)
	}

	if units[0].UnitIndex != 0 {
		t.Errorf("expected UnitIndex=0, got %d", units[0].UnitIndex)
	}
}

func TestSplitWorkload_MultipleNodes(t *testing.T) {
	ws := NewWorkloadSplitter()
	ws.SetEligibleNodes([]NodeCapacity{
		{NodeID: "node1", Reputation: big.NewInt(100), AvailableMB: 1000, IsOnline: true},
		{NodeID: "node2", Reputation: big.NewInt(200), AvailableMB: 2000, IsOnline: true},
		{NodeID: "node3", Reputation: big.NewInt(150), AvailableMB: 1500, IsOnline: true},
	})

	var jobID [32]byte
	job := &types.Job{
		ID:     jobID,
		Status: types.JobPending,
	}

	units, err := ws.SplitWorkload(job, 9000)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(units) != 3 {
		t.Errorf("expected 3 work units, got %d", len(units))
	}

	// Verify each unit has correct metadata
	for i, unit := range units {
		if unit.UnitIndex != i {
			t.Errorf("unit %d: expected UnitIndex=%d, got %d", i, i, unit.UnitIndex)
		}
		if unit.TotalUnits != 3 {
			t.Errorf("unit %d: expected TotalUnits=3, got %d", i, unit.TotalUnits)
		}
		if unit.IsAssigned {
			t.Errorf("unit %d: expected IsAssigned=false", i)
		}
	}
}

func TestSplitWorkload_OfflineNodesFiltered(t *testing.T) {
	ws := NewWorkloadSplitter()
	ws.SetEligibleNodes([]NodeCapacity{
		{NodeID: "node1", Reputation: big.NewInt(100), AvailableMB: 1000, IsOnline: false},
		{NodeID: "node2", Reputation: big.NewInt(200), AvailableMB: 2000, IsOnline: true},
		{NodeID: "node3", Reputation: big.NewInt(150), AvailableMB: 0, IsOnline: true},
	})

	var jobID [32]byte
	job := &types.Job{
		ID:     jobID,
		Status: types.JobPending,
	}

	units, err := ws.SplitWorkload(job, 1000)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Only node2 is online with available capacity
	if len(units) != 1 {
		t.Errorf("expected 1 work unit (only online node), got %d", len(units))
	}
}

func TestAssignWorkUnit(t *testing.T) {
	ws := NewWorkloadSplitter()
	ws.SetEligibleNodes([]NodeCapacity{
		{NodeID: "node1", Reputation: big.NewInt(100), AvailableMB: 1000, IsOnline: true},
	})

	var jobID [32]byte
	job := &types.Job{
		ID:     jobID,
		Status: types.JobPending,
	}

	units, err := ws.SplitWorkload(job, 1000)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	err = ws.AssignWorkUnit(&units[0], "node1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !units[0].IsAssigned {
		t.Error("expected IsAssigned=true after assignment")
	}

	if units[0].NodeID != "node1" {
		t.Errorf("expected NodeID=node1, got %s", units[0].NodeID)
	}
}

func TestAssignWorkUnit_UnknownNode(t *testing.T) {
	ws := NewWorkloadSplitter()
	ws.SetEligibleNodes([]NodeCapacity{
		{NodeID: "node1", Reputation: big.NewInt(100), AvailableMB: 1000, IsOnline: true},
	})

	var jobID [32]byte
	job := &types.Job{
		ID:     jobID,
		Status: types.JobPending,
	}

	units, err := ws.SplitWorkload(job, 1000)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	err = ws.AssignWorkUnit(&units[0], "unknown-node")
	if err == nil {
		t.Error("expected error for unknown node")
	}
}

func TestAssignWorkUnit_NilUnit(t *testing.T) {
	ws := NewWorkloadSplitter()
	ws.SetEligibleNodes([]NodeCapacity{
		{NodeID: "node1", Reputation: big.NewInt(100), AvailableMB: 1000, IsOnline: true},
	})

	err := ws.AssignWorkUnit(nil, "node1")
	if err == nil {
		t.Error("expected error for nil work unit")
	}
}

func TestAssignWorkUnit_EmptyNodeID(t *testing.T) {
	ws := NewWorkloadSplitter()
	ws.SetEligibleNodes([]NodeCapacity{
		{NodeID: "node1", Reputation: big.NewInt(100), AvailableMB: 1000, IsOnline: true},
	})

	var jobID [32]byte
	job := &types.Job{
		ID:     jobID,
		Status: types.JobPending,
	}

	units, err := ws.SplitWorkload(job, 1000)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	err = ws.AssignWorkUnit(&units[0], "")
	if err == nil {
		t.Error("expected error for empty node ID")
	}
}

func TestGetNodeForUnit(t *testing.T) {
	ws := NewWorkloadSplitter()
	ws.SetEligibleNodes([]NodeCapacity{
		{NodeID: "node1", Reputation: big.NewInt(100), AvailableMB: 1000, IsOnline: true},
		{NodeID: "node2", Reputation: big.NewInt(200), AvailableMB: 2000, IsOnline: true},
	})

	nodeID, err := ws.GetNodeForUnit(0)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if nodeID == "" {
		t.Error("expected non-empty node ID")
	}
}

func TestGetNodeForUnit_OutOfRange(t *testing.T) {
	ws := NewWorkloadSplitter()
	ws.SetEligibleNodes([]NodeCapacity{
		{NodeID: "node1", Reputation: big.NewInt(100), AvailableMB: 1000, IsOnline: true},
	})

	_, err := ws.GetNodeForUnit(10)
	if err == nil {
		t.Error("expected error for out of range index")
	}
}

func TestCalculateLoadDistribution(t *testing.T) {
	ws := NewWorkloadSplitter()
	ws.SetEligibleNodes([]NodeCapacity{
		{NodeID: "node1", Reputation: big.NewInt(100), AvailableMB: 1000, IsOnline: true},
		{NodeID: "node2", Reputation: big.NewInt(200), AvailableMB: 2000, IsOnline: true},
		{NodeID: "node3", Reputation: big.NewInt(150), AvailableMB: 1500, IsOnline: true},
	})

	distribution, err := ws.CalculateLoadDistribution(10)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(distribution) != 3 {
		t.Errorf("expected distribution for 3 nodes, got %d", len(distribution))
	}

	// Each online node should get at least 1 unit
	for nodeID, units := range distribution {
		if units < 1 {
			t.Errorf("node %s: expected at least 1 unit, got %d", nodeID, units)
		}
	}
}

func TestCalculateLoadDistribution_ZeroUnits(t *testing.T) {
	ws := NewWorkloadSplitter()
	ws.SetEligibleNodes([]NodeCapacity{
		{NodeID: "node1", Reputation: big.NewInt(100), AvailableMB: 1000, IsOnline: true},
	})

	_, err := ws.CalculateLoadDistribution(0)
	if err == nil {
		t.Error("expected error for zero units")
	}
}

func TestCalculateLoadDistribution_NoNodes(t *testing.T) {
	ws := NewWorkloadSplitter()

	_, err := ws.CalculateLoadDistribution(10)
	if err == nil {
		t.Error("expected error when no nodes available")
	}
}
