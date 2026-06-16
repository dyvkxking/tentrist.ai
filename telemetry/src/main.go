// Package main is the entry point for the heartbeat telemetry service.
package main

import (
	"context"
	"flag"
	"log"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/tentrist.ai/telemetry/src/collector"
	"github.com/tentrist.ai/telemetry/src/detector"
	"github.com/tentrist.ai/telemetry/src/heartbeat"
	"github.com/tentrist.ai/telemetry/src/reporter"
)

func main() {
	// Parse command line flags
	nodeID := flag.String("node-id", "default-node", "The node ID for this instance")
	backendURL := flag.String("backend-url", "http://localhost:8080", "The backend API URL")
	interval := flag.Duration("interval", 30*time.Second, "Heartbeat interval")
	flag.Parse()

	log.Printf("Starting heartbeat telemetry service...")
	log.Printf("Node ID: %s", *nodeID)
	log.Printf("Backend URL: %s", *backendURL)
	log.Printf("Interval: %v", *interval)

	// Create context that cancels on SIGINT/SIGTERM
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Setup signal handling
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		<-sigCh
		log.Println("Received shutdown signal")
		cancel()
	}()

	// Create heartbeat components
	hbReporter := reporter.NewReporter(*backendURL)
	pulseSender := heartbeat.NewPulseSender(*nodeID, *backendURL, *interval)

	// Create task executor for hybrid model micro-task tracking
	taskExecutor := NewMicroTaskExecutor()
	pulseSender.SetTaskExecutor(taskExecutor)

	// Create and add collectors
	vramCollector := collector.NewVRAMCollector(*nodeID)
	latencyCollector := collector.NewLatencyCollector(*nodeID, *backendURL)

	pulseSender.AddCollector(vramCollector)
	pulseSender.AddCollector(latencyCollector)

	// Set the reporter directly on the pulse sender using the HTTP poster interface
	pulseSender.SetHTTPClient(hbReporter)

	// Create failure detector
	failureDetector := detector.NewFailureDetector(*interval, *interval*2)

	// Wrap collector to update failure detector
	monitoringCollector := &monitoringCollector{
		delegate: vramCollector,
		detector: failureDetector,
		nodeID:   *nodeID,
	}
	pulseSender.AddCollector(monitoringCollector)

	// Start the heartbeat service
	pulseSender.Start(ctx)

	log.Println("Heartbeat telemetry service stopped")
}

// MicroTask represents a micro-task received from the backend.
type MicroTask struct {
	TaskID    string
	Payload   []byte
	StartTime time.Time
}

// MicroTaskExecutor tracks micro-task execution and aggregates processing duration.
// In the hybrid model, when the Go backend proxies a micro-task to this node,
// the daemon tracks its inner execution time and appends that to the next heartbeat.
type MicroTaskExecutor struct {
	mu                sync.RWMutex
	processingDurations []uint64 // Individual task durations in ms
	currentTask       *MicroTask
}

// NewMicroTaskExecutor creates a new MicroTaskExecutor.
func NewMicroTaskExecutor() *MicroTaskExecutor {
	return &MicroTaskExecutor{
		processingDurations: make([]uint64, 0),
	}
}

// ExecuteTask starts tracking a new micro-task.
// Returns the task ID for tracking.
func (m *MicroTaskExecutor) ExecuteTask(taskID string, payload []byte) {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.currentTask = &MicroTask{
		TaskID:    taskID,
		Payload:   payload,
		StartTime: time.Now(),
	}
	log.Printf("Micro-task started: taskID=%s payloadSize=%d", taskID, len(payload))
}

// CompleteTask finishes tracking the current micro-task and records its duration.
func (m *MicroTaskExecutor) CompleteTask() {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.currentTask == nil {
		return
	}

	durationMs := uint64(time.Since(m.currentTask.StartTime).Milliseconds())
	m.processingDurations = append(m.processingDurations, durationMs)
	log.Printf("Micro-task completed: taskID=%s durationMs=%d", m.currentTask.TaskID, durationMs)
	m.currentTask = nil
}

// GetTotalProcessingDuration returns the aggregated processing duration since last reset.
func (m *MicroTaskExecutor) GetTotalProcessingDuration() uint64 {
	m.mu.RLock()
	defer m.mu.RUnlock()

	var total uint64
	for _, d := range m.processingDurations {
		total += d
	}
	return total
}

// Reset clears the processing duration history.
func (m *MicroTaskExecutor) Reset() {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.processingDurations = make([]uint64, 0)
}

// GetCurrentTask returns the currently executing task, if any.
func (m *MicroTaskExecutor) GetCurrentTask() *MicroTask {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.currentTask
}

// monitoringCollector wraps a collector to update the failure detector.
type monitoringCollector struct {
	delegate collector.Collector
	detector *detector.FailureDetector
	nodeID   string
}

func (m *monitoringCollector) Collect() (*heartbeat.Heartbeat, error) {
	hb, err := m.delegate.Collect()
	if err != nil {
		return nil, err
	}

	// Update failure detector with current time
	m.detector.UpdateHeartbeat(m.nodeID, time.Now())

	// Check for anomalies using heartbeat data
	detectorHb := &detector.Heartbeat{
		NodeID:          hb.NodeID,
		VRAMUsedMB:      hb.VRAMUsedMB,
		VRAMTotalMB:     hb.VRAMTotalMB,
		PacketLatencyMs: hb.PacketLatencyMs,
	}
	if m.detector.DetectAnomalies(detectorHb) {
		log.Printf("Anomaly detected for node %s", m.nodeID)
	}

	return hb, nil
}
