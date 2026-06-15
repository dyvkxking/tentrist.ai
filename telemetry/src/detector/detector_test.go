package detector

import (
	"context"
	"sync"
	"testing"
	"time"
)

// mockFailureNotifier is a test double for FailureNotifier.
type mockFailureNotifier struct {
	notifications []*FailureNotification
	err          error
	mu           sync.Mutex
	calls        int
}

func (m *mockFailureNotifier) NotifyFailure(ctx context.Context, notification *FailureNotification) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.calls++
	m.notifications = append(m.notifications, notification)
	return m.err
}

func (m *mockFailureNotifier) GetNotifications() []*FailureNotification {
	m.mu.Lock()
	defer m.mu.Unlock()
	notifications := make([]*FailureNotification, len(m.notifications))
	copy(notifications, m.notifications)
	return notifications
}

func (m *mockFailureNotifier) GetCallCount() int {
	m.mu.Lock()
	defer m.mu.Unlock()
	return m.calls
}

func TestNewFailureDetector(t *testing.T) {
	fd := NewFailureDetector(30*time.Second, 60*time.Second)
	if fd == nil {
		t.Fatal("expected non-nil FailureDetector")
	}
	if fd.heartbeatInterval != 30*time.Second {
		t.Errorf("expected heartbeatInterval=30s, got %v", fd.heartbeatInterval)
	}
	if fd.staleThreshold != 60*time.Second {
		t.Errorf("expected staleThreshold=60s, got %v", fd.staleThreshold)
	}
	if fd.lastPulse == nil {
		t.Error("expected lastPulse to be initialized")
	}
}

func TestFailureDetector_SetNotifier(t *testing.T) {
	fd := NewFailureDetector(30*time.Second, 60*time.Second)
	notifier := &mockFailureNotifier{}
	fd.SetNotifier(notifier)

	fd.mu.RLock()
	setNotifier := fd.notifier
	fd.mu.RUnlock()

	if setNotifier != notifier {
		t.Error("expected notifier to be set")
	}
}

func TestCheckStaleNodes_NoStaleNodes(t *testing.T) {
	fd := NewFailureDetector(30*time.Second, 60*time.Second)
	fd.UpdateHeartbeat("node1", time.Now())

	stale := fd.CheckStaleNodes()
	if len(stale) != 0 {
		t.Errorf("expected no stale nodes, got %d", len(stale))
	}
}

func TestCheckStaleNodes_WithStaleNode(t *testing.T) {
	fd := NewFailureDetector(30*time.Second, 60*time.Second)
	// Last heartbeat was 90 seconds ago (> 60s threshold)
	fd.UpdateHeartbeat("node1", time.Now().Add(-90*time.Second))

	stale := fd.CheckStaleNodes()
	if len(stale) != 1 {
		t.Errorf("expected 1 stale node, got %d", len(stale))
	}
	if stale[0] != "node1" {
		t.Errorf("expected stale node 'node1', got '%s'", stale[0])
	}
}

func TestCheckStaleNodes_MultipleNodes(t *testing.T) {
	fd := NewFailureDetector(30*time.Second, 60*time.Second)
	fd.UpdateHeartbeat("node1", time.Now().Add(-90*time.Second)) // stale
	fd.UpdateHeartbeat("node2", time.Now().Add(-30*time.Second)) // fresh
	fd.UpdateHeartbeat("node3", time.Now().Add(-120*time.Second)) // stale

	stale := fd.CheckStaleNodes()
	if len(stale) != 2 {
		t.Errorf("expected 2 stale nodes, got %d", len(stale))
	}
}

func TestDetectAnomalies_VRAMExhausted(t *testing.T) {
	fd := NewFailureDetector(30*time.Second, 60*time.Second)

	// VRAM at 96% (> 95% threshold)
	hb := &Heartbeat{
		NodeID:      "node1",
		VRAMUsedMB:  9600,
		VRAMTotalMB: 10000,
	}

	if !fd.DetectAnomalies(hb) {
		t.Error("expected anomaly detected for VRAM > 95%")
	}
}

func TestDetectAnomalies_VRAMNotExhausted(t *testing.T) {
	fd := NewFailureDetector(30*time.Second, 60*time.Second)

	// VRAM at 80% (<= 95% threshold)
	hb := &Heartbeat{
		NodeID:      "node1",
		VRAMUsedMB:  8000,
		VRAMTotalMB: 10000,
	}

	if fd.DetectAnomalies(hb) {
		t.Error("expected no anomaly for VRAM <= 95%")
	}
}

func TestDetectAnomalies_LatencySpike(t *testing.T) {
	fd := NewFailureDetector(30*time.Second, 60*time.Second)

	// Latency at 600ms (> 500ms threshold)
	hb := &Heartbeat{
		NodeID:          "node1",
		PacketLatencyMs: 600,
	}

	if !fd.DetectAnomalies(hb) {
		t.Error("expected anomaly detected for latency > 500ms")
	}
}

func TestDetectAnomalies_LatencyNormal(t *testing.T) {
	fd := NewFailureDetector(30*time.Second, 60*time.Second)

	// Latency at 100ms (<= 500ms threshold)
	hb := &Heartbeat{
		NodeID:          "node1",
		PacketLatencyMs: 100,
	}

	if fd.DetectAnomalies(hb) {
		t.Error("expected no anomaly for latency <= 500ms")
	}
}

func TestDetectAnomalies_NoAnomaly(t *testing.T) {
	fd := NewFailureDetector(30*time.Second, 60*time.Second)

	// Normal heartbeat
	hb := &Heartbeat{
		NodeID:          "node1",
		VRAMUsedMB:      4000,
		VRAMTotalMB:     8192,
		PacketLatencyMs: 50,
	}

	if fd.DetectAnomalies(hb) {
		t.Error("expected no anomaly for normal heartbeat")
	}
}

func TestUpdateHeartbeat(t *testing.T) {
	fd := NewFailureDetector(30*time.Second, 60*time.Second)
	now := time.Now()
	fd.UpdateHeartbeat("node1", now)

	lastTime, ok := fd.GetLastHeartbeat("node1")
	if !ok {
		t.Error("expected heartbeat to exist")
	}
	if !lastTime.Equal(now) {
		t.Errorf("expected %v, got %v", now, lastTime)
	}
}

func TestGetLastHeartbeat_NotFound(t *testing.T) {
	fd := NewFailureDetector(30*time.Second, 60*time.Second)

	_, ok := fd.GetLastHeartbeat("nonexistent")
	if ok {
		t.Error("expected heartbeat to not exist")
	}
}

func TestFlagFailure_NoNotifier(t *testing.T) {
	fd := NewFailureDetector(30*time.Second, 60*time.Second)
	// No notifier set

	err := fd.FlagFailure(context.Background(), "node1", ReasonHeartbeatStale)
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
}

func TestFlagFailure_WithNotifier(t *testing.T) {
	fd := NewFailureDetector(30*time.Second, 60*time.Second)
	notifier := &mockFailureNotifier{}
	fd.SetNotifier(notifier)

	err := fd.FlagFailure(context.Background(), "node1", ReasonVRAMExhausted)
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}

	notifications := notifier.GetNotifications()
	if len(notifications) != 1 {
		t.Errorf("expected 1 notification, got %d", len(notifications))
	}
	if notifications[0].NodeID != "node1" {
		t.Errorf("expected NodeID=node1, got %s", notifications[0].NodeID)
	}
	if notifications[0].Reason != ReasonVRAMExhausted {
		t.Errorf("expected Reason=ReasonVRAMExhausted, got %v", notifications[0].Reason)
	}
}

func TestFlagFailure_NotifierError(t *testing.T) {
	fd := NewFailureDetector(30*time.Second, 60*time.Second)
	notifier := &mockFailureNotifier{err: context.DeadlineExceeded}
	fd.SetNotifier(notifier)

	err := fd.FlagFailure(context.Background(), "node1", ReasonLatencySpike)
	if err == nil {
		t.Error("expected error from notifier")
	}
}

func TestFlagFailure_ReasonToString(t *testing.T) {
	tests := []struct {
		reason   FailureReason
		expected string
	}{
		{ReasonHeartbeatStale, "heartbeat_stale"},
		{ReasonVRAMExhausted, "vram_exhausted"},
		{ReasonLatencySpike, "latency_spike"},
		{ReasonNetworkBlackout, "network_blackout"},
		{FailureReason(99), "unknown_99"},
	}

	for _, tt := range tests {
		t.Run(tt.expected, func(t *testing.T) {
			result := reasonToString(tt.reason)
			if result != tt.expected {
				t.Errorf("expected '%s', got '%s'", tt.expected, result)
			}
		})
	}
}

func TestCheckAndFlagStaleNodes(t *testing.T) {
	fd := NewFailureDetector(30*time.Second, 60*time.Second)
	notifier := &mockFailureNotifier{}
	fd.SetNotifier(notifier)

	// Add a stale node
	fd.UpdateHeartbeat("node1", time.Now().Add(-90*time.Second))

	err := CheckAndFlagStaleNodes(context.Background(), fd, "node1")
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}

	notifications := notifier.GetNotifications()
	if len(notifications) != 1 {
		t.Fatalf("expected 1 notification, got %d", len(notifications))
	}
	if notifications[0].NodeID != "node1" {
		t.Errorf("expected NodeID=node1, got %s", notifications[0].NodeID)
	}
}

func TestCheckAnomalyAndFlag_VRAMExhausted(t *testing.T) {
	fd := NewFailureDetector(30*time.Second, 60*time.Second)
	notifier := &mockFailureNotifier{}
	fd.SetNotifier(notifier)

	hb := &Heartbeat{
		NodeID:      "node1",
		VRAMUsedMB:  9800,
		VRAMTotalMB: 10000,
	}

	err := CheckAnomalyAndFlag(context.Background(), fd, hb)
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}

	notifications := notifier.GetNotifications()
	if len(notifications) != 1 {
		t.Fatalf("expected 1 notification, got %d", len(notifications))
	}
	if notifications[0].Reason != ReasonVRAMExhausted {
		t.Errorf("expected Reason=ReasonVRAMExhausted, got %v", notifications[0].Reason)
	}
}

func TestCheckAnomalyAndFlag_LatencySpike(t *testing.T) {
	fd := NewFailureDetector(30*time.Second, 60*time.Second)
	notifier := &mockFailureNotifier{}
	fd.SetNotifier(notifier)

	hb := &Heartbeat{
		NodeID:          "node1",
		VRAMUsedMB:      4000,
		VRAMTotalMB:     8192,
		PacketLatencyMs: 600,
	}

	err := CheckAnomalyAndFlag(context.Background(), fd, hb)
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}

	notifications := notifier.GetNotifications()
	if len(notifications) != 1 {
		t.Fatalf("expected 1 notification, got %d", len(notifications))
	}
	if notifications[0].Reason != ReasonLatencySpike {
		t.Errorf("expected Reason=ReasonLatencySpike, got %v", notifications[0].Reason)
	}
}

func TestCheckAnomalyAndFlag_NoAnomaly(t *testing.T) {
	fd := NewFailureDetector(30*time.Second, 60*time.Second)
	notifier := &mockFailureNotifier{}
	fd.SetNotifier(notifier)

	hb := &Heartbeat{
		NodeID:          "node1",
		VRAMUsedMB:      4000,
		VRAMTotalMB:     8192,
		PacketLatencyMs: 50,
	}

	err := CheckAnomalyAndFlag(context.Background(), fd, hb)
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}

	if notifier.GetCallCount() != 0 {
		t.Errorf("expected no notifications for normal heartbeat, got %d", notifier.GetCallCount())
	}
}

func TestCheckAnomalyAndFlag_NilDetector(t *testing.T) {
	err := CheckAnomalyAndFlag(context.Background(), nil, &Heartbeat{NodeID: "node1"})
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
}

func TestCheckAnomalyAndFlag_NilHeartbeat(t *testing.T) {
	fd := NewFailureDetector(30*time.Second, 60*time.Second)
	err := CheckAnomalyAndFlag(context.Background(), fd, nil)
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
}

func TestFlagFailure_NilDetector(t *testing.T) {
	// Should not panic, just log
	err := FlagFailure(context.Background(), nil, "node1", ReasonHeartbeatStale)
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
}

func TestConcurrentAccess(t *testing.T) {
	fd := NewFailureDetector(30*time.Second, 60*time.Second)
	notifier := &mockFailureNotifier{}
	fd.SetNotifier(notifier)

	var wg sync.WaitGroup

	// Concurrent updates
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			fd.UpdateHeartbeat("node1", time.Now())
		}(i)
	}

	// Concurrent reads
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			fd.CheckStaleNodes()
			fd.GetLastHeartbeat("node1")
		}()
	}

	// Concurrent flags
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			fd.FlagFailure(context.Background(), "node1", ReasonHeartbeatStale)
		}()
	}

	wg.Wait()

	// All operations should complete without panic
}
