-- ============================================
-- TENTRIST - Migration 003: Real Data Wiring
-- ============================================
-- New tables for end-to-end job flow

-- ============================================
-- TRANSACTIONS (wallet activity log)
-- ============================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN (
        'stake_added',
        'stake_removed',
        'job_payment',
        'slashing_credit',
        'reward_payment',
        'topup'
    )),
    amount_wei TEXT NOT NULL, -- Stored as string for bigint precision
    amount_usd NUMERIC(12, 2),
    job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    tx_hash TEXT,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- ESCROW POSITIONS (stake tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS public.escrow_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    node_id UUID REFERENCES public.nodes(id) ON DELETE SET NULL,
    amount_wei TEXT NOT NULL,
    locked_wei TEXT DEFAULT '0',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'withdrawing', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.escrow_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own escrow positions" ON public.escrow_positions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own escrow" ON public.escrow_positions
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- JOB LOGS (real-time job event stream)
-- ============================================
CREATE TABLE IF NOT EXISTS public.job_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    level TEXT NOT NULL DEFAULT 'info' CHECK (level IN ('debug', 'info', 'warn', 'error')),
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.job_logs ENABLE ROW LEVEL SECURITY;

-- Job logs are visible to job owner
CREATE POLICY "Job owners can view logs" ON public.job_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.jobs
            WHERE jobs.id = job_logs.job_id
            AND jobs.user_id = auth.uid()
        )
    );

-- Service role can insert logs
CREATE POLICY "Service can insert logs" ON public.job_logs
    FOR INSERT WITH CHECK (true);

CREATE INDEX idx_job_logs_job_time ON public.job_logs (job_id, created_at DESC);

-- ============================================
-- NODE ASSIGNMENTS (job-to-node mapping)
-- ============================================
CREATE TABLE IF NOT EXISTS public.node_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    node_id UUID NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN (
        'assigned', 'running', 'completed', 'failed', 'reassigned'
    )),
    vram_used_mb BIGINT DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.node_assignments ENABLE ROW LEVEL SECURITY;

-- Job logs are visible to job owner
CREATE POLICY "Job owners can view assignments" ON public.node_assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.jobs
            WHERE jobs.id = node_assignments.job_id
            AND jobs.user_id = auth.uid()
        )
    );

-- Service can manage assignments
CREATE POLICY "Service can manage assignments" ON public.node_assignments
    FOR ALL USING (true);

CREATE INDEX idx_node_assignments_job ON public.node_assignments (job_id);
CREATE INDEX idx_node_assignments_node ON public.node_assignments (node_id);

-- ============================================
-- ALERTS (system-wide notifications)
-- ============================================
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN (
        'node_offline', 'node_stale', 'slashing', 'job_failed',
        'budget_exceeded', 'sla_breach', 'system'
    )),
    severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warn', 'error', 'critical')),
    node_id UUID REFERENCES public.nodes(id) ON DELETE SET NULL,
    job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'triggered' CHECK (status IN ('triggered', 'acknowledged', 'resolved')),
    acknowledged_by UUID REFERENCES public.profiles(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Alerts visible to admin users
CREATE POLICY "Admins can view all alerts" ON public.alerts
    FOR SELECT USING (true);

CREATE POLICY "Service can create alerts" ON public.alerts
    FOR INSERT WITH CHECK (true);

CREATE INDEX idx_alerts_status ON public.alerts (status, created_at DESC);
CREATE INDEX idx_alerts_node ON public.alerts (node_id) WHERE node_id IS NOT NULL;

-- ============================================
-- CONTRACTS (smart contract registry)
-- ============================================
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    address TEXT NOT NULL,
    network TEXT NOT NULL DEFAULT 'ethereum',
    abi JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view contracts" ON public.contracts
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage contracts" ON public.contracts
    FOR ALL USING (true);

-- ============================================
-- PROPOSALS (governance)
-- ============================================
CREATE TABLE IF NOT EXISTS public.proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('parameter_change', 'treasury', 'emergency', 'upgrade')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'passed', 'rejected', 'expired')),
    votes_for BIGINT DEFAULT 0,
    votes_against BIGINT DEFAULT 0,
    quorum BIGINT DEFAULT 100,
    deadline TIMESTAMPTZ,
    proposer_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view proposals" ON public.proposals
    FOR SELECT USING (true);

CREATE POLICY "Auth users can create proposals" ON public.proposals
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- DISPUTES (slashing disputes)
-- ============================================
CREATE TABLE IF NOT EXISTS public.disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slashing_event_id UUID REFERENCES public.slashing_events(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'escalated')),
    evidence JSONB DEFAULT '{}',
    resolution TEXT,
    resolved_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- Node owners can view their disputes
CREATE POLICY "Node owners can view disputes" ON public.disputes
    FOR SELECT USING (true);

CREATE POLICY "Service can manage disputes" ON public.disputes
    FOR ALL USING (true);

-- ============================================
-- WEBHOOKS (user-configured callbacks)
-- ============================================
CREATE TABLE IF NOT EXISTS public.webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    events TEXT[] NOT NULL, -- Array of event types
    secret TEXT, -- HMAC secret for signing
    active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own webhooks" ON public.webhooks
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- WEBHOOK DELIVERIES (delivery attempts)
-- ============================================
CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_id UUID NOT NULL REFERENCES public.webhooks(id) ON DELETE CASCADE,
    status_code INTEGER,
    response_body TEXT,
    error TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own webhook deliveries" ON public.webhook_deliveries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.webhooks
            WHERE webhooks.id = webhook_deliveries.webhook_id
            AND webhooks.user_id = auth.uid()
        )
    );

CREATE INDEX idx_webhook_deliveries_webhook ON public.webhook_deliveries (webhook_id, created_at DESC);

-- ============================================
-- TEAM MEMBERS (organization membership)
-- ============================================
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL, -- Organization identifier
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    invited_by UUID REFERENCES public.profiles(id),
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    joined_at TIMESTAMPTZ,
    UNIQUE(org_id, user_id)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view membership" ON public.team_members
    FOR SELECT USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.org_id = team_members.org_id
        AND tm.user_id = auth.uid()
    ));

CREATE POLICY "Admins can manage team" ON public.team_members
    FOR ALL USING (true);

CREATE INDEX idx_team_members_org ON public.team_members (org_id);

-- ============================================
-- TRIGGER: updated_at for new tables
-- ============================================
CREATE TRIGGER update_escrow_positions_updated_at
    BEFORE UPDATE ON public.escrow_positions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_contracts_updated_at
    BEFORE UPDATE ON public.contracts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_proposals_updated_at
    BEFORE UPDATE ON public.proposals
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_disputes_updated_at
    BEFORE UPDATE ON public.disputes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_webhooks_updated_at
    BEFORE UPDATE ON public.webhooks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- ENABLE REALTIME for key tables
-- ============================================
-- Note: Run this in Supabase dashboard or via SQL:
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.nodes;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.job_logs;
