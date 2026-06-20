-- ============================================
-- Migration 005: User Preference Tables
-- ============================================
-- Notification preferences and node provider preferences stored in DB

-- ============================================
-- USER NOTIFICATION PREFS
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_notification_prefs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value TEXT NOT NULL DEFAULT 'true',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, key)
);

ALTER TABLE public.user_notification_prefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notification prefs" ON public.user_notification_prefs
    FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notif_prefs_user ON public.user_notification_prefs (user_id);

-- ============================================
-- USER NODE PROVIDER PREFS
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_node_provider_prefs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    uptime_sla NUMERIC(5,2) DEFAULT 99.50,
    min_job_price_eth NUMERIC(20,8) DEFAULT 0.0001,
    preferred_region TEXT DEFAULT 'auto',
    auto_accept_jobs BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_node_provider_prefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own node provider prefs" ON public.user_node_provider_prefs
    FOR ALL USING (auth.uid() = user_id);
