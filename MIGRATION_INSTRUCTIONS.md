# Database Migration Instructions for Supabase

## What to do:
1. Copy the SQL script below
2. Paste it into Supabase SQL Editor 
3. Run it
4. Done!

## SQL Script to Execute:

```sql
-- CCAI Platform Migration - Complete Database Setup
-- Execute this entire script in Supabase SQL Editor

-- ============================================================================
-- AI STUDIO TABLES
-- ============================================================================

-- Create AI Generation Sessions Table
CREATE TABLE IF NOT EXISTS ai_generation_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    provider_config JSONB NOT NULL DEFAULT '{}',
    status TEXT CHECK (status IN ('active', 'completed', 'archived')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI Provider Configurations Table
CREATE TABLE IF NOT EXISTS ai_provider_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    provider_name TEXT NOT NULL,
    provider_type TEXT NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    is_enabled BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, provider_name)
);

-- Create Content Generation Requests Table
CREATE TABLE IF NOT EXISTS content_generation_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES ai_generation_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    prompt TEXT NOT NULL,
    content TEXT,
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
    error TEXT,
    tokens_used INTEGER DEFAULT 0,
    cost_estimate DECIMAL(10,6) DEFAULT 0,
    processing_time_ms INTEGER DEFAULT 0,
    max_tokens INTEGER DEFAULT 1000,
    temperature DECIMAL(3,2) DEFAULT 0.7,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create Content Variations Table
CREATE TABLE IF NOT EXISTS content_variations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id UUID REFERENCES content_generation_requests(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    variation_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    quality_score DECIMAL(3,2) DEFAULT 0,
    performance_metrics JSONB DEFAULT '{}',
    is_selected BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI Prompt Templates Table
CREATE TABLE IF NOT EXISTS ai_prompt_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    template TEXT NOT NULL,
    variables TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    average_quality DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Content Generation Analytics Table
CREATE TABLE IF NOT EXISTS content_generation_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id UUID REFERENCES content_generation_requests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    tokens_used INTEGER NOT NULL,
    cost DECIMAL(10,6) NOT NULL,
    processing_time_ms INTEGER NOT NULL,
    quality_score DECIMAL(3,2) DEFAULT 0,
    success BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SOCIAL ACCOUNTS TABLES
-- ============================================================================

-- Create Social Account Connections Table
CREATE TABLE IF NOT EXISTS social_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'facebook', 'instagram', 'tiktok', 'youtube')),
    account_name TEXT NOT NULL,
    account_handle TEXT,
    account_id TEXT,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    account_metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, platform, account_id)
);

-- Create Social Publishing Queue Table
CREATE TABLE IF NOT EXISTS social_publishing_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    campaign_id UUID,
    social_account_id UUID REFERENCES social_accounts(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    media_urls TEXT[] DEFAULT '{}',
    scheduled_for TIMESTAMP WITH TIME ZONE,
    status TEXT CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'failed')) DEFAULT 'draft',
    published_at TIMESTAMP WITH TIME ZONE,
    platform_post_id TEXT,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

-- AI Studio Tables
ALTER TABLE ai_generation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_provider_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_generation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_generation_analytics ENABLE ROW LEVEL SECURITY;

-- Social Accounts Tables
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_publishing_queue ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE RLS POLICIES
-- ============================================================================

-- AI Studio Policies
CREATE POLICY "Users own data only" ON ai_generation_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data only" ON ai_provider_configs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data only" ON content_generation_requests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data only" ON content_variations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data only" ON content_generation_analytics FOR ALL USING (auth.uid() = user_id);

-- Special policy for templates (own + public)
CREATE POLICY "Users own templates and public" ON ai_prompt_templates 
FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users manage own templates" ON ai_prompt_templates 
FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own templates" ON ai_prompt_templates 
FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own templates" ON ai_prompt_templates 
FOR DELETE USING (auth.uid() = user_id);

-- Social Accounts Policies
CREATE POLICY "Users own social accounts" ON social_accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own publishing queue" ON social_publishing_queue FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- AI Studio Indexes
CREATE INDEX IF NOT EXISTS idx_ai_generation_sessions_user ON ai_generation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_provider_configs_user ON ai_provider_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_content_generation_requests_user ON content_generation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_content_variations_user ON content_variations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_prompt_templates_user ON ai_prompt_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_content_generation_analytics_user ON content_generation_analytics(user_id);

-- Social Accounts Indexes
CREATE INDEX IF NOT EXISTS idx_social_accounts_user ON social_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_social_accounts_active ON social_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_social_publishing_queue_user ON social_publishing_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_social_publishing_queue_account ON social_publishing_queue(social_account_id);
CREATE INDEX IF NOT EXISTS idx_social_publishing_queue_status ON social_publishing_queue(status);
CREATE INDEX IF NOT EXISTS idx_social_publishing_queue_scheduled ON social_publishing_queue(scheduled_for);

-- ============================================================================
-- INSERT STARTER DATA
-- ============================================================================

-- Add some starter templates
INSERT INTO ai_prompt_templates (user_id, name, category, template, variables, is_public, usage_count, average_quality) VALUES
(NULL, 'Blog Post Writer', 'Content', 'Write a blog post about {topic} for {audience}', ARRAY['topic', 'audience'], true, 0, 4.0),
(NULL, 'Social Media Post', 'Social', 'Create a {platform} post about {topic}', ARRAY['platform', 'topic'], true, 0, 4.0),
(NULL, 'Product Description', 'Commerce', 'Write a product description for {product}', ARRAY['product'], true, 0, 4.0),
(NULL, 'Email Newsletter', 'Email', 'Create an email about {topic}', ARRAY['topic'], true, 0, 4.0),
(NULL, 'SEO Article', 'SEO', 'Write SEO content for {keyword}', ARRAY['keyword'], true, 0, 4.0)
ON CONFLICT DO NOTHING;

-- Done!
SELECT 'CCAI Platform migration completed successfully! 🎉' AS result;
```

## What This Sets Up:

### AI Studio:
- Multi-provider content generation
- Template management
- Analytics and performance tracking
- Session management

### Social Accounts:
- Social media account connections
- Publishing queue and scheduling
- Account management and verification

## That's it!
After running this script, both the AI Studio and Social Accounts features will be ready to use!