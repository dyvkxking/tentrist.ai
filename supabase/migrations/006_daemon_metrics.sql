-- Migration: 006_daemon_metrics
-- Adds daemon_metrics table for distributed daemon metric collection

CREATE TABLE IF NOT EXISTS public.daemon_metrics (
    id BIGSERIAL PRIMARY KEY,
    collector_name TEXT NOT NULL,
    metrics_json JSONB NOT NULL,
    collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daemon_metrics_collector ON public.daemon_metrics(collector_name);
CREATE INDEX IF NOT EXISTS idx_daemon_metrics_collected_at ON public.daemon_metrics(collected_at DESC);
