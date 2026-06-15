// Package collector provides metric collectors for the telemetry service.
package collector

import (
	"github.com/tentrist.ai/telemetry/src/heartbeat"
)

// Collector gathers metrics for the heartbeat service.
type Collector interface {
	Collect() (*heartbeat.Heartbeat, error)
}
