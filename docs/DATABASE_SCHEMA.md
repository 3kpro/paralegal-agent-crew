# Content Cascade AI - Database Schema

## Supabase PostgreSQL Schema

### Core Tables

#### 1. `users` (Extended from Supabase Auth)
```sql
-- Extends auth.users with additional profile data
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free', -- 'free', 'pro', 'premium'
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  subscription_status TEXT, -- 'active', 'canceled', 'past_due'
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. `social_accounts` (Connected Social Media)
```sql
CREATE TABLE public.social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'twitter', 'linkedin', 'facebook', 'instagram', 'tiktok', 'reddit'
  platform_user_id TEXT NOT NULL,
  platform_username TEXT,
  access_token TEXT, -- Encrypted
  refresh_token TEXT, -- Encrypted
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB, -- Platform-specific data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform, platform_user_id)
);

CREATE INDEX idx_social_accounts_user_id ON public.social_accounts(user_id);
CREATE INDEX idx_social_accounts_platform ON public.social_accounts(platform);
```

#### 3. `campaigns` (Content Campaigns)
```sql
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'published', 'completed', 'failed'
  campaign_type TEXT, -- 'full', 'single', 'trending', 'uploaded'

  -- Source configuration
  source_type TEXT, -- 'trending', 'upload', 'manual', 'url'
  source_data JSONB, -- Topic, uploaded file URLs, manual text

  -- Target platforms
  target_platforms TEXT[], -- ['twitter', 'linkedin', 'email']

  -- AI configuration
  ai_provider TEXT DEFAULT 'local', -- 'local', 'claude', 'gemini', 'grok'
  ai_model TEXT, -- Specific model used
  tone TEXT, -- 'professional', 'casual', 'edgy', 'humorous'
  brand_voice_id UUID REFERENCES public.brand_voices(id),

  -- Scheduling
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,

  -- Analytics
  total_views INT DEFAULT 0,
  total_engagement INT DEFAULT 0,
  total_clicks INT DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_campaigns_scheduled_at ON public.campaigns(scheduled_at);
```

#### 4. `campaign_content` (Generated Content for Each Platform)
```sql
CREATE TABLE public.campaign_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'twitter', 'linkedin', 'email', 'facebook', etc.
  content_type TEXT, -- 'text', 'image', 'video', 'carousel'

  -- Content data
  title TEXT,
  body TEXT NOT NULL,
  hashtags TEXT[],
  mentions TEXT[],
  media_urls TEXT[], -- Generated images, videos
  link_url TEXT,

  -- AI metadata
  generated_by TEXT, -- 'local-mistral', 'claude-opus', 'gemini-flash'
  prompt_used TEXT,
  generation_time_ms INT,

  -- Publishing
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  platform_post_id TEXT, -- ID from social platform
  platform_url TEXT, -- Direct link to post

  -- Analytics
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  shares INT DEFAULT 0,
  comments INT DEFAULT 0,
  clicks INT DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_campaign_content_campaign_id ON public.campaign_content(campaign_id);
CREATE INDEX idx_campaign_content_platform ON public.campaign_content(platform);
```

#### 5. `brand_voices` (User's Brand Voice Guidelines)
```sql
CREATE TABLE public.brand_voices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- "Professional Tech", "Casual Friendly"
  description TEXT,

  -- Voice characteristics
  tone TEXT, -- 'professional', 'casual', 'humorous', 'authoritative'
  formality_level INT, -- 1-5 scale
  emoji_usage TEXT, -- 'none', 'minimal', 'moderate', 'heavy'
  hashtag_style TEXT, -- 'none', 'minimal', 'trending', 'branded'

  -- Content guidelines
  forbidden_words TEXT[],
  preferred_phrases TEXT[],
  writing_style_notes TEXT,

  -- Examples
  example_posts TEXT[], -- Sample posts in this voice

  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_brand_voices_user_id ON public.brand_voices(user_id);
```

#### 6. `media_assets` (Generated Images, Videos, Audio)
```sql
CREATE TABLE public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,

  asset_type TEXT NOT NULL, -- 'image', 'video', 'audio', 'gif'
  file_url TEXT NOT NULL, -- Supabase Storage URL
  file_size_bytes INT,
  duration_seconds INT, -- For video/audio

  -- Generation details
  generated_by TEXT, -- 'google-imagen', 'sora', 'runway', 'elevenlabs'
  prompt_used TEXT,
  generation_params JSONB, -- Model-specific parameters
  cost_cents INT, -- Track API costs

  -- Metadata
  width INT,
  height INT,
  format TEXT, -- 'png', 'jpg', 'mp4', 'mp3'

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_media_assets_user_id ON public.media_assets(user_id);
CREATE INDEX idx_media_assets_campaign_id ON public.media_assets(campaign_id);
```

#### 7. `ai_usage` (Track AI API Usage for Billing)
```sql
CREATE TABLE public.ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,

  provider TEXT NOT NULL, -- 'local', 'claude', 'gemini', 'grok', 'google-imagen', etc.
  model TEXT, -- Specific model used
  operation TEXT, -- 'content_generation', 'image_generation', 'video_generation'

  -- Usage metrics
  tokens_used INT,
  requests_count INT DEFAULT 1,
  cost_cents INT DEFAULT 0,

  -- Performance
  response_time_ms INT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_usage_user_id ON public.ai_usage(user_id);
CREATE INDEX idx_ai_usage_created_at ON public.ai_usage(created_at);
```

#### 8. `api_keys` (User's Own API Keys)
```sql
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

  provider TEXT NOT NULL, -- 'claude', 'openai', 'google', 'elevenlabs', etc.
  key_name TEXT, -- User-friendly name: "My Claude Key"
  api_key_encrypted TEXT NOT NULL, -- Encrypted API key

  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, provider, key_name)
);

CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);
```

#### 9. `onboarding_progress` (Track User Onboarding)
```sql
CREATE TABLE public.onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,

  -- Step completion
  profile_completed BOOLEAN DEFAULT false,
  social_connected BOOLEAN DEFAULT false,
  brand_voice_created BOOLEAN DEFAULT false,
  first_campaign_created BOOLEAN DEFAULT false,
  first_content_published BOOLEAN DEFAULT false,

  -- Current step
  current_step INT DEFAULT 1, -- 1-5
  completed BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 10. `analytics_snapshots` (Daily Analytics Cache)
```sql
CREATE TABLE public.analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,

  snapshot_date DATE NOT NULL,

  -- Aggregated metrics
  total_posts INT DEFAULT 0,
  total_views INT DEFAULT 0,
  total_likes INT DEFAULT 0,
  total_shares INT DEFAULT 0,
  total_comments INT DEFAULT 0,
  total_clicks INT DEFAULT 0,

  -- Platform breakdown
  platform_metrics JSONB, -- {twitter: {views: 100, likes: 50}, linkedin: {...}}

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, campaign_id, snapshot_date)
);

CREATE INDEX idx_analytics_user_date ON public.analytics_snapshots(user_id, snapshot_date);
```

---

## Row Level Security (RLS) Policies

### Enable RLS on All Tables
```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_voices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;
```

### Policies (Users can only access their own data)
```sql
-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Social Accounts
CREATE POLICY "Users can manage own social accounts" ON public.social_accounts
  FOR ALL USING (auth.uid() = user_id);

-- Campaigns
CREATE POLICY "Users can manage own campaigns" ON public.campaigns
  FOR ALL USING (auth.uid() = user_id);

-- Campaign Content
CREATE POLICY "Users can manage own campaign content" ON public.campaign_content
  FOR ALL USING (
    campaign_id IN (
      SELECT id FROM public.campaigns WHERE user_id = auth.uid()
    )
  );

-- Brand Voices
CREATE POLICY "Users can manage own brand voices" ON public.brand_voices
  FOR ALL USING (auth.uid() = user_id);

-- Media Assets
CREATE POLICY "Users can manage own media" ON public.media_assets
  FOR ALL USING (auth.uid() = user_id);

-- AI Usage
CREATE POLICY "Users can view own usage" ON public.ai_usage
  FOR SELECT USING (auth.uid() = user_id);

-- API Keys
CREATE POLICY "Users can manage own API keys" ON public.api_keys
  FOR ALL USING (auth.uid() = user_id);

-- Onboarding Progress
CREATE POLICY "Users can manage own onboarding" ON public.onboarding_progress
  FOR ALL USING (auth.uid() = user_id);

-- Analytics
CREATE POLICY "Users can view own analytics" ON public.analytics_snapshots
  FOR SELECT USING (auth.uid() = user_id);
```

---

## Subscription Tiers & Limits

### Free Tier
- 1 campaign per month
- 3 social accounts
- Local AI only (LM Studio)
- No image/video generation
- Basic analytics

### Pro Tier ($29/month)
- 10 campaigns per month
- Unlimited social accounts
- Claude, Gemini, Grok APIs (BYO keys)
- Google Imagen (limited)
- Full analytics
- Email support

### Premium Tier ($99/month)
- Unlimited campaigns
- Unlimited social accounts
- All AI providers (we cover costs)
- Unlimited image/video generation
- Priority support
- White-label option

---

## Next Steps

1. Create Supabase project
2. Run SQL migrations in Supabase SQL Editor
3. Set up Supabase Storage buckets:
   - `avatars` - User profile pictures
   - `media-assets` - Generated images/videos
   - `uploads` - User uploaded content
4. Configure authentication providers (Google, Twitter, Email)
5. Set up Stripe webhook endpoints

**Database is ready for:**
- User authentication & profiles
- Multi-platform social media management
- Campaign creation & scheduling
- AI-generated content (text, image, video, audio)
- Analytics & usage tracking
- Subscription management
- Onboarding flow
