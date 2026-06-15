// Package reporter provides reporting functionality for the telemetry service.
package reporter

import (
	"context"
	"fmt"
)

// Client provides a high-level interface for reporting heartbeats.
type Client struct {
	reporter *Reporter
}

// NewClient creates a new reporting client.
func NewClient(backendURL string) *Client {
	return &Client{
		reporter: NewReporter(backendURL),
	}
}

// ReportHeartbeat sends a heartbeat to the backend.
func (c *Client) ReportHeartbeat(ctx context.Context, hb *HeartbeatData) error {
	if hb == nil {
		return fmt.Errorf("heartbeat cannot be nil")
	}
	return c.reporter.Send(ctx, hb)
}
