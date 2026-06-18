-- Migration: Add onboarding fields to profiles for first-login detection
-- This enables role-specific onboarding flows for clients and node providers

-- 1. Add user_type to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS user_type TEXT CHECK (user_type IN ('client', 'provider'));

-- 2. Add onboarding_completed flag
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. Create index for fast lookup
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON public.profiles(id, onboarding_completed)
  WHERE onboarding_completed = FALSE;

-- 4. Helper view for auth callback to check onboarding status
CREATE OR REPLACE VIEW public.user_onboarding_status AS
SELECT
  id,
  COALESCE(user_type, 'client') as user_type,
  onboarding_completed,
  wallet_address IS NOT NULL AS has_wallet_linked
FROM public.profiles;

-- 5. Update existing profiles (those who logged in before this migration) to skip onboarding
-- We set onboarding_completed = TRUE for users who already have any activity
-- (no jobs, no nodes = truly new, so leave as FALSE)
-- Users with activity are assumed to have already completed implicit onboarding
UPDATE public.profiles
SET onboarding_completed = TRUE
WHERE id IN (
  SELECT DISTINCT p.id FROM public.profiles p
  LEFT JOIN public.jobs j ON j.user_id = p.id
  LEFT JOIN public.nodes n ON n.wallet_address = p.wallet_address
  WHERE j.id IS NOT NULL OR n.id IS NOT NULL
)
AND user_type IS NOT NULL;
