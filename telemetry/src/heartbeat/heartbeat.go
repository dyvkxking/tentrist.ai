// Package heartbeat provides the heartbeat telemetry service.
package heartbeat

import "time"

// NodeStatus represents the current status of a node in the hybrid model.
type NodeStatus uint8

const (
	NodeStatusBusy         NodeStatus = 0 // Node is fully utilized
	NodeStatusStandbyAvailable NodeStatus = 1 // Node has capacity for more work
	NodeStatusOffline       NodeStatus = 2 // Node is offline
)

// Heartbeat represents a telemetry heartbeat from a node.
type Heartbeat struct {
	NodeID               string
	VRAMUsedMB           uint64
	VRAMTotalMB          uint64
	PacketLatencyMs      uint64
	Timestamp            int64  // Unix timestamp
	NodeStatus           NodeStatus // Hybrid model: standby availability
	ProcessingDurationMs uint64 // Micro-task execution time tracked by daemon
}

// NewHeartbeat creates a new Heartbeat with the given parameters.
func NewHeartbeat(nodeID string, vramUsed, vramTotal, latency uint64) *Heartbeat {
	return &Heartbeat{
		NodeID:               nodeID,
		VRAMUsedMB:           vramUsed,
		VRAMTotalMB:          vramTotal,
		PacketLatencyMs:      latency,
		Timestamp:            time.Now().Unix(),
		NodeStatus:           NodeStatusBusy,
		ProcessingDurationMs: 0,
	}
}

// NewHeartbeatWithStatus creates a Heartbeat with explicit node status.
func NewHeartbeatWithStatus(nodeID string, vramUsed, vramTotal, latency uint64, status NodeStatus) *Heartbeat {
	return &Heartbeat{
		NodeID:               nodeID,
		VRAMUsedMB:           vramUsed,
		VRAMTotalMB:          vramTotal,
		PacketLatencyMs:      latency,
		Timestamp:            time.Now().Unix(),
		NodeStatus:           status,
		ProcessingDurationMs: 0,
	}
}

// SetProcessingDuration sets the micro-task processing duration.
func (h *Heartbeat) SetProcessingDuration(durationMs uint64) {
	h.ProcessingDurationMs = durationMs
}

// ToReporterData converts a Heartbeat to reporter.HeartbeatData format.
func (h *Heartbeat) ToReporterData() *ReporterHeartbeatData {
	return &ReporterHeartbeatData{
		NodeID:               h.NodeID,
		VRAMUsedMB:           h.VRAMUsedMB,
		VRAMTotalMB:          h.VRAMTotalMB,
		PacketLatencyMs:      h.PacketLatencyMs,
		Timestamp:            h.Timestamp,
		NodeStatus:           uint8(h.NodeStatus),
		ProcessingDurationMs: h.ProcessingDurationMs,
	}
}

// ReporterHeartbeatData is the JSON-serializable version for the backend API.
type ReporterHeartbeatData struct {
	NodeID               string `json:"nodeId"`
	VRAMUsedMB           uint64 `json:"vramUsedMb"`
	VRAMTotalMB          uint64 `json:"vramTotalMb"`
	PacketLatencyMs      uint64 `json:"packetLatencyMs"`
	Timestamp            int64  `json:"timestamp"`
	NodeStatus           uint8  `json:"nodeStatus"`           // 0=Busy, 1=StandbyAvailable, 2=Offline
	ProcessingDurationMs uint64 `json:"processingDurationMs"` // Micro-task execution time
}
