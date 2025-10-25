-- Social Account Connections Migration
-- Execute this script in Supabase SQL Editor

-- Create Social Account Connections Table
CREATE TABLE social_accounts (
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
CREATE TABLE social_publishing_queue (
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

-- Enable Row Level Security
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_publishing_queue ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users own social accounts" ON social_accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own publishing queue" ON social_publishing_queue FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_social_accounts_user ON social_accounts(user_id);
CREATE INDEX idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX idx_social_accounts_active ON social_accounts(is_active);
CREATE INDEX idx_social_publishing_queue_user ON social_publishing_queue(user_id);
CREATE INDEX idx_social_publishing_queue_account ON social_publishing_queue(social_account_id);
CREATE INDEX idx_social_publishing_queue_status ON social_publishing_queue(status);
CREATE INDEX idx_social_publishing_queue_scheduled ON social_publishing_queue(scheduled_for);

-- Create trigger for updated_at
CREATE TRIGGER update_social_accounts_updated_at 
    BEFORE UPDATE ON social_accounts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_publishing_queue_updated_at 
    BEFORE UPDATE ON social_publishing_queue 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO social_accounts (user_id, platform, account_name, account_handle, is_active, is_verified) VALUES
(NULL, 'twitter', 'Demo Twitter Account', '@demo_twitter', false, false),
(NULL, 'linkedin', 'Demo LinkedIn Profile', 'demo-linkedin', false, false),
(NULL, 'facebook', 'Demo Facebook Page', 'demo.facebook', false, false),
(NULL, 'instagram', 'Demo Instagram Account', '@demo_instagram', false, false);

-- Success message
SELECT 'Social accounts migration completed successfully!' AS result;