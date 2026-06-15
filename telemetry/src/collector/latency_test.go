package collector

import (
	"context"
	"errors"
	"net"
	"testing"
	"time"
)

// mockDialer is a test double for NetDialer.
type mockDialer struct {
	latency  time.Duration
	err      error
	calls    int
	closeErr error
}

func (m *mockDialer) DialContext(ctx context.Context, network, address string) (net.Conn, error) {
	m.calls++
	if m.err != nil {
		return nil, m.err
	}
	return &mockConn{latency: m.latency, closeErr: m.closeErr}, nil
}

// mockConn implements net.Conn for testing.
type mockConn struct {
	latency  time.Duration
	closeErr error
	closed   bool
}

func (m *mockConn) Read(b []byte) (n int, err error) {
	return 0, nil
}

func (m *mockConn) Write(b []byte) (n int, err error) {
	return len(b), nil
}

func (m *mockConn) Close() error {
	m.closed = true
	return m.closeErr
}

func (m *mockConn) LocalAddr() net.Addr {
	return &net.TCPAddr{IP: []byte{127, 0, 0, 1}, Port: 12345}
}

func (m *mockConn) RemoteAddr() net.Addr {
	return &net.TCPAddr{IP: []byte{127, 0, 0, 1}, Port: 80}
}

func (m *mockConn) SetDeadline(t time.Time) error {
	return nil
}

func (m *mockConn) SetReadDeadline(t time.Time) error {
	return nil
}

func (m *mockConn) SetWriteDeadline(t time.Time) error {
	return nil
}

func TestNewLatencyCollector(t *testing.T) {
	collector := NewLatencyCollector("node1", "localhost:80")
	if collector == nil {
		t.Fatal("expected non-nil LatencyCollector")
	}
	if collector.nodeID != "node1" {
		t.Errorf("expected nodeID=node1, got %s", collector.nodeID)
	}
	if collector.targetHost != "localhost:80" {
		t.Errorf("expected targetHost=localhost:80, got %s", collector.targetHost)
	}
}

func TestLatencyCollector_SetDialer(t *testing.T) {
	collector := NewLatencyCollector("node1", "localhost:80")
	dialer := &mockDialer{latency: 50 * time.Millisecond}
	collector.SetDialer(dialer)
	if collector.dialer != dialer {
		t.Error("expected dialer to be set")
	}
}

func TestLatencyCollector_Collect_Success(t *testing.T) {
	collector := NewLatencyCollector("node1", "localhost:80")
	collector.SetDialer(&mockDialer{latency: 50 * time.Millisecond})

	hb, err := collector.Collect()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if hb.NodeID != "node1" {
		t.Errorf("expected NodeID=node1, got %s", hb.NodeID)
	}
	// Mock connection returns immediately, so latency will be low
	// Just verify that the call succeeded and we got a valid heartbeat
	if hb.PacketLatencyMs > 1000 {
		t.Errorf("expected low latency, got %dms", hb.PacketLatencyMs)
	}
}

func TestLatencyCollector_Collect_EmptyTarget(t *testing.T) {
	collector := NewLatencyCollector("node1", "")

	hb, err := collector.Collect()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if hb.PacketLatencyMs != 0 {
		t.Errorf("expected 0 latency for empty target, got %d", hb.PacketLatencyMs)
	}
}

func TestLatencyCollector_Collect_DialError(t *testing.T) {
	collector := NewLatencyCollector("node1", "localhost:80")
	collector.SetDialer(&mockDialer{err: errors.New("connection refused")})

	// Should fall back to 0 latency on error
	hb, err := collector.Collect()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if hb.PacketLatencyMs != 0 {
		t.Errorf("expected 0 latency on error, got %d", hb.PacketLatencyMs)
	}
}

func TestTCPPingResult(t *testing.T) {
	result := &TCPPingResult{
		Target:    "localhost:80",
		LatencyMs: 25,
		Success:   true,
		Error:     nil,
	}

	if result.Target != "localhost:80" {
		t.Errorf("expected Target=localhost:80, got %s", result.Target)
	}
	if result.LatencyMs != 25 {
		t.Errorf("expected LatencyMs=25, got %d", result.LatencyMs)
	}
	if !result.Success {
		t.Error("expected Success=true")
	}
}

func TestLatencyCollector_Collect_MultipleCollectors(t *testing.T) {
	collector := NewLatencyCollector("node1", "api.example.com:443")
	collector.SetDialer(&mockDialer{latency: 100 * time.Millisecond})

	// Collect multiple times
	for i := 0; i < 5; i++ {
		hb, err := collector.Collect()
		if err != nil {
			t.Fatalf("unexpected error on iteration %d: %v", i, err)
		}
		if hb.NodeID != "node1" {
			t.Errorf("iteration %d: expected NodeID=node1, got %s", i, hb.NodeID)
		}
	}
}

func TestLatencyCollector_ZeroLatency(t *testing.T) {
	collector := NewLatencyCollector("node1", "localhost:80")
	collector.SetDialer(&mockDialer{latency: 0})

	hb, err := collector.Collect()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if hb.PacketLatencyMs != 0 {
		t.Errorf("expected 0 latency, got %d", hb.PacketLatencyMs)
	}
}

func TestLatencyCollector_ContextCancellation(t *testing.T) {
	collector := NewLatencyCollector("node1", "localhost:80")
	collector.SetDialer(&mockDialer{latency: 10 * time.Second}) // Long latency

	ctx, cancel := context.WithCancel(context.Background())
	cancel() // Cancel immediately

	hb, err := collector.CollectWithContext(ctx)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	// Should return 0 on context cancellation
	if hb.PacketLatencyMs != 0 {
		t.Errorf("expected 0 latency on cancelled context, got %d", hb.PacketLatencyMs)
	}
}
