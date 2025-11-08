-- Migration 012: Daily Usage Limits for TrendPulse
-- Created: 2025-11-06
-- Purpose: Implement daily generation limits per tier to create perceived value

-- ============================================================================
-- PART 1: CREATE DAILY USAGE TRACKING TABLE
-- ============================================================================

-- Track daily usage per user for rate limiting
CREATE TABLE IF NOT EXISTS public.daily_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  generations_count INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  campaigns_created INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one row per user per day
  UNIQUE(user_id, usage_date)
);

-- RLS Policies
ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily usage" ON public.daily_usage
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own daily usage" ON public.daily_usage
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own daily usage" ON public.daily_usage
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_daily_usage_user_date ON public.daily_usage(user_id, usage_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_usage_date ON public.daily_usage(usage_date);

-- ============================================================================
-- PART 2: CREATE TIER LIMITS CONFIGURATION TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tier_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tier public.subscription_tier_enum NOT NULL UNIQUE,
  daily_generations_limit INTEGER NOT NULL,
  daily_tokens_limit INTEGER,
  monthly_campaigns_limit INTEGER,
  ai_tools_limit INTEGER NOT NULL,
  can_schedule BOOLEAN DEFAULT false,
  can_publish BOOLEAN DEFAULT false,
  can_use_ai_studio BOOLEAN DEFAULT false,
  features JSONB DEFAULT '[]', -- Array of feature flags
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default tier limits
INSERT INTO public.tier_limits (tier, daily_generations_limit, daily_tokens_limit, monthly_campaigns_limit, ai_tools_limit, can_schedule, can_publish, can_use_ai_studio, features) VALUES
  ('free', 3, 10000, 5, 1, false, false, false, '["trendpulse", "copy_content"]'),
  ('pro', 25, 100000, 50, 3, true, false, false, '["trendpulse", "copy_content", "scheduling", "analytics"]'),
  ('premium', -1, -1, -1, 999, true, true, true, '["trendpulse", "copy_content", "scheduling", "direct_publishing", "ai_studio", "analytics", "priority_support"]')
ON CONFLICT (tier) DO UPDATE SET
  daily_generations_limit = EXCLUDED.daily_generations_limit,
  daily_tokens_limit = EXCLUDED.daily_tokens_limit,
  monthly_campaigns_limit = EXCLUDED.monthly_campaigns_limit,
  ai_tools_limit = EXCLUDED.ai_tools_limit,
  can_schedule = EXCLUDED.can_schedule,
  can_publish = EXCLUDED.can_publish,
  can_use_ai_studio = EXCLUDED.can_use_ai_studio,
  features = EXCLUDED.features,
  updated_at = NOW();

-- Make tier_limits publicly readable (for limit checks)
ALTER TABLE public.tier_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tier limits" ON public.tier_limits
  FOR SELECT TO authenticated
  USING (true);

-- ============================================================================
-- PART 3: HELPER FUNCTIONS
-- ============================================================================

-- Function to get user's current tier limits
CREATE OR REPLACE FUNCTION public.get_user_tier_limits(p_user_id UUID)
RETURNS TABLE (
  tier text,
  daily_generations_limit integer,
  daily_tokens_limit integer,
  monthly_campaigns_limit integer,
  ai_tools_limit integer,
  can_schedule boolean,
  can_publish boolean,
  can_use_ai_studio boolean,
  features jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    tl.tier::text,
    tl.daily_generations_limit,
    tl.daily_tokens_limit,
    tl.monthly_campaigns_limit,
    tl.ai_tools_limit,
    tl.can_schedule,
    tl.can_publish,
    tl.can_use_ai_studio,
    tl.features
  FROM public.tier_limits tl
  JOIN public.profiles p ON p.subscription_tier = tl.tier
  WHERE p.id = p_user_id;
END;
$$;

-- Function to get user's current daily usage
CREATE OR REPLACE FUNCTION public.get_user_daily_usage(p_user_id UUID)
RETURNS TABLE (
  generations_count integer,
  tokens_used integer,
  campaigns_created integer,
  usage_date date
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(du.generations_count, 0) as generations_count,
    COALESCE(du.tokens_used, 0) as tokens_used,
    COALESCE(du.campaigns_created, 0) as campaigns_created,
    COALESCE(du.usage_date, CURRENT_DATE) as usage_date
  FROM public.daily_usage du
  WHERE du.user_id = p_user_id
    AND du.usage_date = CURRENT_DATE
  UNION ALL
  SELECT 0, 0, 0, CURRENT_DATE
  WHERE NOT EXISTS (
    SELECT 1 FROM public.daily_usage
    WHERE user_id = p_user_id AND usage_date = CURRENT_DATE
  )
  LIMIT 1;
END;
$$;

-- Function to check if user can generate content (respects daily limits)
CREATE OR REPLACE FUNCTION public.can_user_generate(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier_limit INTEGER;
  v_current_usage INTEGER;
BEGIN
  -- Get tier limit
  SELECT tl.daily_generations_limit INTO v_tier_limit
  FROM public.tier_limits tl
  JOIN public.profiles p ON p.subscription_tier = tl.tier
  WHERE p.id = p_user_id;

  -- -1 means unlimited (premium)
  IF v_tier_limit = -1 THEN
    RETURN TRUE;
  END IF;

  -- Get current usage
  SELECT COALESCE(du.generations_count, 0) INTO v_current_usage
  FROM public.daily_usage du
  WHERE du.user_id = p_user_id
    AND du.usage_date = CURRENT_DATE;

  -- Check if under limit
  RETURN (COALESCE(v_current_usage, 0) < v_tier_limit);
END;
$$;

-- Function to increment daily usage
CREATE OR REPLACE FUNCTION public.increment_daily_usage(
  p_user_id UUID,
  p_tokens INTEGER DEFAULT 0
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.daily_usage (user_id, usage_date, generations_count, tokens_used, updated_at)
  VALUES (p_user_id, CURRENT_DATE, 1, p_tokens, NOW())
  ON CONFLICT (user_id, usage_date)
  DO UPDATE SET
    generations_count = public.daily_usage.generations_count + 1,
    tokens_used = public.daily_usage.tokens_used + p_tokens,
    updated_at = NOW();
END;
$$;

-- Function to increment campaign count
CREATE OR REPLACE FUNCTION public.increment_campaign_count(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.daily_usage (user_id, usage_date, campaigns_created, updated_at)
  VALUES (p_user_id, CURRENT_DATE, 1, NOW())
  ON CONFLICT (user_id, usage_date)
  DO UPDATE SET
    campaigns_created = public.daily_usage.campaigns_created + 1,
    updated_at = NOW();
END;
$$;

-- ============================================================================
-- PART 4: CLEANUP OLD USAGE DATA (OPTIONAL - RUN PERIODICALLY)
-- ============================================================================

-- Function to clean up usage data older than 90 days
CREATE OR REPLACE FUNCTION public.cleanup_old_usage_data()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM public.daily_usage
  WHERE usage_date < CURRENT_DATE - INTERVAL '90 days';

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- ============================================================================
-- PART 5: GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.get_user_tier_limits(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_daily_usage(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_user_generate(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_daily_usage(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_campaign_count(UUID) TO authenticated;

COMMENT ON TABLE public.daily_usage IS 'Tracks daily usage per user for rate limiting and analytics';
COMMENT ON TABLE public.tier_limits IS 'Defines limits and features for each subscription tier';
COMMENT ON FUNCTION public.get_user_tier_limits(UUID) IS 'Returns tier limits for a specific user';
COMMENT ON FUNCTION public.get_user_daily_usage(UUID) IS 'Returns current day usage stats for a user';
COMMENT ON FUNCTION public.can_user_generate(UUID) IS 'Checks if user can generate content based on daily limit';
COMMENT ON FUNCTION public.increment_daily_usage(UUID, INTEGER) IS 'Increments generation count and token usage for today';
COMMENT ON FUNCTION public.increment_campaign_count(UUID) IS 'Increments campaign creation count for today';
