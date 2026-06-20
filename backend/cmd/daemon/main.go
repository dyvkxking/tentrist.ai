// Package main is the entry point for the Tentrist distributed daemon.
package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/tentrist.ai/backend/internal/alert"
	"github.com/tentrist.ai/backend/internal/alert/notifier"
	"github.com/tentrist.ai/backend/internal/collector"
	"github.com/tentrist.ai/backend/internal/maintenance"
	"github.com/tentrist.ai/backend/internal/monitor"
)

func main() {
	port := flag.Int("port", 8081, "Daemon HTTP API port")
	databaseURL := flag.String("database-url", "", "PostgreSQL connection string")
	heartbeatInterval := flag.Duration("heartbeat-interval", 30*time.Second, "Node heartbeat check interval")
	alertCheckInterval := flag.Duration("alert-check-interval", 10*time.Second, "Alert evaluation interval")
	collectorInterval := flag.Duration("collector-interval", 15*time.Second, "Metric collection interval")
	flag.Parse()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Setup signal handling
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		<-sigCh
		log.Println("Daemon: shutdown signal received")
		cancel()
	}()

	// Initialize PostgreSQL if URL provided
	var dbPool *pgxpool.Pool
	if *databaseURL != "" {
		var err error
		dbPool, err = pgxpool.New(ctx, *databaseURL)
		if err != nil {
			log.Printf("Warning: failed to create DB pool: %v (continuing without DB)", err)
			dbPool = nil
		} else {
			log.Println("Daemon: PostgreSQL connected")
		}
	}

	// Initialize collectors
	containerCol := collector.NewContainerCollector()
	processCol := collector.NewProcessCollector()
	gpuCol := collector.NewGPUCollector()
	cpuCol := collector.NewCPUCollector()
	networkCol := collector.NewNetworkCollector()
	diskCol := collector.NewDiskCollector()

	// Initialize monitors
	heartbeatMon := monitor.NewHeartbeatMonitor(dbPool, *heartbeatInterval)
	slaEnforcer := monitor.NewSLAEnforcer(dbPool)
	slashDetector := monitor.NewSlashDetector(dbPool)
	vramMon := monitor.NewVRAMMonitor(dbPool)
	latencyMon := monitor.NewLatencyMonitor(dbPool)
	uptimeMon := monitor.NewUptimeMonitor(dbPool)
	throughputMon := monitor.NewThroughputMonitor(dbPool)
	errorRateMon := monitor.NewErrorRateMonitor(dbPool)

	// Initialize alert system
	alerter := alert.NewAlerter()
	alerter.AddNotifier(notifier.NewDiscordNotifier())
	alerter.AddNotifier(notifier.NewSlackNotifier())
	alerter.AddNotifier(notifier.NewEmailNotifier())
	alerter.AddNotifier(notifier.NewWebhookNotifier())

	// Initialize maintenance window manager
	maintMgr := maintenance.NewWindowManager()

	// Start collectors in background
	var collectorWg sync.WaitGroup
	collectors := []struct {
		name string
		col  collector.Collector
	}{
		{"container", containerCol},
		{"process", processCol},
		{"gpu", gpuCol},
		{"cpu", cpuCol},
		{"network", networkCol},
		{"disk", diskCol},
	}

	collectorCtx, collectorCancel := context.WithCancel(ctx)
	for _, c := range collectors {
		collectorWg.Add(1)
		go func(name string, col collector.Collector) {
			defer collectorWg.Done()
			ticker := time.NewTicker(*collectorInterval)
			defer ticker.Stop()
			for {
				select {
				case <-collectorCtx.Done():
					return
				case <-ticker.C:
					metrics, _ := col.Collect()
					if dbPool != nil {
						collector.WriteMetrics(ctx, dbPool, name, metrics)
					}
				}
			}
		}(c.name, c.col)
	}

	// Start monitors
	monitorCtx, monitorCancel := context.WithCancel(ctx)
	var monitorWg sync.WaitGroup

	monitors := []struct {
		name   string
		mon    monitor.Monitor
		alerter *alert.Alerter
	}{
		{"heartbeat", heartbeatMon, alerter},
		{"sla", slaEnforcer, alerter},
		{"slash", slashDetector, alerter},
		{"vram", vramMon, alerter},
		{"latency", latencyMon, alerter},
		{"uptime", uptimeMon, alerter},
		{"throughput", throughputMon, alerter},
		{"errorrate", errorRateMon, alerter},
	}

	for _, m := range monitors {
		monitorWg.Add(1)
		go func(name string, mon monitor.Monitor, al *alert.Alerter) {
			defer monitorWg.Done()
			ticker := time.NewTicker(*alertCheckInterval)
			defer ticker.Stop()
			for {
				select {
				case <-monitorCtx.Done():
					return
				case <-ticker.C:
					alerts := mon.Evaluate()
					for _, a := range alerts {
						alertCtx := context.Background()
						al.RouteAlert(alertCtx, alert.Alert{
							ID:        a.ID,
							Severity:  a.Severity,
							NodeID:    a.NodeID,
							Metric:    a.Metric,
							Message:   a.Message,
							Timestamp: a.Timestamp,
							Value:     a.Value,
							Threshold: a.Threshold,
						})
					}
				}
			}
		}(m.name, m.mon, m.alerter)
	}

	// Start maintenance window processor
	monitorWg.Add(1)
	go func() {
		defer monitorWg.Done()
		maintMgr.Process(ctx)
	}()

	log.Printf("Tentrist Daemon started on :%d", *port)

	// HTTP API server for daemon
	mux := http.NewServeMux()
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, `{"status":"ok","service":"tentrist-daemon"}`)
	})
	mux.HandleFunc("/api/v1/daemon/alerts", alerter.ListAlertsHandler)
	mux.HandleFunc("/api/v1/daemon/maintenance", maintMgr.HTTPHandler)

	srv := &http.Server{Addr: fmt.Sprintf(":%d", *port), Handler: mux}
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Printf("Daemon server error: %v", err)
		}
	}()

	<-ctx.Done()
	log.Println("Daemon: shutting down...")

	collectorCancel()
	monitorCancel()
	collectorWg.Wait()
	monitorWg.Wait()

	if dbPool != nil {
		dbPool.Close()
	}
	log.Println("Daemon: stopped")
}
