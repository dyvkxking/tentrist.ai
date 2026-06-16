// Package reporter provides reporting functionality for the telemetry service.
package reporter

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// HeartbeatData represents heartbeat data to be sent to the backend.
type HeartbeatData struct {
	NodeID               string `json:"nodeId"`
	VRAMUsedMB           uint64 `json:"vramUsedMb"`
	VRAMTotalMB          uint64 `json:"vramTotalMb"`
	PacketLatencyMs      uint64 `json:"packetLatencyMs"`
	Timestamp            int64  `json:"timestamp"`
	NodeStatus           uint8  `json:"nodeStatus"`            // 0=Busy, 1=StandbyAvailable, 2=Offline
	ProcessingDurationMs uint64 `json:"processingDurationMs"` // Micro-task execution time
}

// Reporter sends heartbeat data to the backend.
type Reporter struct {
	backendURL string
	client    *http.Client
}

// NewReporter creates a new Reporter.
func NewReporter(backendURL string) *Reporter {
	return &Reporter{
		backendURL: backendURL,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// Post sends a heartbeat to the backend API via HTTP POST.
// This implements the heartbeat.HTTPPoster interface.
func (r *Reporter) Post(ctx context.Context, url string, data []byte) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(data))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	// Retry up to 3 times
	var lastErr error
	for attempt := 0; attempt < 3; attempt++ {
		if attempt > 0 {
			time.Sleep(time.Duration(attempt) * time.Second)
		}

		resp, err := r.client.Do(req)
		if err != nil {
			lastErr = err
			continue
		}
		defer resp.Body.Close()

		if resp.StatusCode == http.StatusOK {
			return nil
		}

		body, _ := io.ReadAll(resp.Body)
		lastErr = fmt.Errorf("unexpected status %d: %s", resp.StatusCode, string(body))
	}

	return fmt.Errorf("failed after 3 retries: %w", lastErr)
}

// Send sends a heartbeat to the backend API.
func (r *Reporter) Send(ctx context.Context, hb *HeartbeatData) error {
	data, err := json.Marshal(hb)
	if err != nil {
		return fmt.Errorf("failed to marshal heartbeat: %w", err)
	}

	url := fmt.Sprintf("%s/api/v1/telemetry/heartbeat", r.backendURL)
	return r.Post(ctx, url, data)
}
