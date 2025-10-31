-- Analytics Schema for TrendPulse Beta
-- Tracks user behavior, content generation, platform performance, and engagement

-- 1. User Analytics Events
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'login', 'signup', 'content_generated', 'content_published', 'tier_upgrade', 'platform_connected', 'platform_disconnected', 'error'
  event_category TEXT, -- 'auth', 'content', 'social', 'payment', 'error'
  event_data JSONB, -- Flexible storage for event-specific data
  session_id TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast queries by user and event type
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_created ON public.analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_category ON public.analytics_events(event_category);

-- 2. Campaign Analytics (extends existing campaigns table)
CREATE TABLE public.campaign_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  likes INT DEFAULT 0,
  shares INT DEFAULT 0,
  comments INT DEFAULT 0,
  engagement_rate DECIMAL(5,2), -- Calculated percentage
  reach INT DEFAULT 0,
  conversion_count INT DEFAULT 0,
  revenue_generated DECIMAL(10,2),
  tracked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast queries
CREATE INDEX idx_campaign_analytics_campaign ON public.campaign_analytics(campaign_id);
CREATE INDEX idx_campaign_analytics_user ON public.campaign_analytics(user_id);
CREATE INDEX idx_campaign_analytics_platform ON public.campaign_analytics(platform);

-- 3. Platform Performance Metrics
CREATE TABLE public.platform_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  metric_date DATE NOT NULL,
  posts_published INT DEFAULT 0,
  total_impressions INT DEFAULT 0,
  total_engagement INT DEFAULT 0,
  total_clicks INT DEFAULT 0,
  followers_gained INT DEFAULT 0,
  followers_lost INT DEFAULT 0,
  avg_engagement_rate DECIMAL(5,2),
  best_post_time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform, metric_date)
);

-- Index for fast queries
CREATE INDEX idx_platform_metrics_user ON public.platform_metrics(user_id);
CREATE INDEX idx_platform_metrics_date ON public.platform_metrics(metric_date DESC);
CREATE INDEX idx_platform_metrics_platform ON public.platform_metrics(platform);

-- 4. User Usage Metrics (for tier limits and quotas)
CREATE TABLE public.usage_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  content_generated_count INT DEFAULT 0,
  content_published_count INT DEFAULT 0,
  ai_requests_count INT DEFAULT 0,
  ai_tokens_used INT DEFAULT 0,
  platforms_connected_count INT DEFAULT 0,
  api_calls_count INT DEFAULT 0,
  storage_used_mb INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, metric_date)
);

-- Index for fast queries
CREATE INDEX idx_usage_metrics_user ON public.usage_metrics(user_id);
CREATE INDEX idx_usage_metrics_date ON public.usage_metrics(metric_date DESC);

-- 5. Feature Usage Tracking (identify popular features)
CREATE TABLE public.feature_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL, -- 'ai_studio', 'campaign_wizard', 'scheduler', 'analytics', 'brand_voice', etc.
  usage_count INT DEFAULT 1,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, feature_name)
);

-- Index for fast queries
CREATE INDEX idx_feature_usage_user ON public.feature_usage(user_id);
CREATE INDEX idx_feature_usage_feature ON public.feature_usage(feature_name);
CREATE INDEX idx_feature_usage_last_used ON public.feature_usage(last_used_at DESC);

-- Row Level Security Policies

-- Analytics Events: Users can only read their own events
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own analytics events"
  ON public.analytics_events
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert analytics events"
  ON public.analytics_events
  FOR INSERT
  WITH CHECK (true); -- Allow service role to insert

-- Campaign Analytics: Users can only read their own campaign analytics
ALTER TABLE public.campaign_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own campaign analytics"
  ON public.campaign_analytics
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can manage campaign analytics"
  ON public.campaign_analytics
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Platform Metrics: Users can only read their own metrics
ALTER TABLE public.platform_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own platform metrics"
  ON public.platform_metrics
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can manage platform metrics"
  ON public.platform_metrics
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Usage Metrics: Users can only read their own usage
ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own usage metrics"
  ON public.usage_metrics
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can manage usage metrics"
  ON public.usage_metrics
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Feature Usage: Users can read their own feature usage
ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own feature usage"
  ON public.feature_usage
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can manage feature usage"
  ON public.feature_usage
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Functions for analytics aggregation

-- Function to get user overview stats
CREATE OR REPLACE FUNCTION get_user_analytics_overview(p_user_id UUID, p_days INT DEFAULT 30)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_content_generated', (
      SELECT COUNT(*)
      FROM analytics_events
      WHERE user_id = p_user_id
        AND event_type = 'content_generated'
        AND created_at >= NOW() - (p_days || ' days')::INTERVAL
    ),
    'total_content_published', (
      SELECT COUNT(*)
      FROM analytics_events
      WHERE user_id = p_user_id
        AND event_type = 'content_published'
        AND created_at >= NOW() - (p_days || ' days')::INTERVAL
    ),
    'platforms_connected', (
      SELECT COUNT(*)
      FROM social_accounts
      WHERE user_id = p_user_id AND is_active = true
    ),
    'total_campaigns', (
      SELECT COUNT(*)
      FROM campaigns
      WHERE user_id = p_user_id
        AND created_at >= NOW() - (p_days || ' days')::INTERVAL
    ),
    'active_users_count', (
      SELECT COUNT(DISTINCT user_id)
      FROM analytics_events
      WHERE created_at >= NOW() - (p_days || ' days')::INTERVAL
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- Function to track feature usage
CREATE OR REPLACE FUNCTION track_feature_usage(p_user_id UUID, p_feature_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO feature_usage (user_id, feature_name, usage_count, last_used_at)
  VALUES (p_user_id, p_feature_name, 1, NOW())
  ON CONFLICT (user_id, feature_name)
  DO UPDATE SET
    usage_count = feature_usage.usage_count + 1,
    last_used_at = NOW();
END;
$$;

-- Function to increment daily usage metrics
CREATE OR REPLACE FUNCTION increment_usage_metric(
  p_user_id UUID,
  p_metric_type TEXT,
  p_increment INT DEFAULT 1
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO usage_metrics (
    user_id,
    metric_date,
    content_generated_count,
    content_published_count,
    ai_requests_count,
    api_calls_count
  )
  VALUES (
    p_user_id,
    CURRENT_DATE,
    CASE WHEN p_metric_type = 'content_generated' THEN p_increment ELSE 0 END,
    CASE WHEN p_metric_type = 'content_published' THEN p_increment ELSE 0 END,
    CASE WHEN p_metric_type = 'ai_request' THEN p_increment ELSE 0 END,
    CASE WHEN p_metric_type = 'api_call' THEN p_increment ELSE 0 END
  )
  ON CONFLICT (user_id, metric_date)
  DO UPDATE SET
    content_generated_count = CASE
      WHEN p_metric_type = 'content_generated'
      THEN usage_metrics.content_generated_count + p_increment
      ELSE usage_metrics.content_generated_count
    END,
    content_published_count = CASE
      WHEN p_metric_type = 'content_published'
      THEN usage_metrics.content_published_count + p_increment
      ELSE usage_metrics.content_published_count
    END,
    ai_requests_count = CASE
      WHEN p_metric_type = 'ai_request'
      THEN usage_metrics.ai_requests_count + p_increment
      ELSE usage_metrics.ai_requests_count
    END,
    api_calls_count = CASE
      WHEN p_metric_type = 'api_call'
      THEN usage_metrics.api_calls_count + p_increment
      ELSE usage_metrics.api_calls_count
    END,
    updated_at = NOW();
END;
$$;

COMMENT ON TABLE public.analytics_events IS 'Tracks all user events and actions for analytics';
COMMENT ON TABLE public.campaign_analytics IS 'Stores performance metrics for published campaigns';
COMMENT ON TABLE public.platform_metrics IS 'Daily aggregated metrics per social platform';
COMMENT ON TABLE public.usage_metrics IS 'Daily usage quotas and limits tracking';
COMMENT ON TABLE public.feature_usage IS 'Tracks which features are being used most frequently';
