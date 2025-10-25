-- ContentFlow Scheduling System
-- Migration: 005_contentflow_scheduling.sql

-- Create scheduled_posts table for ContentFlow
CREATE TABLE scheduled_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    
    -- Post Details
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    platform VARCHAR(50) NOT NULL, -- 'twitter', 'linkedin', 'facebook', etc.
    post_type VARCHAR(50) DEFAULT 'text', -- 'text', 'image', 'video', 'carousel'
    
    -- Scheduling
    scheduled_at TIMESTAMPTZ NOT NULL,
    timezone VARCHAR(100) DEFAULT 'UTC',
    
    -- Status Management
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'published', 'failed', 'cancelled', 'draft'
    published_at TIMESTAMPTZ,
    failed_reason TEXT,
    
    -- Platform-specific data
    platform_post_id VARCHAR(255), -- ID from the platform after posting
    platform_url TEXT, -- URL to the published post
    
    -- Engagement tracking (populated after posting)
    likes_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_status CHECK (status IN ('scheduled', 'published', 'failed', 'cancelled', 'draft')),
    CONSTRAINT valid_platform CHECK (platform IN ('twitter', 'linkedin', 'facebook', 'instagram', 'tiktok', 'reddit', 'youtube')),
    CONSTRAINT future_schedule CHECK (scheduled_at > created_at OR status != 'scheduled')
);

-- Create content_templates table for reusable templates
CREATE TABLE content_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Template Details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_content TEXT NOT NULL,
    platforms TEXT[] DEFAULT '{}', -- Array of supported platforms
    
    -- Template Type
    category VARCHAR(100), -- 'announcement', 'promotion', 'engagement', 'news'
    tags TEXT[] DEFAULT '{}',
    
    -- Usage Stats
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create posting_queue table for batch processing
CREATE TABLE posting_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    scheduled_post_id UUID NOT NULL REFERENCES scheduled_posts(id) ON DELETE CASCADE,
    
    -- Queue Management
    priority INTEGER DEFAULT 0, -- Higher numbers = higher priority
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    
    -- Processing
    processing_started_at TIMESTAMPTZ,
    processing_completed_at TIMESTAMPTZ,
    error_message TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_scheduled_posts_user_id ON scheduled_posts(user_id);
CREATE INDEX idx_scheduled_posts_scheduled_at ON scheduled_posts(scheduled_at);
CREATE INDEX idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX idx_scheduled_posts_platform ON scheduled_posts(platform);
CREATE INDEX idx_scheduled_posts_campaign_id ON scheduled_posts(campaign_id);

CREATE INDEX idx_content_templates_user_id ON content_templates(user_id);
CREATE INDEX idx_content_templates_category ON content_templates(category);

CREATE INDEX idx_posting_queue_scheduled_post_id ON posting_queue(scheduled_post_id);
CREATE INDEX idx_posting_queue_priority ON posting_queue(priority DESC);

-- Create updated_at trigger for scheduled_posts
CREATE OR REPLACE FUNCTION update_scheduled_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_scheduled_posts_updated_at
    BEFORE UPDATE ON scheduled_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_scheduled_posts_updated_at();

-- Create updated_at trigger for content_templates
CREATE OR REPLACE FUNCTION update_content_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_content_templates_updated_at
    BEFORE UPDATE ON content_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_content_templates_updated_at();

-- Row Level Security (RLS)
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE posting_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scheduled_posts
CREATE POLICY "Users can view their own scheduled posts" ON scheduled_posts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scheduled posts" ON scheduled_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled posts" ON scheduled_posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled posts" ON scheduled_posts
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for content_templates
CREATE POLICY "Users can view their own templates" ON content_templates
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own templates" ON content_templates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" ON content_templates
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" ON content_templates
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for posting_queue (system managed, but users can view)
CREATE POLICY "Users can view queue for their posts" ON posting_queue
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM scheduled_posts 
            WHERE scheduled_posts.id = posting_queue.scheduled_post_id 
            AND scheduled_posts.user_id = auth.uid()
        )
    );

-- Insert some sample content templates for new users
INSERT INTO content_templates (user_id, name, description, template_content, platforms, category, tags) VALUES
    (
        'default', -- Will be replaced with actual user_id in the app
        'Product Announcement',
        'Template for announcing new products or features',
        '🚀 Exciting news! We just launched [PRODUCT_NAME]!\n\n✨ Key benefits:\n• [BENEFIT_1]\n• [BENEFIT_2] \n• [BENEFIT_3]\n\nTry it now: [LINK]\n\n#ProductLaunch #Innovation',
        ARRAY['twitter', 'linkedin', 'facebook'],
        'announcement',
        ARRAY['product', 'launch', 'announcement']
    ),
    (
        'default',
        'Engagement Question',
        'Template for asking engaging questions to boost interaction',
        '💭 Quick question for my network:\n\n[QUESTION]\n\nDrop your thoughts in the comments! 👇\n\n#Community #Engagement',
        ARRAY['twitter', 'linkedin'],
        'engagement',
        ARRAY['question', 'engagement', 'community']
    ),
    (
        'default',
        'Behind the Scenes',
        'Template for sharing behind-the-scenes content',
        '🎬 Behind the scenes at [COMPANY_NAME]...\n\n[STORY_OR_INSIGHT]\n\nWhat would you like to see more of? Let me know! 👇\n\n#BehindTheScenes #Transparency',
        ARRAY['twitter', 'linkedin', 'instagram'],
        'engagement',
        ARRAY['behind-the-scenes', 'company-culture', 'transparency']
    );

-- Comments
COMMENT ON TABLE scheduled_posts IS 'Stores posts scheduled for future publishing across social media platforms';
COMMENT ON TABLE content_templates IS 'Reusable content templates for faster post creation';
COMMENT ON TABLE posting_queue IS 'Queue system for processing scheduled posts';

COMMENT ON COLUMN scheduled_posts.platform_post_id IS 'Platform-specific ID returned after successful posting';
COMMENT ON COLUMN scheduled_posts.scheduled_at IS 'When the post should be published (in users timezone)';
COMMENT ON COLUMN scheduled_posts.status IS 'Current status: scheduled, published, failed, cancelled, draft';