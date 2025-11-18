-- ============================================================================
-- Social Connections System
-- ============================================================================
-- Enables OAuth and custom app connections to social media platforms
-- Parallel architecture to ai_providers/user_ai_tools
-- ============================================================================

-- ============================================================================
-- 1. Social Providers Table (Master list of platforms)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.social_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Provider identification
  provider_key TEXT UNIQUE NOT NULL, -- 'instagram', 'tiktok', 'youtube', 'facebook', 'linkedin', 'twitter'
  name TEXT NOT NULL, -- 'Instagram', 'TikTok', 'YouTube', etc.
  description TEXT,
  logo_url TEXT,

  -- Authentication configuration
  auth_type TEXT NOT NULL CHECK (auth_type IN ('oauth', 'custom_app', 'hybrid')),
  oauth_config JSONB, -- { authUrl, tokenUrl, scopes[], redirectUri }

  -- Documentation
  docs_url TEXT,
  setup_instructions TEXT[],

  -- Access control
  required_tier TEXT DEFAULT 'free' CHECK (required_tier IN ('free', 'pro', 'premium')),
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. User Social Connections Table (User's connected accounts)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_social_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.social_providers(id) ON DELETE CASCADE,

  -- Connection identification
  connection_name TEXT NOT NULL, -- "My Instagram", "James' TikTok"
  account_username TEXT, -- Platform username for display (e.g., @jameslawson)
  account_id TEXT, -- Platform user ID

  -- OAuth tokens (encrypted with AES-256-GCM)
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[], -- Granted OAuth scopes

  -- Custom app credentials (for Instagram/Facebook custom apps)
  client_id_encrypted TEXT,
  client_secret_encrypted TEXT,

  -- Additional platform-specific data
  metadata JSONB DEFAULT '{}', -- { page_id, business_account_id, etc. }

  -- Connection status
  is_active BOOLEAN DEFAULT true,
  test_status TEXT DEFAULT 'pending' CHECK (test_status IN ('pending', 'success', 'failed')),
  last_tested_at TIMESTAMPTZ,
  test_error TEXT, -- Store error message if test fails

  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, provider_id, connection_name)
);

-- ============================================================================
-- 3. Scheduled Posts Table (Future publishing queue)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.scheduled_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES public.user_social_connections(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,

  -- Post content
  platform TEXT NOT NULL, -- 'instagram', 'tiktok', etc.
  post_type TEXT NOT NULL, -- 'photo', 'video', 'reel', 'story', 'carousel'
  content JSONB NOT NULL, -- { caption, media_urls[], hashtags[], location, etc. }

  -- Scheduling
  scheduled_at TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'America/New_York',

  -- Publishing status
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'publishing', 'published', 'failed', 'cancelled')),
  published_at TIMESTAMPTZ,
  platform_post_id TEXT, -- ID returned by platform after publishing
  platform_url TEXT, -- Direct link to published post

  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. Publishing Activity Log (Audit trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.publishing_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES public.user_social_connections(id) ON DELETE SET NULL,
  scheduled_post_id UUID REFERENCES public.scheduled_posts(id) ON DELETE SET NULL,

  -- Activity details
  action TEXT NOT NULL, -- 'publish', 'schedule', 'cancel', 'retry', 'token_refresh'
  platform TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),

  -- Metadata
  details JSONB DEFAULT '{}', -- Store error details, API response, etc.

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. Indexes for Performance
-- ============================================================================

-- Social Providers
CREATE INDEX IF NOT EXISTS idx_social_providers_key ON public.social_providers(provider_key);
CREATE INDEX IF NOT EXISTS idx_social_providers_active ON public.social_providers(is_active);

-- User Social Connections
CREATE INDEX IF NOT EXISTS idx_social_connections_user ON public.user_social_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_social_connections_provider ON public.user_social_connections(provider_id);
CREATE INDEX IF NOT EXISTS idx_social_connections_active ON public.user_social_connections(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_social_connections_test_status ON public.user_social_connections(test_status);

-- Scheduled Posts
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user ON public.scheduled_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_connection ON public.scheduled_posts(connection_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_at ON public.scheduled_posts(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON public.scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_campaign ON public.scheduled_posts(campaign_id);

-- Publishing Activity
CREATE INDEX IF NOT EXISTS idx_publishing_activity_user ON public.publishing_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_publishing_activity_connection ON public.publishing_activity(connection_id);
CREATE INDEX IF NOT EXISTS idx_publishing_activity_created ON public.publishing_activity(created_at);

-- ============================================================================
-- 6. Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE public.social_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publishing_activity ENABLE ROW LEVEL SECURITY;

-- Social Providers: Public read access
CREATE POLICY "Anyone can view active social providers"
  ON public.social_providers
  FOR SELECT
  USING (is_active = true);

-- User Social Connections: User-specific access
CREATE POLICY "Users can view own connections"
  ON public.user_social_connections
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connections"
  ON public.user_social_connections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connections"
  ON public.user_social_connections
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own connections"
  ON public.user_social_connections
  FOR DELETE
  USING (auth.uid() = user_id);

-- Scheduled Posts: User-specific access
CREATE POLICY "Users can view own scheduled posts"
  ON public.scheduled_posts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scheduled posts"
  ON public.scheduled_posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduled posts"
  ON public.scheduled_posts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scheduled posts"
  ON public.scheduled_posts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Publishing Activity: User-specific read access
CREATE POLICY "Users can view own publishing activity"
  ON public.publishing_activity
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert publishing activity"
  ON public.publishing_activity
  FOR INSERT
  WITH CHECK (true); -- Backend service can log all activity

-- ============================================================================
-- 7. Triggers for Updated Timestamps
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
CREATE TRIGGER set_social_providers_updated_at
  BEFORE UPDATE ON public.social_providers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_social_connections_updated_at
  BEFORE UPDATE ON public.user_social_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_scheduled_posts_updated_at
  BEFORE UPDATE ON public.scheduled_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 8. Seed Data: Initial Social Providers
-- ============================================================================

INSERT INTO public.social_providers (provider_key, name, description, auth_type, required_tier, docs_url, logo_url) VALUES
  (
    'instagram',
    'Instagram',
    'Share photos, videos, and reels to your Instagram account',
    'custom_app',
    'free',
    'https://developers.facebook.com/docs/instagram-api',
    '/images/platforms/instagram.svg'
  ),
  (
    'tiktok',
    'TikTok',
    'Post videos to your TikTok account',
    'oauth',
    'free',
    'https://developers.tiktok.com/doc/content-posting-api-get-started',
    '/images/platforms/tiktok.svg'
  ),
  (
    'youtube',
    'YouTube',
    'Upload videos to your YouTube channel',
    'oauth',
    'free',
    'https://developers.google.com/youtube/v3',
    '/images/platforms/youtube.svg'
  ),
  (
    'facebook',
    'Facebook',
    'Post to your Facebook page or profile',
    'oauth',
    'free',
    'https://developers.facebook.com/docs/graph-api',
    '/images/platforms/facebook.svg'
  ),
  (
    'linkedin',
    'LinkedIn',
    'Share posts to your LinkedIn profile or company page',
    'oauth',
    'pro',
    'https://learn.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/share-api',
    '/images/platforms/linkedin.svg'
  ),
  (
    'twitter',
    'X (Twitter)',
    'Post tweets to your X account',
    'oauth',
    'pro',
    'https://developer.x.com/en/docs/twitter-api',
    '/images/platforms/twitter.svg'
  )
ON CONFLICT (provider_key) DO NOTHING;

-- ============================================================================
-- 9. Helper Functions
-- ============================================================================

-- Function to get user's active connections
CREATE OR REPLACE FUNCTION public.get_user_active_connections(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  provider_key TEXT,
  provider_name TEXT,
  connection_name TEXT,
  account_username TEXT,
  is_active BOOLEAN,
  test_status TEXT,
  usage_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    usc.id,
    sp.provider_key,
    sp.name AS provider_name,
    usc.connection_name,
    usc.account_username,
    usc.is_active,
    usc.test_status,
    usc.usage_count
  FROM public.user_social_connections usc
  JOIN public.social_providers sp ON usc.provider_id = sp.id
  WHERE usc.user_id = p_user_id
    AND usc.is_active = true
  ORDER BY usc.created_at DESC;
END;
$$;

-- Function to increment connection usage
CREATE OR REPLACE FUNCTION public.increment_connection_usage(p_connection_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_social_connections
  SET
    usage_count = usage_count + 1,
    last_used_at = NOW()
  WHERE id = p_connection_id;
END;
$$;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
