// Package collector provides metric collectors for the telemetry service.
package collector

import (
	"context"
	"net"
	"time"

	"github.com/tentrist.ai/telemetry/src/heartbeat"
)

// LatencyCollector collects network latency metrics via TCP ping.
type LatencyCollector struct {
	nodeID     string
	targetHost string
	dialer     NetDialer
}

// NetDialer defines the interface for network dial operations.
type NetDialer interface {
	DialContext(ctx context.Context, network, address string) (net.Conn, error)
}

// defaultNetDialer implements NetDialer using net.Dialer.
type defaultNetDialer struct{}

// DialContext dials a network connection.
func (d *defaultNetDialer) DialContext(ctx context.Context, network, address string) (net.Conn, error) {
	return (&net.Dialer{Timeout: 5 * time.Second}).DialContext(ctx, network, address)
}

// NewLatencyCollector creates a new LatencyCollector.
func NewLatencyCollector(nodeID, targetHost string) *LatencyCollector {
	return &LatencyCollector{
		nodeID:     nodeID,
		targetHost: targetHost,
		dialer:    &defaultNetDialer{},
	}
}

// SetDialer sets a custom net dialer (for testing).
func (c *LatencyCollector) SetDialer(dialer NetDialer) {
	c.dialer = dialer
}

// Collect measures TCP ping latency to the target host.
func (c *LatencyCollector) Collect() (*heartbeat.Heartbeat, error) {
	return c.CollectWithContext(context.Background())
}

// CollectWithContext measures TCP ping latency with context support.
func (c *LatencyCollector) CollectWithContext(ctx context.Context) (*heartbeat.Heartbeat, error) {
	if c.targetHost == "" {
		return heartbeat.NewHeartbeatWithStatus(c.nodeID, 0, 0, 0, heartbeat.NodeStatusBusy), nil
	}

	latency, err := c.measureTCPLatency(ctx, c.targetHost)
	if err != nil {
		// Return 0 latency on error (connection failed)
		return heartbeat.NewHeartbeatWithStatus(c.nodeID, 0, 0, 0, heartbeat.NodeStatusBusy), nil
	}

	return heartbeat.NewHeartbeatWithStatus(c.nodeID, 0, 0, latency, heartbeat.NodeStatusBusy), nil
}

// measureTCPLatency measures the round-trip time for a TCP connection.
func (c *LatencyCollector) measureTCPLatency(ctx context.Context, target string) (uint64, error) {
	start := time.Now()

	conn, err := c.dialer.DialContext(ctx, "tcp", target)
	if err != nil {
		return 0, err
	}
	defer conn.Close()

	elapsed := time.Since(start)
	return uint64(elapsed.Milliseconds()), nil
}

// TCPPingResult holds the result of a TCP ping operation.
type TCPPingResult struct {
	Target   string
	LatencyMs uint64
	Success   bool
	Error    error
}

// TCPPing performs a TCP ping to the specified target.
func TCPPing(ctx context.Context, target string) *TCPPingResult {
	start := time.Now()

	dialer := &defaultNetDialer{}
	conn, err := dialer.DialContext(ctx, "tcp", target)
	if err != nil {
		return &TCPPingResult{
			Target:   target,
			LatencyMs: 0,
			Success:   false,
			Error:    err,
		}
	}
	defer conn.Close()

	return &TCPPingResult{
		Target:   target,
		LatencyMs: uint64(time.Since(start).Milliseconds()),
		Success:   true,
		Error:    nil,
	}
}
