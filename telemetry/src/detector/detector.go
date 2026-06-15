// Package detector provides failure detection for the telemetry service.
package detector

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"
)

// FailureReason represents the reason for a node failure.
type FailureReason int

const (
	ReasonHeartbeatStale FailureReason = iota
	ReasonVRAMExhausted
	ReasonLatencySpike
	ReasonNetworkBlackout
)

// Heartbeat represents heartbeat metrics for failure detection.
type Heartbeat struct {
	NodeID          string
	VRAMUsedMB      uint64
	VRAMTotalMB     uint64
	PacketLatencyMs uint64
}

// FailureNotification represents a failure event to be sent to the backend.
type FailureNotification struct {
	NodeID    string         `json:"nodeId"`
	Reason    FailureReason `json:"reason"`
	Timestamp int64         `json:"timestamp"`
}

// FailureDetector detects node failures based on heartbeat metrics.
type FailureDetector struct {
	heartbeatInterval time.Duration
	staleThreshold    time.Duration
	lastPulse         map[string]time.Time
	notifier         FailureNotifier
	mu               sync.RWMutex
}

// FailureNotifier defines the interface for sending failure notifications.
type FailureNotifier interface {
	NotifyFailure(ctx context.Context, notification *FailureNotification) error
}

// NewFailureDetector creates a new FailureDetector.
func NewFailureDetector(heartbeatInterval, staleThreshold time.Duration) *FailureDetector {
	return &FailureDetector{
		heartbeatInterval: heartbeatInterval,
		staleThreshold:    staleThreshold,
		lastPulse:         make(map[string]time.Time),
	}
}

// SetNotifier sets the failure notifier (for backend notification).
func (fd *FailureDetector) SetNotifier(n FailureNotifier) {
	fd.mu.Lock()
	defer fd.mu.Unlock()
	fd.notifier = n
}

// CheckStaleNodes returns node IDs that have stale heartbeats.
func (fd *FailureDetector) CheckStaleNodes() []string {
	fd.mu.RLock()
	defer fd.mu.RUnlock()

	now := time.Now()
	var stale []string

	for nodeID, lastTime := range fd.lastPulse {
		if now.Sub(lastTime) > fd.staleThreshold {
			stale = append(stale, nodeID)
		}
	}

	return stale
}

// DetectAnomalies checks if a heartbeat indicates anomalous behavior.
func (fd *FailureDetector) DetectAnomalies(hb *Heartbeat) bool {
	// VRAM > 95% threshold
	if hb.VRAMTotalMB > 0 {
		usagePercent := float64(hb.VRAMUsedMB) / float64(hb.VRAMTotalMB) * 100
		if usagePercent > 95 {
			return true
		}
	}

	// Latency > 500ms threshold
	if hb.PacketLatencyMs > 500 {
		return true
	}

	return false
}

// UpdateHeartbeat updates the last heartbeat time for a node.
func (fd *FailureDetector) UpdateHeartbeat(nodeID string, t time.Time) {
	fd.mu.Lock()
	defer fd.mu.Unlock()
	fd.lastPulse[nodeID] = t
}

// GetLastHeartbeat returns the last heartbeat time for a node.
func (fd *FailureDetector) GetLastHeartbeat(nodeID string) (time.Time, bool) {
	fd.mu.RLock()
	defer fd.mu.RUnlock()
	t, ok := fd.lastPulse[nodeID]
	return t, ok
}

// FlagFailure flags a node failure and notifies the backend.
func (fd *FailureDetector) FlagFailure(ctx context.Context, nodeID string, reason FailureReason) error {
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

// HTTPFailureNotifier sends failure notifications via HTTP.
type HTTPFailureNotifier struct {
	backendURL string
	client    *http.Client
}

// NewHTTPFailureNotifier creates a new HTTP-based failure notifier.
func NewHTTPFailureNotifier(backendURL string) *HTTPFailureNotifier {
	return &HTTPFailureNotifier{
		backendURL: backendURL,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// NotifyFailure sends a failure notification to the backend.
func (n *HTTPFailureNotifier) NotifyFailure(ctx context.Context, notification *FailureNotification) error {
	data, err := json.Marshal(notification)
	if err != nil {
		return fmt.Errorf("failed to marshal notification: %w", err)
	}

	url := fmt.Sprintf("%s/api/v1/nodes/%s/failure", n.backendURL, notification.NodeID)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(data))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := n.client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send notification: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return fmt.Errorf("unexpected status %d", resp.StatusCode)
	}

	return nil
}
