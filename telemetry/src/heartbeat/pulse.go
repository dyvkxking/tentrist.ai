// Package heartbeat provides the heartbeat telemetry service.
package heartbeat

import (
	"context"
	"encoding/json"
	"log"
	"time"
)

// RetryConfig holds configuration for retry behavior.
type RetryConfig struct {
	MaxRetries     int
	InitialBackoff time.Duration
	MaxBackoff     time.Duration
}

// DefaultRetryConfig returns the default retry configuration.
func DefaultRetryConfig() *RetryConfig {
	return &RetryConfig{
		MaxRetries:     3,
		InitialBackoff: 1 * time.Second,
		MaxBackoff:     10 * time.Second,
	}
}

// PulseSender sends heartbeat pulses to the backend.
type PulseSender struct {
	nodeID     string
	backendURL string
	interval   time.Duration
	collectors []Collector
	httpClient HTTPPoster
	retryCfg   *RetryConfig
	stopCh     chan struct{}
}

// HTTPPoster defines the interface for sending HTTP requests.
type HTTPPoster interface {
	Post(ctx context.Context, url string, data []byte) error
}

// Collector gathers metrics for a heartbeat.
type Collector interface {
	Collect() (*Heartbeat, error)
}

// NewPulseSender creates a new PulseSender with default retry config.
func NewPulseSender(nodeID, backendURL string, interval time.Duration) *PulseSender {
	return &PulseSender{
		nodeID:     nodeID,
		backendURL: backendURL,
		interval:   interval,
		stopCh:     make(chan struct{}),
		retryCfg:   DefaultRetryConfig(),
	}
}

// AddCollector adds a metric collector to the pulse sender.
func (ps *PulseSender) AddCollector(c Collector) {
	ps.collectors = append(ps.collectors, c)
}

// SetHTTPClient sets a custom HTTP poster (for testing).
func (ps *PulseSender) SetHTTPClient(client HTTPPoster) {
	ps.httpClient = client
}

// SetRetryConfig sets the retry configuration.
func (ps *PulseSender) SetRetryConfig(cfg *RetryConfig) {
	ps.retryCfg = cfg
}

// Start begins sending heartbeat pulses at the configured interval.
func (ps *PulseSender) Start(ctx context.Context) {
	log.Printf("Starting heartbeat service for node %s, interval %v", ps.nodeID, ps.interval)

	ticker := time.NewTicker(ps.interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			log.Println("Heartbeat service stopped: context cancelled")
			return
		case <-ps.stopCh:
			log.Println("Heartbeat service stopped")
			return
		case <-ticker.C:
			ps.sendPulse()
		}
	}
}

// Stop stops the heartbeat service.
func (ps *PulseSender) Stop() {
	close(ps.stopCh)
}

// sendPulse gathers metrics and sends a heartbeat with retry logic.
func (ps *PulseSender) sendPulse() {
	var hb *Heartbeat

	// Gather metrics from collectors
	for _, c := range ps.collectors {
		h, err := c.Collect()
		if err != nil {
			log.Printf("Collector error: %v", err)
			continue
		}
		hb = h
		break // Use first successful collector
	}

	if hb == nil {
		log.Println("No heartbeat data collected")
		return
	}

	log.Printf("Heartbeat gathered: node=%s vram=%d/%d latency=%dms",
		hb.NodeID, hb.VRAMUsedMB, hb.VRAMTotalMB, hb.PacketLatencyMs)

	// Send to backend with retry and backoff
	if err := ps.sendWithRetry(hb); err != nil {
		log.Printf("Failed to send heartbeat after retries: %v", err)
		return
	}

	log.Printf("Heartbeat sent successfully: node=%s vram=%d/%d latency=%dms",
		hb.NodeID, hb.VRAMUsedMB, hb.VRAMTotalMB, hb.PacketLatencyMs)
}

// sendWithRetry sends a heartbeat with exponential backoff retry.
func (ps *PulseSender) sendWithRetry(hb *Heartbeat) error {
	if ps.httpClient == nil {
		// No HTTP client set, skip sending
		return nil
	}

	url := ps.backendURL + "/api/v1/telemetry/heartbeat"
	data, err := json.Marshal(hb.ToReporterData())
	if err != nil {
		return err
	}

	backoff := ps.retryCfg.InitialBackoff
	var lastErr error

	for attempt := 0; attempt <= ps.retryCfg.MaxRetries; attempt++ {
		if attempt > 0 {
			log.Printf("Retry %d/%d for heartbeat, backoff=%v", attempt, ps.retryCfg.MaxRetries, backoff)
			time.Sleep(backoff)
			// Exponential backoff with cap
			backoff *= 2
			if backoff > ps.retryCfg.MaxBackoff {
				backoff = ps.retryCfg.MaxBackoff
			}
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		err := ps.httpClient.Post(ctx, url, data)
		cancel()

		if err == nil {
			return nil
		}
		lastErr = err
		log.Printf("Heartbeat POST attempt %d failed: %v", attempt+1, err)
	}

	return lastErr
}
