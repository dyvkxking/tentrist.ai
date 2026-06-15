// Package heartbeat provides the heartbeat telemetry service.
package heartbeat

import "time"

// Heartbeat represents a telemetry heartbeat from a node.
type Heartbeat struct {
	NodeID          string
	VRAMUsedMB      uint64
	VRAMTotalMB     uint64
	PacketLatencyMs uint64
	Timestamp       int64 // Unix timestamp
}

// NewHeartbeat creates a new Heartbeat with the given parameters.
func NewHeartbeat(nodeID string, vramUsed, vramTotal, latency uint64) *Heartbeat {
	return &Heartbeat{
		NodeID:          nodeID,
		VRAMUsedMB:      vramUsed,
		VRAMTotalMB:     vramTotal,
		PacketLatencyMs: latency,
		Timestamp:       time.Now().Unix(),
	}
}

// ToReporterData converts a Heartbeat to reporter.HeartbeatData format.
func (h *Heartbeat) ToReporterData() *ReporterHeartbeatData {
	return &ReporterHeartbeatData{
		NodeID:          h.NodeID,
		VRAMUsedMB:      h.VRAMUsedMB,
		VRAMTotalMB:     h.VRAMTotalMB,
		PacketLatencyMs: h.PacketLatencyMs,
		Timestamp:       h.Timestamp,
	}
}

// ReporterHeartbeatData is the JSON-serializable version for the backend API.
type ReporterHeartbeatData struct {
	NodeID          string `json:"nodeId"`
	VRAMUsedMB      uint64 `json:"vramUsedMb"`
	VRAMTotalMB     uint64 `json:"vramTotalMb"`
	PacketLatencyMs uint64 `json:"packetLatencyMs"`
	Timestamp       int64  `json:"timestamp"`
}
