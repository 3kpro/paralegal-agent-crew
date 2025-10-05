-- Migration 003: AI Tools, Enhanced Profiles, and Subscription Management
-- Created: 2025-10-04
-- Purpose: Add AI tools system, enhance user profiles, implement tier-based access control

-- ============================================================================
-- PART 1: CREATE ENUMS FOR TYPE SAFETY
-- ============================================================================

-- Subscription tiers
CREATE TYPE public.subscription_tier_enum AS ENUM ('free', 'pro', 'premium');

-- Subscription status
CREATE TYPE public.subscription_status_enum AS ENUM ('active', 'canceled', 'past_due', 'trialing');

-- Campaign status (if not already exists)
DO $$ BEGIN
    CREATE TYPE public.campaign_status_enum AS ENUM ('draft', 'scheduled', 'published', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AI tool categories
CREATE TYPE public.ai_category_enum AS ENUM ('text', 'image', 'voice', 'video', 'local');

-- AI test status
CREATE TYPE public.ai_test_status_enum AS ENUM ('pending', 'success', 'failed');

-- ============================================================================
-- PART 2: CREATE AI TOOLS TABLES
-- ============================================================================

-- Master catalog of available AI providers/tools
CREATE TABLE IF NOT EXISTS public.ai_providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  provider_key TEXT UNIQUE NOT NULL, -- 'openai', 'anthropic', etc.
  category public.ai_category_enum NOT NULL,
  description TEXT,
  logo_url TEXT,
  setup_url TEXT, -- URL where users get API key
  setup_instructions JSONB, -- {steps: [], timeEstimate, costInfo, keyFormat}
  required_tier public.subscription_tier_enum DEFAULT 'free',
  is_active BOOLEAN DEFAULT true,
  config_schema JSONB, -- JSON schema for configuration options
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_ai_providers_category ON public.ai_providers(category);
CREATE INDEX IF NOT EXISTS idx_ai_providers_tier ON public.ai_providers(required_tier);
CREATE INDEX IF NOT EXISTS idx_ai_providers_active ON public.ai_providers(is_active);

-- User's configured AI tools
CREATE TABLE IF NOT EXISTS public.user_ai_tools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES public.ai_providers(id) ON DELETE CASCADE NOT NULL,
  api_key_encrypted TEXT, -- Encrypted API key
  configuration JSONB DEFAULT '{}', -- {model, temperature, maxTokens, etc.}
  is_active BOOLEAN DEFAULT true,
  last_tested_at TIMESTAMP WITH TIME ZONE,
  test_status public.ai_test_status_enum DEFAULT 'pending',
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, provider_id)
);

-- RLS Policies for user_ai_tools
ALTER TABLE public.user_ai_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI tools" ON public.user_ai_tools
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own AI tools" ON public.user_ai_tools
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own AI tools" ON public.user_ai_tools
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own AI tools" ON public.user_ai_tools
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Indexes for user_ai_tools
CREATE INDEX IF NOT EXISTS idx_user_ai_tools_user ON public.user_ai_tools(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ai_tools_provider ON public.user_ai_tools(provider_id);
CREATE INDEX IF NOT EXISTS idx_user_ai_tools_active ON public.user_ai_tools(user_id, is_active);

-- AI tool usage tracking
CREATE TABLE IF NOT EXISTS public.ai_tool_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES public.ai_providers(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  tokens_used INTEGER DEFAULT 0,
  estimated_cost DECIMAL(10, 4) DEFAULT 0, -- USD
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for ai_tool_usage
ALTER TABLE public.ai_tool_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage" ON public.ai_tool_usage
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own usage" ON public.ai_tool_usage
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Index for fast aggregations
CREATE INDEX IF NOT EXISTS idx_ai_tool_usage_user_date ON public.ai_tool_usage(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_tool_usage_campaign ON public.ai_tool_usage(campaign_id);

-- ============================================================================
-- PART 3: ENHANCE PROFILES TABLE
-- ============================================================================

-- Add new columns to existing profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS company_logo_url TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York',
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en-US',
  ADD COLUMN IF NOT EXISTS twitter_handle TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS facebook_url TEXT,
  ADD COLUMN IF NOT EXISTS instagram_handle TEXT,
  ADD COLUMN IF NOT EXISTS tiktok_handle TEXT,
  ADD COLUMN IF NOT EXISTS reddit_handle TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add subscription management columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS ai_tools_limit INTEGER DEFAULT 1;

-- Convert subscription_tier to ENUM (with safe defaults)
-- First drop the default
ALTER TABLE public.profiles
  ALTER COLUMN subscription_tier DROP DEFAULT;

-- Then convert the type
ALTER TABLE public.profiles
  ALTER COLUMN subscription_tier TYPE public.subscription_tier_enum
  USING CASE
    WHEN subscription_tier IN ('free', 'pro', 'premium') THEN subscription_tier::public.subscription_tier_enum
    ELSE 'free'::public.subscription_tier_enum
  END;

-- Set new default for subscription_tier
ALTER TABLE public.profiles
  ALTER COLUMN subscription_tier SET DEFAULT 'free'::public.subscription_tier_enum;

-- Convert subscription_status to ENUM (with safe defaults)
-- First drop the default
ALTER TABLE public.profiles
  ALTER COLUMN subscription_status DROP DEFAULT;

-- Then convert the type
ALTER TABLE public.profiles
  ALTER COLUMN subscription_status TYPE public.subscription_status_enum
  USING CASE
    WHEN subscription_status IN ('active', 'canceled', 'past_due', 'trialing') THEN subscription_status::public.subscription_status_enum
    ELSE 'active'::public.subscription_status_enum
  END;

-- Set new default for subscription_status
ALTER TABLE public.profiles
  ALTER COLUMN subscription_status SET DEFAULT 'active'::public.subscription_status_enum;

-- ============================================================================
-- PART 4: UPDATE CAMPAIGNS TABLE
-- ============================================================================

-- Convert campaign status to ENUM (with safe defaults)
-- First drop the default
ALTER TABLE public.campaigns
  ALTER COLUMN status DROP DEFAULT;

-- Then convert the type
ALTER TABLE public.campaigns
  ALTER COLUMN status TYPE public.campaign_status_enum
  USING CASE
    WHEN status IN ('draft', 'scheduled', 'published', 'completed', 'failed') THEN status::public.campaign_status_enum
    ELSE 'draft'::public.campaign_status_enum
  END;

-- Set new default for campaign status
ALTER TABLE public.campaigns
  ALTER COLUMN status SET DEFAULT 'draft'::public.campaign_status_enum;

-- ============================================================================
-- PART 5: TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure function resolves objects in public and pg_temp only (security best practice)
  PERFORM set_config('search_path', 'public, pg_temp', true);

  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for user_ai_tools
DROP TRIGGER IF EXISTS update_user_ai_tools_updated_at ON public.user_ai_tools;
CREATE TRIGGER update_user_ai_tools_updated_at
  BEFORE UPDATE ON public.user_ai_tools
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to enforce AI tools limit based on tier
CREATE OR REPLACE FUNCTION public.check_ai_tools_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  user_limit INTEGER;
BEGIN
  -- Only check on INSERT of active tools
  IF NEW.is_active = false THEN
    RETURN NEW;
  END IF;

  -- Get current count of active tools for user (excluding current insert)
  SELECT COUNT(*) INTO current_count
  FROM public.user_ai_tools
  WHERE user_id = NEW.user_id
    AND is_active = true
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

  -- Get user's limit
  SELECT ai_tools_limit INTO user_limit
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Check if limit exceeded
  IF current_count >= user_limit THEN
    RAISE EXCEPTION 'AI tools limit exceeded. Current: %, Limit: %. Upgrade your plan to add more tools.', current_count, user_limit;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce AI tools limit
DROP TRIGGER IF EXISTS enforce_ai_tools_limit ON public.user_ai_tools;
CREATE TRIGGER enforce_ai_tools_limit
  BEFORE INSERT OR UPDATE ON public.user_ai_tools
  FOR EACH ROW
  EXECUTE FUNCTION public.check_ai_tools_limit();

-- Function to set ai_tools_limit based on tier
CREATE OR REPLACE FUNCTION public.set_ai_tools_limit_from_tier()
RETURNS TRIGGER AS $$
BEGIN
  -- Set limit based on subscription tier
  NEW.ai_tools_limit := CASE NEW.subscription_tier
    WHEN 'free' THEN 1
    WHEN 'pro' THEN 3
    WHEN 'premium' THEN 999
    ELSE 1
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-set ai_tools_limit when tier changes
DROP TRIGGER IF EXISTS set_ai_tools_limit_on_tier_change ON public.profiles;
CREATE TRIGGER set_ai_tools_limit_on_tier_change
  BEFORE INSERT OR UPDATE OF subscription_tier ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_ai_tools_limit_from_tier();

-- ============================================================================
-- PART 6: SEED INITIAL AI PROVIDERS
-- ============================================================================

INSERT INTO public.ai_providers (name, provider_key, category, description, setup_url, setup_instructions, required_tier, config_schema) VALUES

-- TEXT GENERATION
('OpenAI (GPT)', 'openai', 'text', 'GPT-4, GPT-3.5 for text generation', 'https://platform.openai.com/api-keys',
  '{"steps": ["Sign in to OpenAI Platform", "Click ''Create new secret key''", "Name your key (e.g., ''Content Cascade'')", "Copy the key (shown only once)", "Paste above"], "timeEstimate": "~3 minutes", "costInfo": "$5 free credit, then $0.002-0.12 per 1K tokens", "keyFormat": "sk-..."}'::jsonb,
  'free', '{"model": {"type": "select", "options": ["gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"], "default": "gpt-4-turbo"}, "temperature": {"type": "number", "min": 0, "max": 2, "default": 0.7}, "maxTokens": {"type": "number", "min": 100, "max": 4000, "default": 2000}}'::jsonb),

('Anthropic (Claude)', 'anthropic', 'text', 'Claude 3 Opus, Sonnet, Haiku', 'https://console.anthropic.com/settings/keys',
  '{"steps": ["Sign in to Anthropic Console", "Navigate to API Keys section", "Click ''Create Key''", "Copy the key", "Paste above"], "timeEstimate": "~3 minutes", "costInfo": "$5 free credit, then $0.25-15 per million tokens", "keyFormat": "sk-ant-..."}'::jsonb,
  'pro', '{"model": {"type": "select", "options": ["claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"], "default": "claude-3-sonnet-20240229"}, "temperature": {"type": "number", "min": 0, "max": 1, "default": 0.7}, "maxTokens": {"type": "number", "min": 100, "max": 4000, "default": 2000}}'::jsonb),

('Google (Gemini)', 'google', 'text', 'Gemini Pro, Ultra for text generation', 'https://aistudio.google.com/app/apikey',
  '{"steps": ["Sign in with Google account", "Click ''Get API key''", "Create or select project", "Copy generated key", "Paste above"], "timeEstimate": "~5 minutes", "costInfo": "Free tier available, then $0.00025-0.00125 per 1K chars", "keyFormat": "AIza..."}'::jsonb,
  'pro', '{"model": {"type": "select", "options": ["gemini-pro", "gemini-1.5-pro"], "default": "gemini-pro"}, "temperature": {"type": "number", "min": 0, "max": 1, "default": 0.7}}'::jsonb),

('xAI (Grok)', 'xai', 'text', 'Grok AI for text generation', 'https://console.x.ai/',
  '{"steps": ["Sign in with X (Twitter) account", "Navigate to API section", "Generate API key", "Copy the key", "Paste above"], "timeEstimate": "~3 minutes", "costInfo": "Pricing TBD (currently in beta)", "keyFormat": "xai-..."}'::jsonb,
  'premium', '{"model": {"type": "select", "options": ["grok-1"], "default": "grok-1"}}'::jsonb),

-- IMAGE GENERATION
('DALL-E 3', 'dalle', 'image', 'OpenAI DALL-E 3 for image generation', 'https://platform.openai.com/api-keys',
  '{"steps": ["Same as OpenAI GPT setup", "Uses same API key"], "timeEstimate": "~3 minutes", "costInfo": "$0.04-0.12 per image", "keyFormat": "sk-..."}'::jsonb,
  'pro', '{"size": {"type": "select", "options": ["1024x1024", "1792x1024", "1024x1792"], "default": "1024x1024"}, "quality": {"type": "select", "options": ["standard", "hd"], "default": "standard"}}'::jsonb),

('Stable Diffusion', 'stability', 'image', 'Stability AI Stable Diffusion', 'https://platform.stability.ai/',
  '{"steps": ["Sign in to Stability AI", "Navigate to API Keys", "Create new key", "Copy the key", "Paste above"], "timeEstimate": "~3 minutes", "costInfo": "$10 free credit, then $0.002-0.20 per image", "keyFormat": "sk-..."}'::jsonb,
  'pro', '{"model": {"type": "select", "options": ["stable-diffusion-xl-1024-v1-0", "stable-diffusion-v1-6"], "default": "stable-diffusion-xl-1024-v1-0"}}'::jsonb),

('Midjourney', 'midjourney', 'image', 'Midjourney AI for stunning images (Discord)', 'https://docs.midjourney.com/docs/api',
  '{"steps": ["Join Midjourney Discord", "Subscribe to plan", "Get API access (requires subscription)", "Copy API key", "Paste above"], "timeEstimate": "~10 minutes", "costInfo": "$10/month minimum subscription", "keyFormat": "mj-..."}'::jsonb,
  'premium', '{"version": {"type": "select", "options": ["v6", "v5.2"], "default": "v6"}}'::jsonb),

-- VOICE & AUDIO
('ElevenLabs', 'elevenlabs', 'voice', 'Voice generation and cloning', 'https://elevenlabs.io/api',
  '{"steps": ["Sign in to ElevenLabs", "Go to Profile Settings", "Copy API key from API section", "Paste above"], "timeEstimate": "~2 minutes", "costInfo": "10,000 free chars/month, then $5/month", "keyFormat": "Standard alphanumeric"}'::jsonb,
  'pro', '{"voice": {"type": "select", "options": ["adam", "rachel", "domi", "bella", "Antoni"], "default": "rachel"}, "stability": {"type": "number", "min": 0, "max": 1, "default": 0.5}}'::jsonb),

('OpenAI Whisper', 'whisper', 'voice', 'Speech-to-text transcription', 'https://platform.openai.com/api-keys',
  '{"steps": ["Same as OpenAI GPT setup", "Uses same API key"], "timeEstimate": "~3 minutes", "costInfo": "$0.006 per minute", "keyFormat": "sk-..."}'::jsonb,
  'pro', '{"model": {"type": "select", "options": ["whisper-1"], "default": "whisper-1"}, "language": {"type": "text", "default": "en"}}'::jsonb),

-- VIDEO GENERATION
('RunwayML', 'runway', 'video', 'Gen-2 video generation', 'https://app.runwayml.com/settings',
  '{"steps": ["Sign in to RunwayML", "Go to Settings", "Generate API key", "Copy the key", "Paste above"], "timeEstimate": "~3 minutes", "costInfo": "$12/month for 125 credits", "keyFormat": "rw-..."}'::jsonb,
  'premium', '{"model": {"type": "select", "options": ["gen2"], "default": "gen2"}}'::jsonb),

-- LOCAL AI (FREE)
('LM Studio', 'lmstudio', 'local', 'Local AI models (free, no API key needed)', 'http://10.10.10.105:1234',
  '{"steps": ["Already configured!", "LM Studio is running locally", "No API key needed"], "timeEstimate": "0 minutes", "costInfo": "100% Free - runs on your hardware", "keyFormat": "N/A"}'::jsonb,
  'free', '{"endpoint": {"type": "text", "default": "http://10.10.10.105:1234"}}'::jsonb)

ON CONFLICT (provider_key) DO NOTHING;

-- ============================================================================
-- PART 7: RLS POLICIES FOR AI PROVIDERS (PUBLIC READ)
-- ============================================================================

ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active AI providers" ON public.ai_providers
  FOR SELECT TO authenticated
  USING (is_active = true);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Update ai_tools_limit for existing users based on current tier
UPDATE public.profiles
SET ai_tools_limit = CASE subscription_tier
  WHEN 'free' THEN 1
  WHEN 'pro' THEN 3
  WHEN 'premium' THEN 999
  ELSE 1
END
WHERE ai_tools_limit IS NULL;
