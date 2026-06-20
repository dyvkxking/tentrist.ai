// Package collector provides metric collection components for the Tentrist daemon.
package collector

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Metrics represents a set of collected metrics.
type Metrics map[string]interface{}

// Collector is the interface for all metric collectors.
type Collector interface {
	Collect() (Metrics, error)
	Name() string
}

// ContainerCollector collects Docker container metrics.
type ContainerCollector struct{}

// NewContainerCollector creates a new container collector.
func NewContainerCollector() *ContainerCollector { return &ContainerCollector{} }

func (c *ContainerCollector) Name() string { return "container" }

// Collect gathers Docker container statistics.
func (c *ContainerCollector) Collect() (Metrics, error) {
	m := Metrics{}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, "docker", "stats", "--no-stream", "--format", "{{.Container}}|{{.CPUPerc}}|{{.MemUsage}}")
	out, err := cmd.Output()
	if err != nil {
		m["available"] = false
		return m, nil
	}

	var containers []map[string]string
	for _, line := range strings.Split(string(out), "\n") {
		if strings.TrimSpace(line) == "" {
			continue
		}
		parts := strings.Split(line, "|")
		if len(parts) >= 3 {
			containers = append(containers, map[string]string{
				"container": parts[0],
				"cpu_pct":   parts[1],
				"mem":       parts[2],
			})
		}
	}

	m["available"] = true
	m["containers"] = containers
	m["container_count"] = len(containers)
	return m, nil
}

// ProcessCollector collects process-level metrics.
type ProcessCollector struct {
	pid int
}

// NewProcessCollector creates a new process collector.
func NewProcessCollector() *ProcessCollector {
	return &ProcessCollector{pid: os.Getpid()}
}

func (c *ProcessCollector) Name() string { return "process" }

// Collect gathers process metrics from /proc.
func (c *ProcessCollector) Collect() (Metrics, error) {
	m := Metrics{}
	m["pid"] = c.pid

	stat, err := os.ReadFile(fmt.Sprintf("/proc/%d/stat", c.pid))
	if err != nil {
		return m, nil
	}
	// Fields after comm (in parens): state ppid ... utime(14) stime(15)
	parts := strings.Split(string(stat), " ")
	if len(parts) > 15 {
		var utime, stime int
		fmt.Sscanf(parts[14], "%d", &utime)
		fmt.Sscanf(parts[15], "%d", &stime)
		m["cpu_ticks"] = utime + stime
	}

	status, err := os.ReadFile(fmt.Sprintf("/proc/%d/status", c.pid))
	if err == nil {
		for _, line := range strings.Split(string(status), "\n") {
			if strings.HasPrefix(line, "VmRSS:") {
				var kb int
				fmt.Sscanf(strings.TrimSpace(line[6:]), "%d", &kb)
				m["memory_rss_kb"] = kb
				break
			}
		}
	}
	return m, nil
}

// GPUCollector collects NVIDIA GPU metrics via nvidia-smi.
type GPUCollector struct{}

// NewGPUCollector creates a new GPU collector.
func NewGPUCollector() *GPUCollector { return &GPUCollector{} }

func (c *GPUCollector) Name() string { return "gpu" }

// Collect gathers GPU metrics from nvidia-smi.
func (c *GPUCollector) Collect() (Metrics, error) {
	m := Metrics{}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, "nvidia-smi",
		"--query-gpu=index,utilization.gpu,memory.used,memory.total,temperature.gpu,power.draw",
		"--format=csv,noheader,nounits")
	out, err := cmd.Output()
	if err != nil {
		m["available"] = false
		return m, nil
	}

	var gpus []map[string]interface{}
	for _, line := range strings.Split(string(out), "\n") {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		fields := strings.Split(line, ", ")
		if len(fields) >= 6 {
			var idx, util, memUsed, memTotal, temp, power int
			fmt.Sscanf(fields[0], "%d", &idx)
			fmt.Sscanf(fields[1], "%d", &util)
			fmt.Sscanf(fields[2], "%d", &memUsed)
			fmt.Sscanf(fields[3], "%d", &memTotal)
			fmt.Sscanf(fields[4], "%d", &temp)
			fmt.Sscanf(fields[5], "%d", &power)
			gpus = append(gpus, map[string]interface{}{
				"index":        idx,
				"utilization":  util,
				"memory_used":  memUsed,
				"memory_total": memTotal,
				"temperature":  temp,
				"power_draw":   power,
			})
		}
	}

	m["available"] = true
	m["gpus"] = gpus
	m["gpu_count"] = len(gpus)
	return m, nil
}

// CPUCollector collects CPU metrics.
type CPUCollector struct{}

// NewCPUCollector creates a new CPU collector.
func NewCPUCollector() *CPUCollector { return &CPUCollector{} }

func (c *CPUCollector) Name() string { return "cpu" }

// Collect gathers CPU metrics.
func (c *CPUCollector) Collect() (Metrics, error) {
	m := Metrics{}

	data, err := os.ReadFile("/proc/stat")
	if err != nil {
		return m, nil
	}

	for _, line := range strings.Split(string(data), "\n") {
		if strings.HasPrefix(line, "cpu ") {
			fields := strings.Fields(line)
			if len(fields) >= 5 {
				var user, nice, sys, idle int
				fmt.Sscanf(fields[1], "%d", &user)
				fmt.Sscanf(fields[2], "%d", &nice)
				fmt.Sscanf(fields[3], "%d", &sys)
				fmt.Sscanf(fields[4], "%d", &idle)
				total := user + nice + sys + idle
				m["cpu_user"] = user
				m["cpu_system"] = sys
				m["cpu_idle"] = idle
				if total > 0 {
					m["cpu_usage_pct"] = float64(total-idle) / float64(total) * 100
				}
			}
			break
		}
	}
	return m, nil
}

// NetworkCollector collects network I/O metrics.
type NetworkCollector struct{}

// NewNetworkCollector creates a new network collector.
func NewNetworkCollector() *NetworkCollector { return &NetworkCollector{} }

func (c *NetworkCollector) Name() string { return "network" }

// Collect gathers network I/O stats.
func (c *NetworkCollector) Collect() (Metrics, error) {
	m := Metrics{}

	data, err := os.ReadFile("/proc/net/dev")
	if err != nil {
		return m, nil
	}

	var rxBytes, txBytes uint64
	for _, line := range strings.Split(string(data), "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "Inter") || strings.HasPrefix(line, "Face") {
			continue
		}
		colon := strings.Index(line, ":")
		if colon == -1 {
			continue
		}
		fields := strings.Fields(line[colon+1:])
		if len(fields) >= 9 {
			var rxb, txb uint64
			fmt.Sscanf(fields[0], "%llu", &rxb)
			fmt.Sscanf(fields[8], "%llu", &txb)
			rxBytes += rxb
			txBytes += txb
		}
	}

	m["rx_bytes"] = rxBytes
	m["tx_bytes"] = txBytes
	return m, nil
}

// DiskCollector collects disk I/O metrics.
type DiskCollector struct{}

// NewDiskCollector creates a new disk collector.
func NewDiskCollector() *DiskCollector { return &DiskCollector{} }

func (c *DiskCollector) Name() string { return "disk" }

// Collect gathers disk I/O stats.
func (c *DiskCollector) Collect() (Metrics, error) {
	m := Metrics{}

	data, err := os.ReadFile("/proc/diskstats")
	if err != nil {
		return m, nil
	}

	var totalRead, totalWrite uint64
	for _, line := range strings.Split(string(data), "\n") {
		fields := strings.Fields(line)
		if len(fields) >= 14 {
			var rd, wr uint64
			fmt.Sscanf(fields[5], "%llu", &rd)
			fmt.Sscanf(fields[9], "%llu", &wr)
			totalRead += rd
			totalWrite += wr
		}
	}

	m["sectors_read"] = totalRead
	m["sectors_write"] = totalWrite
	m["read_mb"] = totalRead * 512 / 1024 / 1024
	m["write_mb"] = totalWrite * 512 / 1024 / 1024
	return m, nil
}

// WriteMetrics persists collected metrics to PostgreSQL.
func WriteMetrics(ctx context.Context, db *pgxpool.Pool, collectorName string, metrics Metrics) {
	if db == nil {
		return
	}
	data, err := json.Marshal(metrics)
	if err != nil {
		return
	}
	ctx2, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	db.Exec(ctx2,
		`INSERT INTO public.daemon_metrics (collector_name, metrics_json, collected_at)
		 VALUES ($1, $2, NOW())`,
		collectorName, string(data))
}
