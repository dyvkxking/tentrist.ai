// Package detector provides failure detection for the telemetry service.
package detector

import (
	"context"
	"fmt"
	"log"
	"time"
)

// FlagFailure logs a failure event and notifies the backend via the detector's notifier.
// If the detector has a notifier set, it will send the failure notification.
func FlagFailure(ctx context.Context, fd *FailureDetector, nodeID string, reason FailureReason) error {
	if fd == nil {
		log.Printf("NODE FAILURE: node=%s reason=%s (detector is nil, skipping notification)", nodeID, reasonToString(reason))
		return nil
	}

	notification := &FailureNotification{
		NodeID:    nodeID,
		Reason:    reason,
		Timestamp: time.Now().Unix(),
	}

	reasonStr := reasonToString(reason)
	log.Printf("NODE FAILURE: node=%s reason=%s", nodeID, reasonStr)

	// Notify backend if notifier is set
	fd.mu.RLock()
	notifier := fd.notifier
	fd.mu.RUnlock()

	if notifier != nil {
		if err := notifier.NotifyFailure(ctx, notification); err != nil {
			log.Printf("Failed to notify backend of failure: %v", err)
			return err
		}
		log.Printf("Failure notification sent to backend for node=%s", nodeID)
	}

	return nil
}

// CheckAndFlagStaleNodes checks for stale nodes and flags failures for each.
func CheckAndFlagStaleNodes(ctx context.Context, fd *FailureDetector, nodeID string) error {
	if fd == nil {
		return nil
	}

	stale := fd.CheckStaleNodes()
	for _, id := range stale {
		if err := FlagFailure(ctx, fd, id, ReasonHeartbeatStale); err != nil {
			log.Printf("Failed to flag stale node %s: %v", id, err)
		}
	}

	return nil
}

// CheckAnomalyAndFlag checks a heartbeat for anomalies and flags a failure if detected.
func CheckAnomalyAndFlag(ctx context.Context, fd *FailureDetector, hb *Heartbeat) error {
	if fd == nil || hb == nil {
		return nil
	}

	if fd.DetectAnomalies(hb) {
		var reason FailureReason
		if hb.VRAMTotalMB > 0 {
			usagePercent := float64(hb.VRAMUsedMB) / float64(hb.VRAMTotalMB) * 100
			if usagePercent > 95 {
				reason = ReasonVRAMExhausted
			}
		}
		if reason == 0 && hb.PacketLatencyMs > 500 {
			reason = ReasonLatencySpike
		}

		if reason != 0 {
			return FlagFailure(ctx, fd, hb.NodeID, reason)
		}
	}

	return nil
}

// reasonToString converts a FailureReason to a human-readable string.
func reasonToString(reason FailureReason) string {
	switch reason {
	case ReasonHeartbeatStale:
		return "heartbeat_stale"
	case ReasonVRAMExhausted:
		return "vram_exhausted"
	case ReasonLatencySpike:
		return "latency_spike"
	case ReasonNetworkBlackout:
		return "network_blackout"
	default:
		return fmt.Sprintf("unknown_%d", reason)
	}
}
