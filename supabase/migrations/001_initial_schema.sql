-- ============================================
-- TENTRIST - Initial Database Schema
-- ============================================
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    wallet_address TEXT, -- Ethereum wallet address
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- API KEYS
-- ============================================
CREATE TABLE public.api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    key_hash TEXT NOT NULL UNIQUE, -- SHA256 hash of the API key
    key_prefix TEXT NOT NULL, -- First 8 chars for identification
    name TEXT NOT NULL DEFAULT 'Default',
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own API keys" ON public.api_keys
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- GPU NODES
-- ============================================
CREATE TABLE public.nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT NOT NULL UNIQUE, -- Ethereum wallet
    display_name TEXT,
    gpu_model TEXT,
    vram_total_mb BIGINT DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'busy', 'maintenance')),
    reputation_score INTEGER DEFAULT 0,
    total_jobs_completed INTEGER DEFAULT 0,
    last_heartbeat_at TIMESTAMPTZ,
    location TEXT,
    price_per_minute_usd NUMERIC(10, 6) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.nodes ENABLE ROW LEVEL SECURITY;

-- Anyone can view nodes
CREATE POLICY "Anyone can view nodes" ON public.nodes
    FOR SELECT USING (true);

-- Only owners can update their nodes (checked via wallet in app)
CREATE POLICY "Service can manage nodes" ON public.nodes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.wallet_address = nodes.wallet_address
        )
    );

-- ============================================
-- COMPUTE JOBS
-- ============================================
CREATE TYPE job_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');

CREATE TABLE public.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id_256 TEXT UNIQUE NOT NULL, -- Internal job ID
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    node_id UUID REFERENCES public.nodes(id) ON DELETE SET NULL,
    status job_status NOT NULL DEFAULT 'pending',
    job_type TEXT NOT NULL, -- 'llm_finetuning', 'batch_inference', 'rendering', etc.
    input_payload JSONB NOT NULL DEFAULT '{}',
    output_payload JSONB,
    estimated_duration_minutes INTEGER,
    actual_duration_minutes INTEGER,
    checkpoint_url TEXT,
    sla_uptime_required INTEGER, -- percentage
    sla_throughput_required BIGINT, -- tokens/sec or similar
    deadline TIMESTAMPTZ,
    budget_usd NUMERIC(12, 2),
    price_charged_usd NUMERIC(12, 2),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own jobs" ON public.jobs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create jobs" ON public.jobs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs" ON public.jobs
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- JOB CHECKPOINTS
-- ============================================
CREATE TABLE public.job_checkpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    checkpoint_number INTEGER NOT NULL,
    checkpoint_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.job_checkpoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Job owners can view checkpoints" ON public.job_checkpoints
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.jobs
            WHERE jobs.id = job_checkpoints.job_id
            AND jobs.user_id = auth.uid()
        )
    );

-- ============================================
-- NODE HEARTBEATS (time-series)
-- ============================================
CREATE TABLE public.node_heartbeats (
    id BIGSERIAL PRIMARY KEY,
    node_id UUID NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
    vram_used_mb BIGINT,
    vram_total_mb BIGINT,
    packet_latency_ms INTEGER,
    is_anomaly BOOLEAN DEFAULT FALSE,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.node_heartbeats ENABLE ROW LEVEL SECURITY;

-- Index for time-series queries
CREATE INDEX idx_heartbeats_node_time ON public.node_heartbeats (node_id, recorded_at DESC);

-- ============================================
-- SLASHING EVENTS
-- ============================================
CREATE TABLE public.slashing_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    node_id UUID NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
    slash_amount_usd NUMERIC(12, 2) NOT NULL,
    credit_amount_usd NUMERIC(12, 2) NOT NULL,
    reason TEXT NOT NULL,
    transaction_hash TEXT, -- On-chain tx
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.slashing_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own slashing events" ON public.slashing_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.jobs
            WHERE jobs.id = slashing_events.job_id
            AND jobs.user_id = auth.uid()
        )
    );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_nodes_updated_at
    BEFORE UPDATE ON public.nodes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- VIEWS
-- ============================================

-- View for job history with node info
CREATE OR REPLACE VIEW public.job_history AS
SELECT
    j.id,
    j.job_id_256,
    j.status,
    j.job_type,
    j.created_at,
    j.completed_at,
    j.budget_usd,
    j.price_charged_usd,
    n.display_name AS node_name,
    n.wallet_address AS node_wallet
FROM public.jobs j
LEFT JOIN public.nodes n ON j.node_id = n.id;

-- View for node performance stats
CREATE OR REPLACE VIEW public.node_stats AS
SELECT
    n.id,
    n.wallet_address,
    n.display_name,
    n.status,
    n.reputation_score,
    n.total_jobs_completed,
    COUNT(j.id) FILTER (WHERE j.status = 'completed') AS successful_jobs,
    COUNT(j.id) FILTER (WHERE j.status = 'failed') AS failed_jobs,
    AVG(j.actual_duration_minutes) FILTER (WHERE j.status = 'completed') AS avg_completion_time
FROM public.nodes n
LEFT JOIN public.jobs j ON n.id = j.node_id
GROUP BY n.id;
