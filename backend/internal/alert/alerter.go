// Package alert provides the alerting infrastructure for the Tentrist daemon.
package alert

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/tentrist.ai/backend/internal/alert/notifier"
	"github.com/tentrist.ai/backend/internal/maintenance"
)

// Alerter routes alerts to appropriate notifiers.
type Alerter struct {
	notifiers     []notifier.Notifier
	alertHistory  []AlertRecord
	rateLimiter   map[string]time.Time
	dedupWindow   time.Duration
	mu            sync.RWMutex
	maintManager  *maintenance.WindowManager
}

// AlertRecord stores an alert for history.
type AlertRecord struct {
	Alert     Alert
	SentAt    time.Time
	Notifiers []string
	Status    string
}

// Alert is the internal alert representation.
type Alert struct {
	ID         string
	Severity   string // "info", "warning", "critical"
	NodeID     string
	Metric     string
	Message    string
	Timestamp  time.Time
	Value      float64
	Threshold  float64
}

// NewAlerter creates a new alerter.
func NewAlerter() *Alerter {
	return &Alerter{
		notifiers:   []notifier.Notifier{},
		alertHistory: []AlertRecord{},
		rateLimiter: make(map[string]time.Time),
		dedupWindow: 5 * time.Minute,
	}
}

// AddNotifier registers a notifier.
func (a *Alerter) AddNotifier(n notifier.Notifier) {
	a.notifiers = append(a.notifiers, n)
}

// RouteAlert routes an alert to all registered notifiers.
func (a *Alerter) RouteAlert(ctx context.Context, alert Alert) {
	a.mu.Lock()
	defer a.mu.Unlock()

	// Check dedup
	if lastSent, ok := a.rateLimiter[alert.ID]; ok {
		if time.Since(lastSent) < a.dedupWindow {
			return // Duplicate within window
		}
	}

	// Check rate limit (max 10 per minute per metric)
	rateKey := alert.Metric + "_" + alert.Severity
	if lastRate, ok := a.rateLimiter[rateKey]; ok {
		if time.Since(lastRate) < time.Minute/6 { // 10 per minute = 1 per 6 seconds
			return
		}
	}

	// Check maintenance window suppression
	if a.maintManager != nil && a.maintManager.IsSuppressed(alert.NodeID) {
		return
	}

	a.rateLimiter[alert.ID] = time.Now()
	a.rateLimiter[rateKey] = time.Now()

	var sentNotifiers []string
	for _, n := range a.notifiers {
		if n.Supports(alert.Severity) {
			n.Send(ctx, notifier.Alert{
				ID:        alert.ID,
				Severity:  alert.Severity,
				NodeID:    alert.NodeID,
				Metric:    alert.Metric,
				Message:   alert.Message,
				Timestamp: alert.Timestamp,
				Value:     alert.Value,
				Threshold: alert.Threshold,
			})
			sentNotifiers = append(sentNotifiers, n.Name())
		}
	}

	a.alertHistory = append(a.alertHistory, AlertRecord{
		Alert:     alert,
		SentAt:    time.Now(),
		Notifiers: sentNotifiers,
		Status:    "sent",
	})

	// Keep history bounded
	if len(a.alertHistory) > 1000 {
		a.alertHistory = a.alertHistory[len(a.alertHistory)-1000:]
	}
}

// SetMaintenanceManager sets the maintenance window manager.
func (a *Alerter) SetMaintenanceManager(m *maintenance.WindowManager) {
	a.maintManager = m
}

// ListAlerts returns recent alerts.
func (a *Alerter) ListAlerts() []AlertRecord {
	a.mu.RLock()
	defer a.mu.RUnlock()
	return a.alertHistory
}

// ListAlertsHandler is an HTTP handler for listing alerts.
func (a *Alerter) ListAlertsHandler(w http.ResponseWriter, r *http.Request) {
	alerts := a.ListAlerts()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"alerts": alerts,
		"count":  len(alerts),
	})
}

// TemplateAlert renders an alert using go templates.
func TemplateAlert(template string, alert Alert) string {
	return fmt.Sprintf("[%s] %s: %s (value=%.2f, threshold=%.2f)",
		alert.Severity, alert.Metric, alert.Message, alert.Value, alert.Threshold)
}
