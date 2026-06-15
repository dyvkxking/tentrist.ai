package heartbeat

import (
	"context"
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

// mockCollector is a test collector that returns predefined heartbeats.
type mockCollector struct {
	heartbeat *Heartbeat
	err       error
	calls     int32
}

func (m *mockCollector) Collect() (*Heartbeat, error) {
	atomic.AddInt32(&m.calls, 1)
	if m.err != nil {
		return nil, m.err
	}
	return m.heartbeat, nil
}

func (m *mockCollector) GetCalls() int {
	return int(atomic.LoadInt32(&m.calls))
}

// mockHTTPPoster is a test HTTP poster that tracks calls and can fail.
type mockHTTPPoster struct {
	calls          int32
	failUntil      int32
	postCalledWith []string
	mu             sync.Mutex
}

func (m *mockHTTPPoster) Post(ctx context.Context, url string, data []byte) error {
	atomic.AddInt32(&m.calls, 1)
	m.mu.Lock()
	m.postCalledWith = append(m.postCalledWith, url)
	m.mu.Unlock()

	if atomic.LoadInt32(&m.failUntil) > 0 {
		atomic.AddInt32(&m.failUntil, -1)
		return context.DeadlineExceeded
	}
	return nil
}

func (m *mockHTTPPoster) GetCalls() int {
	return int(atomic.LoadInt32(&m.calls))
}

func (m *mockHTTPPoster) GetCalledURLs() []string {
	m.mu.Lock()
	defer m.mu.Unlock()
	urls := make([]string, len(m.postCalledWith))
	copy(urls, m.postCalledWith)
	return urls
}

func TestNewPulseSender(t *testing.T) {
	ps := NewPulseSender("node1", "http://localhost:8080", 30*time.Second)
	if ps == nil {
		t.Fatal("expected non-nil PulseSender")
	}
	if ps.interval != 30*time.Second {
		t.Errorf("expected interval 30s, got %v", ps.interval)
	}
	if ps.retryCfg == nil {
		t.Error("expected retry config to be set")
	}
	if ps.retryCfg.MaxRetries != 3 {
		t.Errorf("expected MaxRetries=3, got %d", ps.retryCfg.MaxRetries)
	}
}

func TestDefaultRetryConfig(t *testing.T) {
	cfg := DefaultRetryConfig()
	if cfg.MaxRetries != 3 {
		t.Errorf("expected MaxRetries=3, got %d", cfg.MaxRetries)
	}
	if cfg.InitialBackoff != 1*time.Second {
		t.Errorf("expected InitialBackoff=1s, got %v", cfg.InitialBackoff)
	}
	if cfg.MaxBackoff != 10*time.Second {
		t.Errorf("expected MaxBackoff=10s, got %v", cfg.MaxBackoff)
	}
}

func TestAddCollector(t *testing.T) {
	ps := NewPulseSender("node1", "http://localhost:8080", 30*time.Second)
	collector := &mockCollector{
		heartbeat: NewHeartbeat("node1", 4096, 8192, 10),
	}
	ps.AddCollector(collector)
	if len(ps.collectors) != 1 {
		t.Errorf("expected 1 collector, got %d", len(ps.collectors))
	}
}

func TestSendPulse_GathersMetrics(t *testing.T) {
	ps := NewPulseSender("node1", "http://localhost:8080", 30*time.Second)
	httpPoster := &mockHTTPPoster{}
	ps.SetHTTPClient(httpPoster)

	collector := &mockCollector{
		heartbeat: NewHeartbeat("node1", 4096, 8192, 10),
	}
	ps.AddCollector(collector)

	ps.sendPulse()

	if collector.GetCalls() == 0 {
		t.Error("expected collector to be called")
	}
}

func TestSendPulse_SendsHTTPRequest(t *testing.T) {
	ps := NewPulseSender("node1", "http://localhost:8080", 30*time.Second)
	httpPoster := &mockHTTPPoster{}
	ps.SetHTTPClient(httpPoster)

	collector := &mockCollector{
		heartbeat: NewHeartbeat("node1", 4096, 8192, 10),
	}
	ps.AddCollector(collector)

	ps.sendPulse()

	if httpPoster.GetCalls() != 1 {
		t.Errorf("expected 1 HTTP call, got %d", httpPoster.GetCalls())
	}

	urls := httpPoster.GetCalledURLs()
	if len(urls) != 1 {
		t.Errorf("expected 1 URL, got %d", len(urls))
	}
	expectedURL := "http://localhost:8080/api/v1/telemetry/heartbeat"
	if urls[0] != expectedURL {
		t.Errorf("expected URL %s, got %s", expectedURL, urls[0])
	}
}

func TestSendWithRetry_Success(t *testing.T) {
	ps := NewPulseSender("node1", "http://localhost:8080", 30*time.Second)
	httpPoster := &mockHTTPPoster{}
	ps.SetHTTPClient(httpPoster)

	hb := NewHeartbeat("node1", 4096, 8192, 10)
	err := ps.sendWithRetry(hb)

	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}
	if httpPoster.GetCalls() != 1 {
		t.Errorf("expected 1 call (no retries needed), got %d", httpPoster.GetCalls())
	}
}

func TestSendWithRetry_RetrySucceeds(t *testing.T) {
	ps := NewPulseSender("node1", "http://localhost:8080", 30*time.Second)

	// Fail first 2 attempts, succeed on 3rd
	httpPoster := &mockHTTPPoster{failUntil: 2}
	ps.SetHTTPClient(httpPoster)

	hb := NewHeartbeat("node1", 4096, 8192, 10)
	err := ps.sendWithRetry(hb)

	if err != nil {
		t.Errorf("expected no error after retries, got %v", err)
	}
	if httpPoster.GetCalls() != 3 {
		t.Errorf("expected 3 calls (2 retries), got %d", httpPoster.GetCalls())
	}
}

func TestSendWithRetry_AllRetriesFail(t *testing.T) {
	ps := NewPulseSender("node1", "http://localhost:8080", 30*time.Second)

	// Fail all attempts
	httpPoster := &mockHTTPPoster{failUntil: 100} // More than max retries
	ps.SetHTTPClient(httpPoster)

	// Use small backoff for faster test
	ps.retryCfg.InitialBackoff = 10 * time.Millisecond
	ps.retryCfg.MaxBackoff = 50 * time.Millisecond

	hb := NewHeartbeat("node1", 4096, 8192, 10)
	err := ps.sendWithRetry(hb)

	if err == nil {
		t.Error("expected error after all retries failed")
	}
	// Should have MaxRetries+1 attempts (initial + retries)
	expectedCalls := ps.retryCfg.MaxRetries + 1
	if httpPoster.GetCalls() != expectedCalls {
		t.Errorf("expected %d calls, got %d", expectedCalls, httpPoster.GetCalls())
	}
}

func TestSendPulse_LogsGatheredMetrics(t *testing.T) {
	ps := NewPulseSender("node1", "http://localhost:8080", 30*time.Second)
	httpPoster := &mockHTTPPoster{}
	ps.SetHTTPClient(httpPoster)

	collector := &mockCollector{
		heartbeat: NewHeartbeat("node1", 4096, 8192, 10),
	}
	ps.AddCollector(collector)

	ps.sendPulse()

	if httpPoster.GetCalls() != 1 {
		t.Errorf("expected heartbeat to be sent")
	}
}

func TestSendPulse_NoCollector(t *testing.T) {
	ps := NewPulseSender("node1", "http://localhost:8080", 30*time.Second)
	httpPoster := &mockHTTPPoster{}
	ps.SetHTTPClient(httpPoster)
	// No collector added

	ps.sendPulse() // Should not panic, just log "No heartbeat data collected"

	if httpPoster.GetCalls() != 0 {
		t.Errorf("expected no HTTP calls when no collector data, got %d", httpPoster.GetCalls())
	}
}

func TestSendPulse_CollectorErrorContinues(t *testing.T) {
	ps := NewPulseSender("node1", "http://localhost:8080", 30*time.Second)
	httpPoster := &mockHTTPPoster{}
	ps.SetHTTPClient(httpPoster)

	collector := &mockCollector{
		err: context.DeadlineExceeded,
	}
	ps.AddCollector(collector)

	ps.sendPulse() // Should handle collector error gracefully

	if httpPoster.GetCalls() != 0 {
		t.Errorf("expected no HTTP calls when collector fails, got %d", httpPoster.GetCalls())
	}
}

func TestStartStop(t *testing.T) {
	ps := NewPulseSender("node1", "http://localhost:8080", 10*time.Millisecond)
	httpPoster := &mockHTTPPoster{}
	ps.SetHTTPClient(httpPoster)

	collector := &mockCollector{
		heartbeat: NewHeartbeat("node1", 4096, 8192, 10),
	}
	ps.AddCollector(collector)

	ctx, cancel := context.WithCancel(context.Background())

	// Start in goroutine
	go ps.Start(ctx)

	// Let it run for a few ticks
	time.Sleep(35 * time.Millisecond)
	cancel() // Stop

	// Should have at least a few pulses
	calls := httpPoster.GetCalls()
	if calls < 2 {
		t.Errorf("expected at least 2 pulses, got %d", calls)
	}
}

func TestStop_ClosesChannel(t *testing.T) {
	ps := NewPulseSender("node1", "http://localhost:8080", 10*time.Millisecond)

	done := make(chan bool)
	go func() {
		ps.Start(context.Background())
		done <- true
	}()

	time.Sleep(5 * time.Millisecond)
	ps.Stop()

	select {
	case <-done:
		// Success - goroutine exited
	case <-time.After(100 * time.Millisecond):
		t.Error("expected Start to return after Stop")
	}
}

func TestSetRetryConfig(t *testing.T) {
	ps := NewPulseSender("node1", "http://localhost:8080", 30*time.Second)

	newCfg := &RetryConfig{
		MaxRetries:     5,
		InitialBackoff: 2 * time.Second,
		MaxBackoff:     30 * time.Second,
	}
	ps.SetRetryConfig(newCfg)

	if ps.retryCfg.MaxRetries != 5 {
		t.Errorf("expected MaxRetries=5, got %d", ps.retryCfg.MaxRetries)
	}
	if ps.retryCfg.InitialBackoff != 2*time.Second {
		t.Errorf("expected InitialBackoff=2s, got %v", ps.retryCfg.InitialBackoff)
	}
}

func TestHeartbeat_ToReporterData(t *testing.T) {
	hb := NewHeartbeat("node1", 4096, 8192, 10)
	reporterData := hb.ToReporterData()

	if reporterData.NodeID != "node1" {
		t.Errorf("expected NodeID=node1, got %s", reporterData.NodeID)
	}
	if reporterData.VRAMUsedMB != 4096 {
		t.Errorf("expected VRAMUsedMB=4096, got %d", reporterData.VRAMUsedMB)
	}
	if reporterData.VRAMTotalMB != 8192 {
		t.Errorf("expected VRAMTotalMB=8192, got %d", reporterData.VRAMTotalMB)
	}
	if reporterData.PacketLatencyMs != 10 {
		t.Errorf("expected PacketLatencyMs=10, got %d", reporterData.PacketLatencyMs)
	}
	if reporterData.Timestamp == 0 {
		t.Error("expected non-zero timestamp")
	}
}
