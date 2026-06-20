// Package notifier provides alert notification channels.
package notifier

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"text/template"
	"time"
)

// Notifier is the interface for alert notifiers.
type Notifier interface {
	Name() string
	Send(ctx context.Context, alert Alert)
	Supports(severity string) bool
}

// Alert is the alert structure passed to notifiers.
type Alert struct {
	ID         string
	Severity   string
	NodeID     string
	Metric     string
	Message    string
	Timestamp  time.Time
	Value      float64
	Threshold  float64
}

// DiscordNotifier sends alerts to Discord.
type DiscordNotifier struct {
	webhookURL string
}

// NewDiscordNotifier creates a Discord notifier.
func NewDiscordNotifier() *DiscordNotifier {
	return &DiscordNotifier{webhookURL: os.Getenv("DISCORD_WEBHOOK_URL")}
}

func (n *DiscordNotifier) Name() string { return "discord" }

func (n *DiscordNotifier) Supports(severity string) bool {
	return true
}

func (n *DiscordNotifier) Send(ctx context.Context, alert Alert) {
	if n.webhookURL == "" {
		return
	}
	color := 0x00ff00 // green
	if alert.Severity == "warning" {
		color = 0xffaa00 // orange
	} else if alert.Severity == "critical" {
		color = 0xff0000 // red
	}

	payload := map[string]interface{}{
		"embeds": []map[string]interface{}{
			{
				"title":       fmt.Sprintf("[%s] %s", strings.ToUpper(alert.Severity), alert.Metric),
				"description": alert.Message,
				"color":       color,
				"fields": []map[string]interface{}{
					{"name": "Node", "value": alert.NodeID, "inline": true},
					{"name": "Value", "value": fmt.Sprintf("%.2f", alert.Value), "inline": true},
					{"name": "Threshold", "value": fmt.Sprintf("%.2f", alert.Threshold), "inline": true},
				},
				"timestamp": alert.Timestamp.Format(time.RFC3339),
			},
		},
	}
	body, _ := json.Marshal(payload)
	http.Post(n.webhookURL, "application/json", bytes.NewReader(body))
}

// SlackNotifier sends alerts to Slack.
type SlackNotifier struct {
	webhookURL string
}

// NewSlackNotifier creates a Slack notifier.
func NewSlackNotifier() *SlackNotifier {
	return &SlackNotifier{webhookURL: os.Getenv("SLACK_WEBHOOK_URL")}
}

func (n *SlackNotifier) Name() string { return "slack" }

func (n *SlackNotifier) Supports(severity string) bool {
	return true
}

func (n *SlackNotifier) Send(ctx context.Context, alert Alert) {
	if n.webhookURL == "" {
		return
	}
	emoji := ":large_green_circle:"
	if alert.Severity == "warning" {
		emoji = ":warning:"
	} else if alert.Severity == "critical" {
		emoji = ":rotating_light:"
	}
	payload := map[string]interface{}{
		"text": fmt.Sprintf("%s *[%s]* `%s`\n%s\nNode: `%s` Value: `%.2f` Threshold: `%.2f`",
			emoji, strings.ToUpper(alert.Severity), alert.Metric, alert.Message, alert.NodeID, alert.Value, alert.Threshold),
	}
	body, _ := json.Marshal(payload)
	http.Post(n.webhookURL, "application/json", bytes.NewReader(body))
}

// EmailNotifier sends alerts via email.
type EmailNotifier struct {
	smtpHost string
	smtpPort int
	from     string
	to      string
}

// NewEmailNotifier creates an email notifier.
func NewEmailNotifier() *EmailNotifier {
	return &EmailNotifier{
		smtpHost: os.Getenv("SMTP_HOST"),
		smtpPort: 587,
		from:     os.Getenv("ALERT_FROM_EMAIL"),
		to:       os.Getenv("ALERT_TO_EMAIL"),
	}
}

func (n *EmailNotifier) Name() string { return "email" }

func (n *EmailNotifier) Supports(severity string) bool {
	return severity == "critical" || severity == "warning"
}

func (n *EmailNotifier) Send(ctx context.Context, alert Alert) {
	if n.smtpHost == "" || n.from == "" || n.to == "" {
		return
	}
	// Email sending would use net/smtp - simplified for daemon startup
	_ = fmt.Sprintf("email alert to %s: [%s] %s - %s", n.to, alert.Severity, alert.Metric, alert.Message)
}

// WebhookNotifier sends alerts to generic webhooks.
type WebhookNotifier struct {
	url        string
	headers    map[string]string
	alertTmpl  *template.Template
}

// NewWebhookNotifier creates a webhook notifier.
func NewWebhookNotifier() *WebhookNotifier {
	url := os.Getenv("ALERT_WEBHOOK_URL")
	tmpl, _ := template.New("alert").Parse(`{"severity":"{{.Severity}}","metric":"{{.Metric}}","message":"{{.Message}}","node":"{{.NodeID}}","value":{{.Value}},"threshold":{{.Threshold}}}`)
	return &WebhookNotifier{
		url:       url,
		alertTmpl: tmpl,
		headers: map[string]string{
			"Content-Type": "application/json",
		},
	}
}

func (n *WebhookNotifier) Name() string { return "webhook" }

func (n *WebhookNotifier) Supports(severity string) bool {
	return true
}

func (n *WebhookNotifier) Send(ctx context.Context, alert Alert) {
	if n.url == "" {
		return
	}
	var buf bytes.Buffer
	n.alertTmpl.Execute(&buf, alert)
	req, _ := http.NewRequestWithContext(ctx, http.MethodPost, n.url, &buf)
	for k, v := range n.headers {
		req.Header.Set(k, v)
	}
	http.DefaultClient.Do(req)
}
