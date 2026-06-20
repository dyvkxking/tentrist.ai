// Package monitor provides monitoring components for the Tentrist daemon.
package monitor

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Alert represents a monitoring alert.
type Alert struct {
	ID        string
	Severity  string // "info", "warning", "critical"
	NodeID    string
	Metric    string
	Message   string
	Timestamp time.Time
	Value     float64
	Threshold float64
}

// Monitor is the interface for all monitoring components.
type Monitor interface {
	Evaluate() []Alert
	Name() string
}

// HeartbeatMonitor monitors node heartbeat health.
type HeartbeatMonitor struct {
	db       *pgxpool.Pool
	interval time.Duration
}

// NewHeartbeatMonitor creates a new heartbeat monitor.
func NewHeartbeatMonitor(db *pgxpool.Pool, interval time.Duration) *HeartbeatMonitor {
	return &HeartbeatMonitor{db: db, interval: interval}
}

func (m *HeartbeatMonitor) Name() string { return "heartbeat" }

// Evaluate checks for stale or offline nodes based on heartbeat gaps.
func (m *HeartbeatMonitor) Evaluate() []Alert {
	var alerts []Alert
	if m.db == nil {
		return alerts
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	staleThreshold := time.Now().Add(-45 * time.Second)

	rows, err := m.db.Query(ctx,
		`SELECT node_id, MAX(timestamp) as last_heartbeat
		 FROM public.node_heartbeats
		 WHERE timestamp > $1
		 GROUP BY node_id`, staleThreshold,
	)
	if err != nil {
		return alerts
	}
	defer rows.Close()

	for rows.Next() {
		var nodeID string
		var lastHeartbeat time.Time
		if err := rows.Scan(&nodeID, &lastHeartbeat); err != nil {
			continue
		}
		gap := time.Since(lastHeartbeat)
		if gap > 60*time.Second {
			alerts = append(alerts, Alert{
				ID:        "hb_offline_" + nodeID,
				Severity:  "critical",
				NodeID:    nodeID,
				Metric:    "heartbeat",
				Message:   fmt.Sprintf("Node offline: no heartbeat for %s", gap.Round(time.Second)),
				Timestamp: time.Now(),
				Threshold: 60,
				Value:     gap.Seconds(),
			})
		} else if gap > 45*time.Second {
			alerts = append(alerts, Alert{
				ID:        "hb_stale_" + nodeID,
				Severity:  "warning",
				NodeID:    nodeID,
				Metric:    "heartbeat",
				Message:   fmt.Sprintf("Node stale: heartbeat delayed %s", gap.Round(time.Second)),
				Timestamp: time.Now(),
				Threshold: 45,
				Value:     gap.Seconds(),
			})
		}
	}
	return alerts
}

// SLAEnforcer enforces SLA terms on active jobs.
type SLAEnforcer struct {
	db *pgxpool.Pool
}

// NewSLAEnforcer creates a new SLA enforcer.
func NewSLAEnforcer(db *pgxpool.Pool) *SLAEnforcer {
	return &SLAEnforcer{db: db}
}

func (m *SLAEnforcer) Name() string { return "sla_enforcer" }

// Evaluate checks active jobs for SLA violations.
func (m *SLAEnforcer) Evaluate() []Alert {
	var alerts []Alert
	if m.db == nil {
		return alerts
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := m.db.Query(ctx,
		`SELECT job_id, deadline, sla_uptime_required, fulfilled
		 FROM public.jobs
		 WHERE status IN ('running', 'pending') AND deadline < NOW()`,
	)
	if err != nil {
		return alerts
	}
	defer rows.Close()

	for rows.Next() {
		var jobID string
		var deadline time.Time
		var uptimeRequired int
		var fulfilled bool
		if err := rows.Scan(&jobID, &deadline, &uptimeRequired, &fulfilled); err != nil {
			continue
		}
		if !fulfilled && deadline.Before(time.Now()) {
			alerts = append(alerts, Alert{
				ID:        "sla_breach_" + jobID,
				Severity:  "critical",
				NodeID:    "",
				Metric:    "sla_uptime",
				Message:   fmt.Sprintf("SLA breach: job %s deadline exceeded", jobID),
				Timestamp: time.Now(),
				Threshold: float64(uptimeRequired) / 100,
				Value:     0,
			})
		}
	}
	return alerts
}

// SlashDetector detects conditions that should trigger slashing.
type SlashDetector struct {
	db *pgxpool.Pool
}

// NewSlashDetector creates a new slash detector.
func NewSlashDetector(db *pgxpool.Pool) *SlashDetector {
	return &SlashDetector{db: db}
}

func (m *SlashDetector) Name() string { return "slash_detector" }

// Evaluate detects slashable conditions.
func (m *SlashDetector) Evaluate() []Alert {
	var alerts []Alert
	if m.db == nil {
		return alerts
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := m.db.Query(ctx,
		`SELECT job_id, node_address, reason, created_at
		 FROM public.slashing_events
		 WHERE created_at > NOW() - INTERVAL '1 hour'
		 ORDER BY created_at DESC LIMIT 10`,
	)
	if err != nil {
		return alerts
	}
	defer rows.Close()

	for rows.Next() {
		var jobID, nodeID, reason string
		var createdAt time.Time
		if err := rows.Scan(&jobID, &nodeID, &reason, &createdAt); err != nil {
			continue
		}
		alerts = append(alerts, Alert{
			ID:        "slash_detected_" + jobID,
			Severity:  "warning",
			NodeID:    nodeID,
			Metric:    "slashing",
			Message:   fmt.Sprintf("Slash event: %s", reason),
			Timestamp: createdAt,
		})
	}
	return alerts
}

// VRAMMonitor monitors VRAM utilization.
type VRAMMonitor struct {
	db *pgxpool.Pool
}

// NewVRAMMonitor creates a new VRAM monitor.
func NewVRAMMonitor(db *pgxpool.Pool) *VRAMMonitor {
	return &VRAMMonitor{db: db}
}

func (m *VRAMMonitor) Name() string { return "vram" }

// Evaluate checks VRAM utilization thresholds.
func (m *VRAMMonitor) Evaluate() []Alert {
	var alerts []Alert
	if m.db == nil {
		return alerts
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := m.db.Query(ctx,
		`SELECT node_id, vram_used_mb, vram_total_mb, timestamp
		 FROM public.node_heartbeats
		 WHERE timestamp > NOW() - INTERVAL '5 minutes'`,
	)
	if err != nil {
		return alerts
	}
	defer rows.Close()

	latest := make(map[string]struct{ used, total uint64; ts time.Time })
	for rows.Next() {
		var nodeID string
		var used, total uint64
		var ts time.Time
		if err := rows.Scan(&nodeID, &used, &total, &ts); err != nil {
			continue
		}
		if prev, ok := latest[nodeID]; !ok || ts.After(prev.ts) {
			latest[nodeID] = struct{ used, total uint64; ts time.Time }{used, total, ts}
		}
	}

	for nodeID, h := range latest {
		if h.total == 0 {
			continue
		}
		util := float64(h.used) / float64(h.total) * 100
		if util >= 99 {
			alerts = append(alerts, Alert{
				ID:        "vram_critical_" + nodeID,
				Severity:  "critical",
				NodeID:    nodeID,
				Metric:    "vram_utilization",
				Message:   "VRAM critical: 99%+ utilization",
				Timestamp: h.ts,
				Value:     util,
				Threshold: 99,
			})
		} else if util >= 95 {
			alerts = append(alerts, Alert{
				ID:        "vram_alert_" + nodeID,
				Severity:  "warning",
				NodeID:    nodeID,
				Metric:    "vram_utilization",
				Message:   "VRAM alert: 95%+ utilization",
				Timestamp: h.ts,
				Value:     util,
				Threshold: 95,
			})
		}
	}
	return alerts
}

// LatencyMonitor monitors packet latency.
type LatencyMonitor struct {
	db *pgxpool.Pool
}

// NewLatencyMonitor creates a new latency monitor.
func NewLatencyMonitor(db *pgxpool.Pool) *LatencyMonitor {
	return &LatencyMonitor{db: db}
}

func (m *LatencyMonitor) Name() string { return "latency" }

// Evaluate checks latency thresholds.
func (m *LatencyMonitor) Evaluate() []Alert {
	var alerts []Alert
	if m.db == nil {
		return alerts
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := m.db.Query(ctx,
		`SELECT node_id, AVG(packet_latency_ms), MAX(packet_latency_ms)
		 FROM public.node_heartbeats
		 WHERE timestamp > NOW() - INTERVAL '5 minutes'
		 GROUP BY node_id`,
	)
	if err != nil {
		return alerts
	}
	defer rows.Close()

	for rows.Next() {
		var nodeID string
		var avgLat, maxLat float64
		if err := rows.Scan(&nodeID, &avgLat, &maxLat); err != nil {
			continue
		}
		if maxLat >= 500 {
			alerts = append(alerts, Alert{
				ID:        "latency_critical_" + nodeID,
				Severity:  "critical",
				NodeID:    nodeID,
				Metric:    "packet_latency",
				Message:   fmt.Sprintf("Latency critical: max %.0fms", maxLat),
				Timestamp: time.Now(),
				Value:     maxLat,
				Threshold: 500,
			})
		} else if avgLat >= 100 {
			alerts = append(alerts, Alert{
				ID:        "latency_warning_" + nodeID,
				Severity:  "warning",
				NodeID:    nodeID,
				Metric:    "packet_latency",
				Message:   fmt.Sprintf("Latency elevated: avg %.0fms", avgLat),
				Timestamp: time.Now(),
				Value:     avgLat,
				Threshold: 100,
			})
		}
	}
	return alerts
}

// UptimeMonitor monitors node availability.
type UptimeMonitor struct {
	db *pgxpool.Pool
}

// NewUptimeMonitor creates a new uptime monitor.
func NewUptimeMonitor(db *pgxpool.Pool) *UptimeMonitor {
	return &UptimeMonitor{db: db}
}

func (m *UptimeMonitor) Name() string { return "uptime" }

// Evaluate calculates 24h uptime percentages.
func (m *UptimeMonitor) Evaluate() []Alert {
	var alerts []Alert
	if m.db == nil {
		return alerts
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := m.db.Query(ctx,
		`SELECT node_id, COUNT(*) as total_heartbeats
		 FROM public.node_heartbeats
		 WHERE timestamp > NOW() - INTERVAL '24 hours'
		 GROUP BY node_id`,
	)
	if err != nil {
		return alerts
	}
	defer rows.Close()

	for rows.Next() {
		var nodeID string
		var totalHeartbeats int
		if err := rows.Scan(&nodeID, &totalHeartbeats); err != nil {
			continue
		}
		// Expected heartbeats in 24h at 30s intervals = 2880
		expected := 2880
		uptimePct := float64(totalHeartbeats) / float64(expected) * 100
		if uptimePct < 90 {
			alerts = append(alerts, Alert{
				ID:        "uptime_critical_" + nodeID,
				Severity:  "critical",
				NodeID:    nodeID,
				Metric:    "uptime_24h",
				Message:   fmt.Sprintf("Uptime critical: %.1f%% in 24h", uptimePct),
				Timestamp: time.Now(),
				Value:     uptimePct,
				Threshold: 90,
			})
		}
	}
	return alerts
}

// ThroughputMonitor monitors bandwidth utilization.
type ThroughputMonitor struct {
	db *pgxpool.Pool
}

// NewThroughputMonitor creates a new throughput monitor.
func NewThroughputMonitor(db *pgxpool.Pool) *ThroughputMonitor {
	return &ThroughputMonitor{db: db}
}

func (m *ThroughputMonitor) Name() string { return "throughput" }

// Evaluate detects throughput degradation.
func (m *ThroughputMonitor) Evaluate() []Alert {
	var alerts []Alert
	return alerts
}

// ErrorRateMonitor monitors error rates.
type ErrorRateMonitor struct {
	db *pgxpool.Pool
}

// NewErrorRateMonitor creates a new error rate monitor.
func NewErrorRateMonitor(db *pgxpool.Pool) *ErrorRateMonitor {
	return &ErrorRateMonitor{db: db}
}

func (m *ErrorRateMonitor) Name() string { return "error_rate" }

// Evaluate monitors error rate thresholds.
func (m *ErrorRateMonitor) Evaluate() []Alert {
	var alerts []Alert
	if m.db == nil {
		return alerts
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := m.db.Query(ctx,
		`SELECT node_id, COUNT(*) as total,
		 SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failures
		 FROM public.node_assignments
		 WHERE created_at > NOW() - INTERVAL '24 hours'
		 GROUP BY node_id`,
	)
	if err != nil {
		return alerts
	}
	defer rows.Close()

	for rows.Next() {
		var nodeID string
		var total, failures int
		if err := rows.Scan(&nodeID, &total, &failures); err != nil {
			continue
		}
		if total == 0 {
			continue
		}
		errRate := float64(failures) / float64(total) * 100
		if errRate >= 5 {
			alerts = append(alerts, Alert{
				ID:        "error_critical_" + nodeID,
				Severity:  "critical",
				NodeID:    nodeID,
				Metric:    "error_rate",
				Message:   fmt.Sprintf("Error rate critical: %.1f%% failure rate", errRate),
				Timestamp: time.Now(),
				Value:     errRate,
				Threshold: 5,
			})
		} else if errRate >= 1 {
			alerts = append(alerts, Alert{
				ID:        "error_warning_" + nodeID,
				Severity:  "warning",
				NodeID:    nodeID,
				Metric:    "error_rate",
				Message:   fmt.Sprintf("Error rate elevated: %.1f%% failure rate", errRate),
				Timestamp: time.Now(),
				Value:     errRate,
				Threshold: 1,
			})
		}
	}
	return alerts
}
