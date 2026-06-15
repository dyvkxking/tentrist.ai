// Package main is the entry point for the heartbeat telemetry service.
package main

import (
	"context"
	"flag"
	"log"
	"os"
	"os/signal"
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
