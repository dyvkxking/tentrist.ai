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
	IsDedicated bool         // true if routed to dedicated enterprise node
}

// NodeCapacity represents a node's capacity for workload assignment.
type NodeCapacity struct {
	NodeID           string
	Address          [20]byte
	Reputation       *big.Int
	VRAMTotalMB      uint64
	VRAMUsedMB       uint64
	AvailableMB      uint64
	IsOnline         bool
	ActiveLatencyMs  uint64 // current packet latency in ms (lower = better)
	IsReservedPool   bool   // true = serverless multi-tenant, false = dedicated enterprise
}

// WorkloadSplitter partitions compute jobs across eligible GPU nodes.
// It acts as a dynamic Serverless Load Balancer for stateless requests,
// routing to the best available standby nodes based on reputation and latency.
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

// GetEligibleNodes returns the current list of eligible nodes (online with available capacity).
func (ws *WorkloadSplitter) GetEligibleNodes() []NodeCapacity {
	var eligible []NodeCapacity
	for _, n := range ws.eligibleNodes {
		if n.IsOnline && n.AvailableMB > 0 {
			eligible = append(eligible, n)
		}
	}
	return eligible
}

// GetServerlessNodes returns nodes where IsReservedPool == false (serverless multi-tenant).
func (ws *WorkloadSplitter) GetServerlessNodes() []NodeCapacity {
	var serverless []NodeCapacity
	for _, n := range ws.eligibleNodes {
		if n.IsOnline && !n.IsReservedPool && n.AvailableMB > 0 {
			serverless = append(serverless, n)
		}
	}
	return serverless
}

// GetDedicatedNodes returns nodes matching the given addresses (enterprise dedicated).
func (ws *WorkloadSplitter) GetDedicatedNodes(nodeIDs []string) []NodeCapacity {
	addressSet := make(map[string]bool)
	for _, id := range nodeIDs {
		addressSet[id] = true
	}

	var dedicated []NodeCapacity
	for _, n := range ws.eligibleNodes {
		if n.IsOnline && n.IsReservedPool && addressSet[n.NodeID] {
			dedicated = append(dedicated, n)
		}
	}
	return dedicated
}

// SplitWorkload partitions a job into WorkUnits using dynamic serverless load balancing.
//
// Routing Logic:
//   - If job.AssignedNodes is non-empty (enterprise dedicated): route exclusively to those nodes
//   - If stateless serverless (job.IsServerless == true): query IsReservedPool == false nodes,
//     sort by highest reputation + lowest latency, distribute across standby pool
func (ws *WorkloadSplitter) SplitWorkload(job *types.Job, totalBytes int) ([]WorkUnit, error) {
	if job == nil {
		return nil, fmt.Errorf("job cannot be nil")
	}

	if len(ws.eligibleNodes) == 0 {
		return nil, fmt.Errorf("no eligible nodes available")
	}

	var targetNodes []NodeCapacity

	// Route 1: Enterprise dedicated nodes (exclusive routing to assigned nodes)
	if len(job.AssignedNodes) > 0 {
		targetNodes = ws.GetDedicatedNodesFromJob(job)
		if len(targetNodes) == 0 {
			return nil, fmt.Errorf("no matching dedicated nodes available for job")
		}
	} else if job.IsServerless {
		// Route 2: Serverless stateless (dynamic load balancing across standby pool)
		targetNodes = ws.GetServerlessNodes()
		if len(targetNodes) == 0 {
			return nil, fmt.Errorf("no serverless standby nodes available")
		}
	} else {
		// Fallback: all eligible nodes
		targetNodes = ws.GetEligibleNodes()
		if len(targetNodes) == 0 {
			return nil, fmt.Errorf("no online nodes with available capacity")
		}
	}

	// Sort nodes for optimal load balancing
	// For serverless: highest reputation + lowest latency (best first)
	// For dedicated: maintain assignment order
	sortNodesForLoadBalancing(targetNodes, job.IsServerless)

	// Create work units distributed across target nodes
	numUnits := len(targetNodes)
	workUnits := make([]WorkUnit, 0, numUnits)
	bytesPerNode := totalBytes / numUnits
	remainder := totalBytes % numUnits

	for i, node := range targetNodes {
		startOffset := i * bytesPerNode
		endOffset := startOffset + bytesPerNode
		if i == len(targetNodes)-1 {
			endOffset += remainder // last node gets remainder
		}

		unit := WorkUnit{
			JobID:       string(job.ID[:]),
			UnitIndex:   i,
			TotalUnits:  numUnits,
			NodeID:      node.NodeID,
			State:       nil,
			StartOffset: startOffset,
			EndOffset:   endOffset,
			IsAssigned:  true,
			IsDedicated: len(job.AssignedNodes) > 0,
		}
		workUnits = append(workUnits, unit)
	}

	return workUnits, nil
}

// GetDedicatedNodesFromJob extracts and returns matching dedicated nodes from job AssignedNodes.
func (ws *WorkloadSplitter) GetDedicatedNodesFromJob(job *types.Job) []NodeCapacity {
	if len(job.AssignedNodes) == 0 {
		return nil
	}

	assignedSet := make(map[string]bool)
	for _, addr := range job.AssignedNodes {
		assignedSet[hexEncode(addr[:])] = true
	}

	var dedicated []NodeCapacity
	for _, n := range ws.eligibleNodes {
		if n.IsOnline && n.IsReservedPool && assignedSet[hexEncode(n.Address[:])] {
			dedicated = append(dedicated, n)
		}
	}

	// Sort dedicated nodes by reputation (highest first) for consistent assignment
	sort.Slice(dedicated, func(i, j int) bool {
		return dedicated[i].Reputation.Cmp(dedicated[j].Reputation) > 0
	})

	return dedicated
}

// sortNodesForLoadBalancing sorts nodes by best load-balancing metrics.
// For serverless: primary = lowest latency, secondary = highest reputation
// For dedicated: maintain order by reputation
func sortNodesForLoadBalancing(nodes []NodeCapacity, isServerless bool) {
	if isServerless {
		// Serverless: prioritize lowest latency, then highest reputation
		sort.Slice(nodes, func(i, j int) bool {
			// Primary: lower latency is better
			if nodes[i].ActiveLatencyMs != nodes[j].ActiveLatencyMs {
				return nodes[i].ActiveLatencyMs < nodes[j].ActiveLatencyMs
			}
			// Secondary: higher reputation is better
			return nodes[i].Reputation.Cmp(nodes[j].Reputation) > 0
		})
	} else {
		// Dedicated: just sort by reputation
		sort.Slice(nodes, func(i, j int) bool {
			return nodes[i].Reputation.Cmp(nodes[j].Reputation) > 0
		})
	}
}

// hexEncode encodes bytes as hex string.
func hexEncode(data []byte) string {
	const hexChars = "0123456789abcdef"
	result := make([]byte, len(data)*2)
	for i, b := range data {
		result[i*2] = hexChars[b>>4]
		result[i*2+1] = hexChars[b&0xf]
	}
	return string(result)
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

// GetNodeForUnit returns the optimal node for a work unit based on capacity and latency.
func (ws *WorkloadSplitter) GetNodeForUnit(unitIndex int) (string, error) {
	serverlessNodes := ws.GetServerlessNodes()
	if len(serverlessNodes) == 0 {
		return "", fmt.Errorf("no serverless standby nodes available")
	}

	// Sort by best metrics
	sortNodesForLoadBalancing(serverlessNodes, true)

	if unitIndex < 0 || unitIndex >= len(serverlessNodes) {
		return "", fmt.Errorf("unit index %d out of range (available nodes: %d)", unitIndex, len(serverlessNodes))
	}
	idx := unitIndex % len(serverlessNodes)
	return serverlessNodes[idx].NodeID, nil
}

// CalculateLoadDistribution calculates how many work units each node should handle.
func (ws *WorkloadSplitter) CalculateLoadDistribution(totalUnits int) (map[string]int, error) {
	if totalUnits <= 0 {
		return nil, fmt.Errorf("total units must be positive")
	}

	serverlessNodes := ws.GetServerlessNodes()
	if len(serverlessNodes) == 0 {
		return nil, fmt.Errorf("no serverless standby nodes")
	}

	// Sort by best metrics
	sortNodesForLoadBalancing(serverlessNodes, true)

	// Calculate total capacity
	var totalCapacity uint64
	for _, n := range serverlessNodes {
		totalCapacity += n.AvailableMB
	}

	if totalCapacity == 0 {
		return nil, fmt.Errorf("total serverless capacity is zero")
	}

	distribution := make(map[string]int)
	for _, node := range serverlessNodes {
		ratio := float64(node.AvailableMB) / float64(totalCapacity)
		units := int(float64(totalUnits) * ratio)
		if units < 1 {
			units = 1 // minimum 1 unit per node
		}
		distribution[node.NodeID] = units
	}

	return distribution, nil
}

// GetBestNode returns the single best node for a stateless request (lowest latency, highest rep).
func (ws *WorkloadSplitter) GetBestNode() (string, error) {
	serverlessNodes := ws.GetServerlessNodes()
	if len(serverlessNodes) == 0 {
		return "", fmt.Errorf("no serverless standby nodes available")
	}

	sortNodesForLoadBalancing(serverlessNodes, true)
	return serverlessNodes[0].NodeID, nil
}

// GetNodesByLatency returns nodes sorted by latency (ascending - best first).
func (ws *WorkloadSplitter) GetNodesByLatency() []NodeCapacity {
	nodes := ws.GetServerlessNodes()
	sort.Slice(nodes, func(i, j int) bool {
		if nodes[i].ActiveLatencyMs != nodes[j].ActiveLatencyMs {
			return nodes[i].ActiveLatencyMs < nodes[j].ActiveLatencyMs
		}
		return nodes[i].Reputation.Cmp(nodes[j].Reputation) > 0
	})
	return nodes
}

// GetNodesByReputation returns nodes sorted by reputation (descending - best first).
func (ws *WorkloadSplitter) GetNodesByReputation() []NodeCapacity {
	nodes := ws.GetServerlessNodes()
	sort.Slice(nodes, func(i, j int) bool {
		return nodes[i].Reputation.Cmp(nodes[j].Reputation) > 0
	})
	return nodes
}
