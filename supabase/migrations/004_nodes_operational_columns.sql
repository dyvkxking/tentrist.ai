-- ============================================
-- Migration 004: Nodes Operational Columns
-- ============================================
-- Adds real-time operational columns to nodes table
-- for VRAM usage, CPU cores, uptime, stake tracking

ALTER TABLE public.nodes ADD COLUMN IF NOT EXISTS stake_amount TEXT DEFAULT '0';
ALTER TABLE public.nodes ADD COLUMN IF NOT EXISTS vram_used_mb BIGINT DEFAULT 0;
ALTER TABLE public.nodes ADD COLUMN IF NOT EXISTS cpu_cores INTEGER DEFAULT 0;
ALTER TABLE public.nodes ADD COLUMN IF NOT EXISTS uptime_seconds BIGINT DEFAULT 0;
ALTER TABLE public.nodes ADD COLUMN IF NOT EXISTS total_jobs_failed INTEGER DEFAULT 0;

-- Index for stake filtering
CREATE INDEX IF NOT EXISTS idx_nodes_stake ON public.nodes ((stake_amount::numeric(78,0)));

-- Index for heartbeat/liveness queries
CREATE INDEX IF NOT EXISTS idx_nodes_last_heartbeat ON public.nodes (last_heartbeat_at DESC) WHERE status = 'online';
