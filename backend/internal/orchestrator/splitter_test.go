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
		// Non-serverless jobs without AssignedNodes still get assigned in fallback path
		if !unit.IsAssigned {
			t.Errorf("unit %d: expected IsAssigned=true in fallback path", i)
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

// =============================================================================
// Serverless Load Balancing Tests
// =============================================================================

func TestGetServerlessNodes(t *testing.T) {
	ws := NewWorkloadSplitter()
	ws.SetEligibleNodes([]NodeCapacity{
		{NodeID: "serverless1", Reputation: big.NewInt(100), AvailableMB: 1000, IsOnline: true, IsReservedPool: false},
		{NodeID: "serverless2", Reputation: big.NewInt(200), AvailableMB: 2000, IsOnline: true, IsReservedPool: false},
		{NodeID: "dedicated1", Reputation: big.NewInt(300), AvailableMB: 500, IsOnline: true, IsReservedPool: true},
		{NodeID: "offline1", Reputation: big.NewInt(400), AvailableMB: 1000, IsOnline: false, IsReservedPool: false},
	})

	serverless := ws.GetServerlessNodes()

	// Should only return serverless nodes (IsReservedPool == false, online, available)
	if len(serverless) != 2 {
		t.Errorf("expected 2 serverless nodes, got %d", len(serverless))
	}

	for _, n := range serverless {
		if n.IsReservedPool {
			t.Errorf("node %s should be serverless (IsReservedPool=false), got true", n.NodeID)
		}
	}
}

func TestGetDedicatedNodes(t *testing.T) {
	ws := NewWorkloadSplitter()
	ws.SetEligibleNodes([]NodeCapacity{
		{NodeID: "serverless1", Reputation: big.NewInt(100), AvailableMB: 1000, IsOnline: true, IsReservedPool: false},
		{NodeID: "dedicated1", Reputation: big.NewInt(300), AvailableMB: 500, IsOnline: true, IsReservedPool: true},
		{NodeID: "dedicated2", Reputation: big.NewInt(400), AvailableMB: 500, IsOnline: true, IsReservedPool: true},
	})

	// Query for specific dedicated nodes
	dedicated := ws.GetDedicatedNodes([]string{"dedicated1", "dedicated2"})

	if len(dedicated) != 2 {
		t.Errorf("expected 2 dedicated nodes, got %d", len(dedicated))
	}
}

func TestSplitWorkload_ServerlessLoadBalancing(t *testing.T) {
	ws := NewWorkloadSplitter()
	// 3 serverless standby nodes with different reputation/latency
	ws.SetEligibleNodes([]NodeCapacity{
		{NodeID: "standby1", Reputation: big.NewInt(100), AvailableMB: 1000, IsOnline: true, IsReservedPool: false, ActiveLatencyMs: 50},
		{NodeID: "standby2", Reputation: big.NewInt(200), AvailableMB: 1000, IsOnline: true, IsReservedPool: false, ActiveLatencyMs: 30},
		{NodeID: "standby3", Reputation: big.NewInt(150), AvailableMB: 1000, IsOnline: true, IsReservedPool: false, ActiveLatencyMs: 20},
	})

	// Serverless job (no AssignedNodes, IsServerless = true)
	var jobID [32]byte
	job := &types.Job{
		ID:          jobID,
		Status:      types.JobRunning,
		IsServerless: true,
	}

	units, err := ws.SplitWorkload(job, 3000)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Should distribute across all 3 serverless standby nodes
	if len(units) != 3 {
		t.Errorf("expected 3 work units, got %d", len(units))
	}

	// Verify all units are assigned to serverless nodes
	nodeIDs := make(map[string]bool)
	for _, unit := range units {
		if !unit.IsAssigned {
			t.Errorf("unit %d: expected IsAssigned=true", unit.UnitIndex)
		}
		if unit.IsDedicated {
			t.Errorf("unit %d: expected IsDedicated=false for serverless job", unit.UnitIndex)
		}
		nodeIDs[unit.NodeID] = true
	}

	// All 3 different standby nodes should be used
	if len(nodeIDs) != 3 {
		t.Errorf("expected work distributed across 3 nodes, got %d unique nodes", len(nodeIDs))
	}
}

func TestSplitWorkload_DedicatedEnterpriseRouting(t *testing.T) {
	ws := NewWorkloadSplitter()

	// Create dedicated nodes with proper addresses that match job's AssignedNodes
	dedicated1Addr := [20]byte{0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11}
	dedicated2Addr := [20]byte{0x22, 0x22, 0x22, 0x22, 0x22, 0x22, 0x22, 0x22, 0x22, 0x22, 0x22, 0x22, 0x22, 0x22, 0x22, 0x22, 0x22, 0x22, 0x22, 0x22}

	ws.SetEligibleNodes([]NodeCapacity{
		{NodeID: "standby1", Reputation: big.NewInt(100), AvailableMB: 1000, IsOnline: true, IsReservedPool: false, ActiveLatencyMs: 50, Address: dedicated1Addr},
		{NodeID: "dedicated1", Reputation: big.NewInt(300), AvailableMB: 500, IsOnline: true, IsReservedPool: true, Address: dedicated1Addr},
		{NodeID: "dedicated2", Reputation: big.NewInt(400), AvailableMB: 500, IsOnline: true, IsReservedPool: true, Address: dedicated2Addr},
	})

	// Enterprise job with assigned dedicated nodes
	var jobID [32]byte
	job := &types.Job{
		ID:            jobID,
		Status:        types.JobRunning,
		AssignedNodes: [][20]byte{dedicated1Addr},
		IsServerless: false,
	}

	units, err := ws.SplitWorkload(job, 1000)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Should route only to dedicated nodes
	if len(units) != 1 {
		t.Errorf("expected 1 work unit for dedicated job, got %d", len(units))
	}

	// Unit should be marked as dedicated
	if !units[0].IsDedicated {
		t.Errorf("unit: expected IsDedicated=true for enterprise job")
	}
}

func TestGetBestNode_LowestLatency(t *testing.T) {
	ws := NewWorkloadSplitter()
	ws.SetEligibleNodes([]NodeCapacity{
		{NodeID: "slow1", Reputation: big.NewInt(100), AvailableMB: 1000, IsOnline: true, IsReservedPool: false, ActiveLatencyMs: 100},
		{NodeID: "fast1", Reputation: big.NewInt(50), AvailableMB: 1000, IsOnline: true, IsReservedPool: false, ActiveLatencyMs: 20},
		{NodeID: "fast2", Reputation: big.NewInt(150), AvailableMB: 1000, IsOnline: true, IsReservedPool: false, ActiveLatencyMs: 30},
	})

	bestNode, err := ws.GetBestNode()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Should return the node with lowest latency (fast1 = 20ms)
	if bestNode != "fast1" {
		t.Errorf("expected best node 'fast1' (lowest latency), got '%s'", bestNode)
	}
}

func TestGetNodesByLatency(t *testing.T) {
	ws := NewWorkloadSplitter()
	ws.SetEligibleNodes([]NodeCapacity{
		{NodeID: "slow", Reputation: big.NewInt(100), AvailableMB: 1000, IsOnline: true, IsReservedPool: false, ActiveLatencyMs: 100},
		{NodeID: "fast", Reputation: big.NewInt(50), AvailableMB: 1000, IsOnline: true, IsReservedPool: false, ActiveLatencyMs: 20},
		{NodeID: "medium", Reputation: big.NewInt(150), AvailableMB: 1000, IsOnline: true, IsReservedPool: false, ActiveLatencyMs: 50},
	})

	nodes := ws.GetNodesByLatency()

	// Should be sorted by latency ascending (fastest first)
	if len(nodes) != 3 {
		t.Fatalf("expected 3 nodes, got %d", len(nodes))
	}

	if nodes[0].NodeID != "fast" {
		t.Errorf("expected first node 'fast' (lowest latency), got '%s'", nodes[0].NodeID)
	}
	if nodes[1].NodeID != "medium" {
		t.Errorf("expected second node 'medium', got '%s'", nodes[1].NodeID)
	}
	if nodes[2].NodeID != "slow" {
		t.Errorf("expected third node 'slow' (highest latency), got '%s'", nodes[2].NodeID)
	}
}

func TestGetNodesByReputation(t *testing.T) {
	ws := NewWorkloadSplitter()
	ws.SetEligibleNodes([]NodeCapacity{
		{NodeID: "lowrep", Reputation: big.NewInt(50), AvailableMB: 1000, IsOnline: true, IsReservedPool: false, ActiveLatencyMs: 20},
		{NodeID: "highrep", Reputation: big.NewInt(200), AvailableMB: 1000, IsOnline: true, IsReservedPool: false, ActiveLatencyMs: 30},
		{NodeID: "midrep", Reputation: big.NewInt(100), AvailableMB: 1000, IsOnline: true, IsReservedPool: false, ActiveLatencyMs: 10},
	})

	nodes := ws.GetNodesByReputation()

	// Should be sorted by reputation descending (highest first)
	if len(nodes) != 3 {
		t.Fatalf("expected 3 nodes, got %d", len(nodes))
	}

	if nodes[0].NodeID != "highrep" {
		t.Errorf("expected first node 'highrep' (highest reputation), got '%s'", nodes[0].NodeID)
	}
	if nodes[1].NodeID != "midrep" {
		t.Errorf("expected second node 'midrep', got '%s'", nodes[1].NodeID)
	}
	if nodes[2].NodeID != "lowrep" {
		t.Errorf("expected third node 'lowrep' (lowest reputation), got '%s'", nodes[2].NodeID)
	}
}

func TestSplitWorkload_ServerlessVsDedicatedRouting(t *testing.T) {
	dedicatedAddr := [20]byte{0xdd, 0xdd, 0xdd, 0xdd, 0xdd, 0xdd, 0xdd, 0xdd, 0xdd, 0xdd, 0xdd, 0xdd, 0xdd, 0xdd, 0xdd, 0xdd, 0xdd, 0xdd, 0xdd, 0xdd}

	ws := NewWorkloadSplitter()
	ws.SetEligibleNodes([]NodeCapacity{
		{NodeID: "standby1", Reputation: big.NewInt(100), AvailableMB: 1000, IsOnline: true, IsReservedPool: false, ActiveLatencyMs: 50},
		{NodeID: "dedicated1", Reputation: big.NewInt(300), AvailableMB: 500, IsOnline: true, IsReservedPool: true, Address: dedicatedAddr},
	})

	t.Run("serverless job ignores dedicated nodes", func(t *testing.T) {
		var jobID [32]byte
		job := &types.Job{
			ID:          jobID,
			Status:      types.JobRunning,
			IsServerless: true, // Serverless job
		}

		units, err := ws.SplitWorkload(job, 1000)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		// Should route to standby (serverless) nodes only
		for _, unit := range units {
			if unit.NodeID == "dedicated1" {
				t.Error("serverless job should not route to dedicated nodes")
			}
		}
	})

	t.Run("dedicated job ignores standby nodes", func(t *testing.T) {
		var jobID [32]byte

		job := &types.Job{
			ID:            jobID,
			Status:        types.JobRunning,
			AssignedNodes: [][20]byte{dedicatedAddr},
			IsServerless:  false, // Dedicated job with assigned nodes
		}

		units, err := ws.SplitWorkload(job, 1000)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		// Should route to dedicated nodes only (not standby)
		if len(units) > 0 && units[0].NodeID == "standby1" {
			t.Error("dedicated job should not route to standby nodes")
		}
	})
}

func TestSplitWorkload_StatelessLoadDistribution(t *testing.T) {
	ws := NewWorkloadSplitter()
	// 5 standby nodes with varying reputation and latency
	ws.SetEligibleNodes([]NodeCapacity{
		{NodeID: "node1", Reputation: big.NewInt(100), AvailableMB: 1000, IsOnline: true, IsReservedPool: false, ActiveLatencyMs: 50},
		{NodeID: "node2", Reputation: big.NewInt(200), AvailableMB: 1000, IsOnline: true, IsReservedPool: false, ActiveLatencyMs: 30},
		{NodeID: "node3", Reputation: big.NewInt(150), AvailableMB: 1000, IsOnline: true, IsReservedPool: false, ActiveLatencyMs: 40},
		{NodeID: "node4", Reputation: big.NewInt(250), AvailableMB: 1000, IsOnline: true, IsReservedPool: false, ActiveLatencyMs: 20},
		{NodeID: "node5", Reputation: big.NewInt(175), AvailableMB: 1000, IsOnline: true, IsReservedPool: false, ActiveLatencyMs: 10},
	})

	// Submit a stateless job - workload is split across ALL standby nodes
	var jobID [32]byte
	job := &types.Job{
		ID:          jobID,
		Status:      types.JobRunning,
		IsServerless: true,
	}

	units, err := ws.SplitWorkload(job, 5000)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Workload should be split across all 5 standby nodes
	if len(units) != 5 {
		t.Errorf("expected 5 work units (one per node), got %d", len(units))
	}

	// Each node should get a work unit with progressively better offsets
	nodeIDs := make(map[string]bool)
	for _, unit := range units {
		nodeIDs[unit.NodeID] = true
		// Verify IsAssigned is true for serverless jobs
		if !unit.IsAssigned {
			t.Errorf("unit for node %s: expected IsAssigned=true", unit.NodeID)
		}
		// Verify IsDedicated is false for serverless jobs
		if unit.IsDedicated {
			t.Errorf("unit for node %s: expected IsDedicated=false", unit.NodeID)
		}
	}

	// All 5 different standby nodes should be used
	if len(nodeIDs) != 5 {
		t.Errorf("expected work distributed across 5 nodes, got %d unique nodes", len(nodeIDs))
	}

	// Best node (node5 with lowest latency) should get the first unit
	// Units are sorted by latency for serverless, so node5 (10ms) is first
	if units[0].NodeID != "node5" {
		t.Errorf("expected first unit to go to node5 (best latency), got %s", units[0].NodeID)
	}
}

func TestSplitWorkload_NoServerlessNodesAvailable(t *testing.T) {
	ws := NewWorkloadSplitter()
	// Only dedicated nodes
	ws.SetEligibleNodes([]NodeCapacity{
		{NodeID: "dedicated1", Reputation: big.NewInt(300), AvailableMB: 500, IsOnline: true, IsReservedPool: true},
	})

	var jobID [32]byte
	job := &types.Job{
		ID:          jobID,
		Status:      types.JobRunning,
		IsServerless: true, // Serverless job but no serverless nodes
	}

	_, err := ws.SplitWorkload(job, 1000)
	if err == nil {
		t.Error("expected error when no serverless standby nodes available")
	}
}
