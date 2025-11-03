-- Database Performance Optimization Indexes
-- Run this in your Supabase SQL Editor

-- ============================================
-- CAMPAIGNS TABLE INDEXES
-- ============================================

-- Index for user's campaigns lookup (most common query)
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id_created 
ON campaigns(user_id, created_at DESC);

-- Index for campaign status filtering
CREATE INDEX IF NOT EXISTS idx_campaigns_status 
ON campaigns(status) 
WHERE status IN ('draft', 'scheduled', 'published');

-- Index for campaign search by name
CREATE INDEX IF NOT EXISTS idx_campaigns_name_search 
ON campaigns USING gin(to_tsvector('english', name));

-- Index for campaign type filtering
CREATE INDEX IF NOT EXISTS idx_campaigns_type 
ON campaigns(campaign_type, created_at DESC);

-- ============================================
-- SCHEDULED_POSTS TABLE INDEXES
-- ============================================

-- Index for user's posts lookup
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_id 
ON scheduled_posts(user_id, created_at DESC);

-- Index for campaign's posts lookup
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_campaign_id 
ON scheduled_posts(campaign_id, scheduled_at);

-- Index for platform-specific posts
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_platform_status 
ON scheduled_posts(platform, status, scheduled_at);

-- Index for posts ready to publish
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_ready_to_publish 
ON scheduled_posts(scheduled_at, status) 
WHERE status = 'scheduled' AND scheduled_at <= NOW();

-- Index for post status filtering
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status 
ON scheduled_posts(status, created_at DESC);

-- ============================================
-- SOCIAL_ACCOUNTS TABLE INDEXES
-- ============================================

-- Index for user's connected accounts
CREATE INDEX IF NOT EXISTS idx_social_accounts_user_platform 
ON social_accounts(user_id, platform, is_active);

-- Index for active accounts only
CREATE INDEX IF NOT EXISTS idx_social_accounts_active 
ON social_accounts(is_active, platform) 
WHERE is_active = true;

-- Index for token expiration checks
CREATE INDEX IF NOT EXISTS idx_social_accounts_token_expiry 
ON social_accounts(token_expires_at) 
WHERE token_expires_at IS NOT NULL AND is_active = true;

-- ============================================
-- PROFILES TABLE INDEXES
-- ============================================

-- Index for profile lookup by user_id (should already exist as primary key)
-- But adding explicit index for joins
CREATE INDEX IF NOT EXISTS idx_profiles_user_id 
ON profiles(id);

-- Index for email search (if needed for admin)
CREATE INDEX IF NOT EXISTS idx_profiles_email 
ON profiles(email) 
WHERE email IS NOT NULL;

-- ============================================
-- AI_TOOLS TABLE INDEXES
-- ============================================

-- Index for user's AI tools
CREATE INDEX IF NOT EXISTS idx_ai_tools_user_provider 
ON ai_tools(user_id, provider_key);

-- Index for active tools only
CREATE INDEX IF NOT EXISTS idx_ai_tools_active 
ON ai_tools(is_active, user_id) 
WHERE is_active = true;

-- ============================================
-- ANALYTICS / METRICS (if you add these tables)
-- ============================================

-- For future analytics table
-- CREATE INDEX IF NOT EXISTS idx_analytics_user_date 
-- ON analytics(user_id, event_date DESC);

-- CREATE INDEX IF NOT EXISTS idx_analytics_event_type 
-- ON analytics(event_type, event_date DESC);

-- ============================================
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- ============================================

-- User's campaigns by status
CREATE INDEX IF NOT EXISTS idx_campaigns_user_status_created 
ON campaigns(user_id, status, created_at DESC);

-- Campaign posts ready for publishing
CREATE INDEX IF NOT EXISTS idx_posts_campaign_status_scheduled 
ON scheduled_posts(campaign_id, status, scheduled_at) 
WHERE status = 'scheduled';

-- ============================================
-- FULL-TEXT SEARCH INDEXES
-- ============================================

-- Full-text search on campaign names and content
CREATE INDEX IF NOT EXISTS idx_campaigns_fulltext 
ON campaigns USING gin(
  to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
);

-- Full-text search on post content
CREATE INDEX IF NOT EXISTS idx_posts_fulltext 
ON scheduled_posts USING gin(
  to_tsvector('english', coalesce(content, '') || ' ' || coalesce(title, ''))
);

-- ============================================
-- PERFORMANCE STATISTICS
-- ============================================

-- Analyze tables after creating indexes
ANALYZE campaigns;
ANALYZE scheduled_posts;
ANALYZE social_accounts;
ANALYZE profiles;
ANALYZE ai_tools;

-- ============================================
-- MAINTENANCE NOTES
-- ============================================

-- Monitor index usage with:
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch 
-- FROM pg_stat_user_indexes 
-- WHERE schemaname = 'public' 
-- ORDER BY idx_scan DESC;

-- Check index sizes:
-- SELECT schemaname, tablename, indexname, pg_size_pretty(pg_relation_size(indexrelid)) 
-- FROM pg_stat_user_indexes 
-- WHERE schemaname = 'public' 
-- ORDER BY pg_relation_size(indexrelid) DESC;

-- Remove unused indexes if needed:
-- DROP INDEX IF EXISTS index_name;
