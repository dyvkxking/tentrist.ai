-- Migration: 007_distributed_checkpoints
-- Adds job_checkpoints table for distributed checkpoint persistence

CREATE TABLE IF NOT EXISTS public.job_checkpoints (
    id BIGSERIAL PRIMARY KEY,
    ref TEXT UNIQUE NOT NULL,
    job_id TEXT NOT NULL,
    unit_index INTEGER NOT NULL,
    node_id TEXT NOT NULL,
    state BYTEA NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sequence INTEGER NOT NULL,
    created_at_local TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checkpoints_job_id ON public.job_checkpoints(job_id);
CREATE INDEX IF NOT EXISTS idx_checkpoints_ref ON public.job_checkpoints(ref);
CREATE INDEX IF NOT EXISTS idx_checkpoints_created_at ON public.job_checkpoints(created_at DESC);
