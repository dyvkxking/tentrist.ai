// Package orchestrator handles workload splitting, assignment, and checkpoint management.
package orchestrator

import (
	"fmt"
	"math/big"
	"sort"

	"github.com/tentrist.ai/backend/pkg/types"
)

// WorkUnit represents a partitioned unit of work assigned to a node.
type WorkUnit struct {
	JobID       string       // the parent job ID
	UnitIndex   int          // index of this unit within the job
	TotalUnits  int          // total number of units the job is split into
	NodeID      string       // assigned node ID (empty if not yet assigned)
	State       []byte       // current state/data for this unit
	StartOffset int          // byte offset start within the original job data
	EndOffset   int          // byte offset end within the original job data
	IsAssigned  bool         // whether this unit has been assigned to a node
}

// NodeCapacity represents a node's capacity for workload assignment.
type NodeCapacity struct {
	NodeID      string
	Address    [20]byte
	Reputation *big.Int
	VRAMTotalMB uint64
	VRAMUsedMB  uint64
	AvailableMB uint64
	IsOnline    bool
}

// WorkloadSplitter partitions compute jobs across eligible GPU nodes.
type WorkloadSplitter struct {
	eligibleNodes []NodeCapacity
}

// NewWorkloadSplitter creates a new WorkloadSplitter.
func NewWorkloadSplitter() *WorkloadSplitter {
	return &WorkloadSplitter{
		eligibleNodes: make([]NodeCapacity, 0),
	}
}

// SetEligibleNodes sets the list of eligible nodes for workload distribution.
func (ws *WorkloadSplitter) SetEligibleNodes(nodes []NodeCapacity) {
	ws.eligibleNodes = nodes
}

// GetEligibleNodes returns the current list of eligible nodes.
func (ws *WorkloadSplitter) GetEligibleNodes() []NodeCapacity {
	return ws.eligibleNodes
}

// SplitWorkload partitions a job into WorkUnits based on available node capacity.
// It distributes work units to nodes based on their available VRAM, prioritizing
// nodes with higher reputation scores when capacity is equal.
func (ws *WorkloadSplitter) SplitWorkload(job *types.Job, totalBytes int) ([]WorkUnit, error) {
	if job == nil {
		return nil, fmt.Errorf("job cannot be nil")
	}

	if len(ws.eligibleNodes) == 0 {
		return nil, fmt.Errorf("no eligible nodes available")
	}

	// Filter to only online nodes with available capacity
	var onlineNodes []NodeCapacity
	for _, n := range ws.eligibleNodes {
		if n.IsOnline && n.AvailableMB > 0 {
			onlineNodes = append(onlineNodes, n)
		}
	}

	if len(onlineNodes) == 0 {
		return nil, fmt.Errorf("no online nodes with available capacity")
	}

	// Sort nodes by available capacity (descending), then by reputation (descending)
	sort.Slice(onlineNodes, func(i, j int) bool {
		if onlineNodes[i].AvailableMB != onlineNodes[j].AvailableMB {
			return onlineNodes[i].AvailableMB > onlineNodes[j].AvailableMB
		}
		return onlineNodes[i].Reputation.Cmp(onlineNodes[j].Reputation) > 0
	})

	// Calculate total available capacity
	var totalCapacity uint64
	for _, n := range onlineNodes {
		totalCapacity += n.AvailableMB
	}

	if totalCapacity == 0 {
		return nil, fmt.Errorf("total available capacity is zero")
	}

	// Determine number of units based on node count
	numUnits := len(onlineNodes)

	// Create work units
	workUnits := make([]WorkUnit, 0, numUnits)
	bytesPerNode := totalBytes / len(onlineNodes)
	remainder := totalBytes % len(onlineNodes)

	for i := range onlineNodes {
		startOffset := i * bytesPerNode
		endOffset := startOffset + bytesPerNode
		if i == len(onlineNodes)-1 {
			endOffset += remainder // last node gets remainder
		}

		unit := WorkUnit{
			JobID:       string(job.ID[:]),
			UnitIndex:   i,
			TotalUnits:  numUnits,
			NodeID:      "", // not assigned yet
			State:       nil,
			StartOffset: startOffset,
			EndOffset:   endOffset,
			IsAssigned:  false,
		}
		workUnits = append(workUnits, unit)
	}

	return workUnits, nil
}

// AssignWorkUnit assigns a work unit to a specific node.
func (ws *WorkloadSplitter) AssignWorkUnit(unit *WorkUnit, nodeID string) error {
	if unit == nil {
		return fmt.Errorf("work unit cannot be nil")
	}

	if nodeID == "" {
		return fmt.Errorf("node ID cannot be empty")
	}

	// Verify node exists in eligible list
	found := false
	for _, n := range ws.eligibleNodes {
		if n.NodeID == nodeID {
			found = true
			break
		}
	}

	if !found {
		return fmt.Errorf("node %s is not in the eligible nodes list", nodeID)
	}

	unit.NodeID = nodeID
	unit.IsAssigned = true

	return nil
}

// GetNodeForUnit returns the node that should handle a work unit based on capacity.
func (ws *WorkloadSplitter) GetNodeForUnit(unitIndex int) (string, error) {
	if unitIndex < 0 || unitIndex >= len(ws.eligibleNodes) {
		return "", fmt.Errorf("unit index out of range")
	}

	// Filter online nodes
	var onlineNodes []NodeCapacity
	for _, n := range ws.eligibleNodes {
		if n.IsOnline && n.AvailableMB > 0 {
			onlineNodes = append(onlineNodes, n)
		}
	}

	if len(onlineNodes) == 0 {
		return "", fmt.Errorf("no online nodes available")
	}

	// Sort by capacity then reputation
	sort.Slice(onlineNodes, func(i, j int) bool {
		if onlineNodes[i].AvailableMB != onlineNodes[j].AvailableMB {
			return onlineNodes[i].AvailableMB > onlineNodes[j].AvailableMB
		}
		return onlineNodes[i].Reputation.Cmp(onlineNodes[j].Reputation) > 0
	})

	idx := unitIndex % len(onlineNodes)
	return onlineNodes[idx].NodeID, nil
}

// CalculateLoadDistribution calculates how many work units each node should handle.
func (ws *WorkloadSplitter) CalculateLoadDistribution(totalUnits int) (map[string]int, error) {
	if totalUnits <= 0 {
		return nil, fmt.Errorf("total units must be positive")
	}

	if len(ws.eligibleNodes) == 0 {
		return nil, fmt.Errorf("no eligible nodes")
	}

	// Filter online nodes
	var onlineNodes []NodeCapacity
	for _, n := range ws.eligibleNodes {
		if n.IsOnline {
			onlineNodes = append(onlineNodes, n)
		}
	}

	if len(onlineNodes) == 0 {
		return nil, fmt.Errorf("no online nodes")
	}

	// Calculate total capacity
	var totalCapacity uint64
	for _, n := range onlineNodes {
		totalCapacity += n.AvailableMB
	}

	if totalCapacity == 0 {
		return nil, fmt.Errorf("total capacity is zero")
	}

	distribution := make(map[string]int)
	for _, node := range onlineNodes {
		ratio := float64(node.AvailableMB) / float64(totalCapacity)
		units := int(float64(totalUnits) * ratio)
		if units < 1 {
			units = 1 // minimum 1 unit per online node
		}
		distribution[node.NodeID] = units
	}

	return distribution, nil
}
