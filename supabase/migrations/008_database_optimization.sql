-- Database Query Optimization & Monitoring
-- Migration 008: Performance improvements and monitoring tools

-- ============================================
-- PART 1: ADDITIONAL INDEXES FOR PERFORMANCE
-- ============================================

-- Profiles table optimizations
-- Frequently queried by subscription tier for access control
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier
  ON public.profiles(subscription_tier);

-- Stripe customer lookups during payment processing
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer
  ON public.profiles(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Subscription status queries for active subscriber counts
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status
  ON public.profiles(subscription_status)
  WHERE subscription_status IS NOT NULL;

-- Social accounts optimizations
-- Dashboard queries filter by user + active status
CREATE INDEX IF NOT EXISTS idx_social_accounts_user_active
  ON public.social_accounts(user_id, is_active);

-- Platform-specific active account queries
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform_active
  ON public.social_accounts(platform, is_active);

-- Campaigns optimizations
-- Dashboard queries: get user's campaigns ordered by date
CREATE INDEX IF NOT EXISTS idx_campaigns_user_created
  ON public.campaigns(user_id, created_at DESC);

-- Dashboard queries: get user's campaigns by status
CREATE INDEX IF NOT EXISTS idx_campaigns_user_status
  ON public.campaigns(user_id, status, created_at DESC);

-- Scheduled campaigns ready to publish
CREATE INDEX IF NOT EXISTS idx_campaigns_scheduled_ready
  ON public.campaigns(scheduled_at)
  WHERE status = 'scheduled' AND scheduled_at IS NOT NULL;

-- Campaign content optimizations
-- Filter published content for analytics
CREATE INDEX IF NOT EXISTS idx_campaign_content_published
  ON public.campaign_content(is_published, published_at DESC)
  WHERE is_published = true;

-- Get content by campaign and platform
CREATE INDEX IF NOT EXISTS idx_campaign_content_campaign_platform
  ON public.campaign_content(campaign_id, platform);

-- Social publishing queue optimizations
-- Dashboard: get user's queued posts by status
CREATE INDEX IF NOT EXISTS idx_social_queue_user_status
  ON public.social_publishing_queue(user_id, status, scheduled_for DESC);

-- Processing: get ready-to-publish posts
CREATE INDEX IF NOT EXISTS idx_social_queue_ready
  ON public.social_publishing_queue(scheduled_for ASC)
  WHERE status IN ('scheduled', 'publishing');

-- Failed posts that need retry
CREATE INDEX IF NOT EXISTS idx_social_queue_failed
  ON public.social_publishing_queue(status, retry_count)
  WHERE status = 'failed';

-- AI usage tracking optimizations
-- Cost tracking by user and date range
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_created
  ON public.ai_usage(user_id, created_at DESC);

-- Provider-specific usage analytics
CREATE INDEX IF NOT EXISTS idx_ai_usage_provider_created
  ON public.ai_usage(provider, created_at DESC);

-- Media assets optimizations
-- Filter by asset type for media library
CREATE INDEX IF NOT EXISTS idx_media_assets_user_type
  ON public.media_assets(user_id, asset_type, created_at DESC);

-- API keys optimizations
-- Active keys lookup
CREATE INDEX IF NOT EXISTS idx_api_keys_user_active
  ON public.api_keys(user_id, is_active)
  WHERE is_active = true;

-- Onboarding progress optimization
-- Incomplete onboarding queries
CREATE INDEX IF NOT EXISTS idx_onboarding_completed
  ON public.onboarding_progress(completed, user_id)
  WHERE completed = false;

-- ============================================
-- PART 2: QUERY MONITORING VIEWS
-- ============================================

-- View: Slow query candidates (queries that might benefit from optimization)
CREATE OR REPLACE VIEW query_performance_summary AS
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- View: Table size and bloat information
CREATE OR REPLACE VIEW table_size_summary AS
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
  pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as indexes_size,
  n_live_tup as live_rows,
  n_dead_tup as dead_rows,
  ROUND(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) as dead_row_percent
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- View: Index usage statistics
CREATE OR REPLACE VIEW index_usage_summary AS
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as times_used,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
  CASE
    WHEN idx_scan = 0 THEN 'UNUSED - Consider removing'
    WHEN idx_scan < 100 THEN 'Low usage'
    ELSE 'Active'
  END as usage_status
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;

-- ============================================
-- PART 3: MONITORING FUNCTIONS
-- ============================================

-- Function: Get database health metrics
CREATE OR REPLACE FUNCTION get_database_health()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_database_size', pg_size_pretty(pg_database_size(current_database())),
    'total_tables', (SELECT COUNT(*) FROM pg_stat_user_tables WHERE schemaname = 'public'),
    'total_indexes', (SELECT COUNT(*) FROM pg_stat_user_indexes WHERE schemaname = 'public'),
    'active_connections', (SELECT COUNT(*) FROM pg_stat_activity WHERE datname = current_database()),
    'cache_hit_ratio', ROUND(
      100.0 * sum(blks_hit) / NULLIF(sum(blks_hit) + sum(blks_read), 0), 2
    ),
    'total_queries', sum(seq_scan + idx_scan),
    'sequential_scans', sum(seq_scan),
    'index_scans', sum(idx_scan),
    'last_vacuum', MAX(last_vacuum),
    'last_analyze', MAX(last_analyze)
  ) INTO result
  FROM pg_stat_user_tables
  WHERE schemaname = 'public';

  RETURN result;
END;
$$;

-- Function: Get slow query candidates
CREATE OR REPLACE FUNCTION get_slow_query_candidates(min_calls INT DEFAULT 100)
RETURNS TABLE (
  query_text TEXT,
  total_calls BIGINT,
  avg_exec_time_ms NUMERIC,
  total_time_minutes NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    LEFT(query, 100) as query_text,
    calls as total_calls,
    ROUND(mean_exec_time::NUMERIC, 2) as avg_exec_time_ms,
    ROUND((total_exec_time / 1000 / 60)::NUMERIC, 2) as total_time_minutes
  FROM pg_stat_statements
  WHERE calls >= min_calls
  ORDER BY mean_exec_time DESC
  LIMIT 20;
END;
$$;

-- Function: Get table statistics
CREATE OR REPLACE FUNCTION get_table_stats(table_name_param TEXT DEFAULT NULL)
RETURNS TABLE (
  table_name TEXT,
  total_size TEXT,
  row_count BIGINT,
  last_vacuum TIMESTAMP WITH TIME ZONE,
  last_analyze TIMESTAMP WITH TIME ZONE,
  dead_rows BIGINT,
  needs_vacuum BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    schemaname || '.' || tablename as table_name,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    n_live_tup as row_count,
    pg_stat_user_tables.last_vacuum,
    pg_stat_user_tables.last_analyze,
    n_dead_tup as dead_rows,
    (n_dead_tup > 1000 AND n_dead_tup::FLOAT / NULLIF(n_live_tup, 0) > 0.1) as needs_vacuum
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
    AND (table_name_param IS NULL OR tablename = table_name_param)
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$;

-- Function: Get index recommendations
CREATE OR REPLACE FUNCTION get_index_recommendations()
RETURNS TABLE (
  table_name TEXT,
  seq_scans BIGINT,
  index_scans BIGINT,
  recommendation TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    tablename::TEXT,
    seq_scan,
    idx_scan,
    CASE
      WHEN seq_scan > 1000 AND idx_scan < seq_scan THEN
        'High sequential scans - consider adding indexes on frequently filtered columns'
      WHEN seq_scan > 100 AND n_live_tup > 10000 THEN
        'Large table with sequential scans - review query patterns'
      ELSE
        'OK'
    END as recommendation
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
    AND (seq_scan > 100 OR (seq_scan > idx_scan AND seq_scan > 10))
  ORDER BY seq_scan DESC;
END;
$$;

-- ============================================
-- PART 4: QUERY OPTIMIZATIONS
-- ============================================

-- Optimize the campaign_content RLS policy to avoid N+1 queries
DROP POLICY IF EXISTS "Users can manage own campaign content" ON public.campaign_content;
CREATE POLICY "Users can manage own campaign content" ON public.campaign_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = campaign_content.campaign_id
        AND campaigns.user_id = auth.uid()
    )
  );

-- Add materialized view for dashboard stats (optional - can be refreshed periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS user_dashboard_stats AS
SELECT
  u.id as user_id,
  u.email,
  u.subscription_tier,
  COUNT(DISTINCT sa.id) as connected_accounts,
  COUNT(DISTINCT c.id) as total_campaigns,
  COUNT(DISTINCT cc.id) FILTER (WHERE cc.is_published = true) as published_posts,
  COALESCE(SUM(cc.views), 0) as total_views,
  COALESCE(SUM(cc.likes), 0) as total_likes,
  NOW() as last_refreshed
FROM public.profiles u
LEFT JOIN public.social_accounts sa ON sa.user_id = u.id AND sa.is_active = true
LEFT JOIN public.campaigns c ON c.user_id = u.id
LEFT JOIN public.campaign_content cc ON cc.campaign_id = c.id
GROUP BY u.id, u.email, u.subscription_tier;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_dashboard_stats_user_id
  ON user_dashboard_stats(user_id);

-- Function to refresh dashboard stats (call periodically)
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_dashboard_stats;
END;
$$;

-- ============================================
-- PART 5: VACUUM AND MAINTENANCE
-- ============================================

-- Function to auto-vacuum recommendations
CREATE OR REPLACE FUNCTION get_vacuum_recommendations()
RETURNS TABLE (
  table_name TEXT,
  dead_tuples BIGINT,
  live_tuples BIGINT,
  dead_ratio NUMERIC,
  last_vacuum TIMESTAMP WITH TIME ZONE,
  recommendation TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    schemaname || '.' || tablename as table_name,
    n_dead_tup as dead_tuples,
    n_live_tup as live_tuples,
    ROUND(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) as dead_ratio,
    pg_stat_user_tables.last_vacuum,
    CASE
      WHEN n_dead_tup > 10000 AND n_dead_tup::FLOAT / NULLIF(n_live_tup, 0) > 0.2 THEN
        'URGENT: Run VACUUM ANALYZE immediately'
      WHEN n_dead_tup > 5000 AND n_dead_tup::FLOAT / NULLIF(n_live_tup, 0) > 0.1 THEN
        'Run VACUUM ANALYZE soon'
      WHEN pg_stat_user_tables.last_vacuum IS NULL OR pg_stat_user_tables.last_vacuum < NOW() - INTERVAL '7 days' THEN
        'Consider scheduling regular VACUUM'
      ELSE
        'OK'
    END as recommendation
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
  ORDER BY n_dead_tup DESC;
END;
$$;

-- ============================================
-- COMMENTS & DOCUMENTATION
-- ============================================

COMMENT ON FUNCTION get_database_health() IS 'Returns overall database health metrics including size, connections, and cache hit ratio';
COMMENT ON FUNCTION get_slow_query_candidates(INT) IS 'Identifies queries that are called frequently and have high execution time';
COMMENT ON FUNCTION get_table_stats(TEXT) IS 'Returns detailed statistics for tables including size, row counts, and vacuum status';
COMMENT ON FUNCTION get_index_recommendations() IS 'Suggests tables that might benefit from additional indexes based on sequential scan patterns';
COMMENT ON FUNCTION get_vacuum_recommendations() IS 'Identifies tables that need vacuuming based on dead tuple ratios';
COMMENT ON FUNCTION refresh_dashboard_stats() IS 'Refreshes the materialized view for dashboard statistics (call periodically via cron)';

COMMENT ON VIEW query_performance_summary IS 'Summary of index usage across all tables';
COMMENT ON VIEW table_size_summary IS 'Table and index size information with bloat indicators';
COMMENT ON VIEW index_usage_summary IS 'Index usage statistics to identify unused indexes';
COMMENT ON MATERIALIZED VIEW user_dashboard_stats IS 'Cached dashboard statistics per user (refresh periodically)';

-- Success message
SELECT 'Database optimization migration completed successfully!' as result,
       'Run: SELECT * FROM get_database_health() to check database health' as next_step;
