# Backend Implementation Plan - Settings & AI Tools System

**Date:** 2025-10-04
**Developer:** Claude (Backend/Infrastructure)
**Related:** ZENCODER_HANDOFF_SETTINGS_AI.md

---

## 📋 Overview

This document outlines the backend implementation for:
1. AI Tools database schema and APIs
2. Stripe payment integration
3. Enhanced profile management
4. Membership tier enforcement
5. API key encryption and management
6. Campaign generator AI tool integration

---

## 🗄️ Phase 1: Database Schema Updates

### Migration File: `supabase/migrations/003_ai_tools_and_profiles.sql`

#### 1.1 AI Providers Catalog Table

```sql
-- Master catalog of available AI providers/tools
CREATE TABLE public.ai_providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  provider_key TEXT UNIQUE NOT NULL, -- 'openai', 'anthropic', etc.
  category TEXT NOT NULL, -- 'text', 'image', 'voice', 'video', 'local'
  description TEXT,
  logo_url TEXT,
  setup_url TEXT, -- URL where users get API key
  setup_instructions JSONB, -- {steps: [], timeEstimate, costInfo, keyFormat}
  required_tier TEXT DEFAULT 'free', -- 'free', 'pro', 'premium'
  is_active BOOLEAN DEFAULT true,
  config_schema JSONB, -- JSON schema for configuration options
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_ai_providers_category ON public.ai_providers(category);
CREATE INDEX idx_ai_providers_tier ON public.ai_providers(required_tier);
```

#### 1.2 User AI Tools Configuration Table

```sql
-- User's configured AI tools
CREATE TABLE public.user_ai_tools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES public.ai_providers(id) ON DELETE CASCADE,
  api_key_encrypted TEXT, -- Encrypted API key
  configuration JSONB, -- {model, temperature, maxTokens, etc.}
  is_active BOOLEAN DEFAULT true,
  last_tested_at TIMESTAMP WITH TIME ZONE,
  test_status TEXT, -- 'success', 'failed', 'pending'
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, provider_id)
);

-- RLS Policies
ALTER TABLE public.user_ai_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI tools" ON public.user_ai_tools
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI tools" ON public.user_ai_tools
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI tools" ON public.user_ai_tools
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI tools" ON public.user_ai_tools
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_user_ai_tools_user ON public.user_ai_tools(user_id);
CREATE INDEX idx_user_ai_tools_provider ON public.user_ai_tools(provider_id);
```

#### 1.3 Enhanced Profiles Table

```sql
-- Add new columns to existing profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_logo_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en-US';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS twitter_handle TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS instagram_handle TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### 1.4 Subscription Management

```sql
-- Add subscription fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active'; -- 'active', 'canceled', 'past_due'
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_tools_limit INTEGER DEFAULT 1; -- Based on tier

-- Create function to check tier limits
CREATE OR REPLACE FUNCTION check_ai_tools_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  user_limit INTEGER;
BEGIN
  -- Get current count of active tools for user
  SELECT COUNT(*) INTO current_count
  FROM public.user_ai_tools
  WHERE user_id = NEW.user_id AND is_active = true;

  -- Get user's limit
  SELECT ai_tools_limit INTO user_limit
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Check if limit exceeded
  IF current_count >= user_limit THEN
    RAISE EXCEPTION 'AI tools limit exceeded. Upgrade your plan to add more tools.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_ai_tools_limit
  BEFORE INSERT ON public.user_ai_tools
  FOR EACH ROW
  EXECUTE FUNCTION check_ai_tools_limit();
```

#### 1.5 Usage Tracking Table

```sql
-- Track API usage for analytics
CREATE TABLE public.ai_tool_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES public.ai_providers(id),
  campaign_id UUID REFERENCES public.campaigns(id),
  tokens_used INTEGER,
  estimated_cost DECIMAL(10, 4), -- USD
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.ai_tool_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage" ON public.ai_tool_usage
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Index for fast aggregations
CREATE INDEX idx_ai_tool_usage_user_date ON public.ai_tool_usage(user_id, created_at);
```

#### 1.6 Seed Initial AI Providers

```sql
-- Insert initial AI providers
INSERT INTO public.ai_providers (name, provider_key, category, description, setup_url, setup_instructions, required_tier, config_schema) VALUES
-- Text Generation
('OpenAI (GPT)', 'openai', 'text', 'GPT-4, GPT-3.5 for text generation', 'https://platform.openai.com/api-keys',
  '{"steps": ["Sign in to OpenAI Platform", "Click Create new secret key", "Copy the key (shown only once)", "Paste above"], "timeEstimate": "~3 minutes", "costInfo": "$5 free credit, then $0.002-0.12 per 1K tokens", "keyFormat": "sk-..."}',
  'free', '{"model": {"type": "select", "options": ["gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"], "default": "gpt-4-turbo"}, "temperature": {"type": "number", "min": 0, "max": 2, "default": 0.7}, "maxTokens": {"type": "number", "min": 100, "max": 4000, "default": 2000}}'::jsonb),

('Anthropic (Claude)', 'anthropic', 'text', 'Claude 3 Opus, Sonnet, Haiku', 'https://console.anthropic.com/settings/keys',
  '{"steps": ["Sign in to Anthropic Console", "Navigate to API Keys", "Click Create Key", "Copy the key", "Paste above"], "timeEstimate": "~3 minutes", "costInfo": "$5 free credit, then $0.25-15 per million tokens", "keyFormat": "sk-ant-..."}',
  'pro', '{"model": {"type": "select", "options": ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"], "default": "claude-3-sonnet"}, "temperature": {"type": "number", "min": 0, "max": 1, "default": 0.7}, "maxTokens": {"type": "number", "min": 100, "max": 4000, "default": 2000}}'::jsonb),

('Google (Gemini)', 'google', 'text', 'Gemini Pro, Ultra for text generation', 'https://aistudio.google.com/app/apikey',
  '{"steps": ["Sign in with Google account", "Click Get API key", "Create or select project", "Copy generated key", "Paste above"], "timeEstimate": "~5 minutes", "costInfo": "Free tier available, then $0.00025-0.00125 per 1K chars", "keyFormat": "AIza..."}',
  'pro', '{"model": {"type": "select", "options": ["gemini-pro", "gemini-ultra"], "default": "gemini-pro"}, "temperature": {"type": "number", "min": 0, "max": 1, "default": 0.7}}'::jsonb),

('xAI (Grok)', 'xai', 'text', 'Grok AI for text generation', 'https://console.x.ai/',
  '{"steps": ["Sign in with X (Twitter) account", "Navigate to API section", "Generate API key", "Copy the key", "Paste above"], "timeEstimate": "~3 minutes", "costInfo": "Pricing TBD (currently in beta)", "keyFormat": "xai-..."}',
  'premium', '{"model": {"type": "select", "options": ["grok-1"], "default": "grok-1"}}'::jsonb),

-- Image Generation
('DALL-E 3', 'dalle', 'image', 'OpenAI DALL-E 3 for image generation', 'https://platform.openai.com/api-keys',
  '{"steps": ["Same as OpenAI GPT setup", "Uses same API key"], "timeEstimate": "~3 minutes", "costInfo": "$0.04-0.12 per image", "keyFormat": "sk-..."}',
  'pro', '{"size": {"type": "select", "options": ["1024x1024", "1792x1024", "1024x1792"], "default": "1024x1024"}, "quality": {"type": "select", "options": ["standard", "hd"], "default": "standard"}}'::jsonb),

('Stable Diffusion', 'stability', 'image', 'Stability AI Stable Diffusion', 'https://platform.stability.ai/',
  '{"steps": ["Sign in to Stability AI", "Navigate to API Keys", "Create new key", "Copy the key", "Paste above"], "timeEstimate": "~3 minutes", "costInfo": "$10 free credit, then $0.002-0.20 per image", "keyFormat": "sk-..."}',
  'pro', '{"model": {"type": "select", "options": ["stable-diffusion-xl", "stable-diffusion-v1-6"], "default": "stable-diffusion-xl"}}'::jsonb),

-- Voice
('ElevenLabs', 'elevenlabs', 'voice', 'Voice generation and cloning', 'https://elevenlabs.io/api',
  '{"steps": ["Sign in to ElevenLabs", "Go to Profile Settings", "Copy API key from API section", "Paste above"], "timeEstimate": "~2 minutes", "costInfo": "10,000 free chars/month, then $5/month", "keyFormat": "Standard alphanumeric"}',
  'pro', '{"voice": {"type": "select", "options": ["adam", "rachel", "domi", "bella"], "default": "rachel"}, "stability": {"type": "number", "min": 0, "max": 1, "default": 0.5}}'::jsonb),

-- Local (Always Free)
('LM Studio', 'lmstudio', 'local', 'Local AI models (free, no API key needed)', 'http://10.10.10.105:1234',
  '{"steps": ["Already configured!", "LM Studio is running locally", "No API key needed"], "timeEstimate": "0 minutes", "costInfo": "100% Free - runs on your hardware", "keyFormat": "N/A"}',
  'free', '{"endpoint": {"type": "text", "default": "http://10.10.10.105:1234"}}'::jsonb);
```

---

## 🔐 Phase 2: API Key Encryption

### File: `lib/encryption.ts`

```typescript
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY! // 32 bytes
const ALGORITHM = 'aes-256-gcm'

export function encryptAPIKey(apiKey: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv)

  let encrypted = cipher.update(apiKey, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag()

  // Return: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

export function decryptAPIKey(encryptedData: string): string {
  const parts = encryptedData.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const authTag = Buffer.from(parts[1], 'hex')
  const encrypted = parts[2]

  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

// Generate encryption key (run once, save to .env)
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex')
}
```

**Environment Setup:**
```bash
# Generate key once and add to .env.local
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add to `.env.local`:
```
ENCRYPTION_KEY=<generated_64_char_hex_string>
```

---

## 🔌 Phase 3: API Endpoints

### 3.1 AI Tools List

**File:** `app/api/ai-tools/list/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's tier to filter available tools
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, ai_tools_limit')
    .eq('id', user.id)
    .single()

  // Get all AI providers
  const { data: providers, error: providersError } = await supabase
    .from('ai_providers')
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true })

  if (providersError) {
    return NextResponse.json({ error: providersError.message }, { status: 500 })
  }

  // Get user's configured tools
  const { data: userTools } = await supabase
    .from('user_ai_tools')
    .select('provider_id, configuration, is_active, test_status')
    .eq('user_id', user.id)

  // Map user tools for quick lookup
  const userToolsMap = new Map(userTools?.map(t => [t.provider_id, t]) || [])

  // Filter and enhance providers based on tier
  const tierHierarchy = { free: 0, pro: 1, premium: 2 }
  const userTierLevel = tierHierarchy[profile?.subscription_tier || 'free']

  const enhancedProviders = providers.map(provider => {
    const requiredTierLevel = tierHierarchy[provider.required_tier || 'free']
    const isLocked = requiredTierLevel > userTierLevel
    const userTool = userToolsMap.get(provider.id)

    return {
      ...provider,
      isConfigured: !!userTool?.is_active,
      isLocked,
      testStatus: userTool?.test_status,
      // Never send encrypted API key to frontend
      hasApiKey: !!userTool
    }
  })

  return NextResponse.json({
    success: true,
    providers: enhancedProviders,
    userLimits: {
      current: userTools?.length || 0,
      max: profile?.ai_tools_limit || 1
    }
  })
}
```

### 3.2 Configure AI Tool

**File:** `app/api/ai-tools/configure/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { encryptAPIKey } from '@/lib/encryption'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { providerId, apiKey, configuration } = body

  // Validate required fields
  if (!providerId || !apiKey) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Encrypt API key
  const encryptedKey = encryptAPIKey(apiKey)

  // Upsert user tool configuration
  const { data, error } = await supabase
    .from('user_ai_tools')
    .upsert({
      user_id: user.id,
      provider_id: providerId,
      api_key_encrypted: encryptedKey,
      configuration: configuration || {},
      is_active: true,
      test_status: 'pending',
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,provider_id'
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    message: 'AI tool configured successfully',
    toolId: data.id
  })
}
```

### 3.3 Test API Key

**File:** `app/api/ai-tools/test/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { decryptAPIKey } from '@/lib/encryption'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { toolId } = body

  // Get user's tool configuration
  const { data: userTool, error: toolError } = await supabase
    .from('user_ai_tools')
    .select('*, ai_providers(*)')
    .eq('id', toolId)
    .eq('user_id', user.id)
    .single()

  if (toolError || !userTool) {
    return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
  }

  try {
    // Decrypt API key
    const apiKey = decryptAPIKey(userTool.api_key_encrypted)
    const provider = userTool.ai_providers

    // Test connection based on provider
    let testResult = { success: false, message: '' }

    switch (provider.provider_key) {
      case 'openai':
        testResult = await testOpenAI(apiKey)
        break
      case 'anthropic':
        testResult = await testAnthropic(apiKey)
        break
      case 'google':
        testResult = await testGoogle(apiKey)
        break
      case 'lmstudio':
        testResult = await testLMStudio()
        break
      // Add more providers...
      default:
        testResult = { success: false, message: 'Provider not supported yet' }
    }

    // Update test status
    await supabase
      .from('user_ai_tools')
      .update({
        test_status: testResult.success ? 'success' : 'failed',
        last_tested_at: new Date().toISOString()
      })
      .eq('id', toolId)

    return NextResponse.json(testResult)

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message
    }, { status: 500 })
  }
}

async function testOpenAI(apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/models', {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  })

  if (response.ok) {
    return { success: true, message: 'OpenAI API key is valid!' }
  } else {
    const error = await response.json()
    return { success: false, message: error.error?.message || 'Invalid API key' }
  }
}

async function testAnthropic(apiKey: string) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hi' }]
    })
  })

  if (response.ok) {
    return { success: true, message: 'Claude API key is valid!' }
  } else {
    const error = await response.json()
    return { success: false, message: error.error?.message || 'Invalid API key' }
  }
}

async function testGoogle(apiKey: string) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`)

  if (response.ok) {
    return { success: true, message: 'Google API key is valid!' }
  } else {
    return { success: false, message: 'Invalid API key' }
  }
}

async function testLMStudio() {
  const endpoint = process.env.LM_STUDIO_ENDPOINT || 'http://10.10.10.105:1234'
  try {
    const response = await fetch(`${endpoint}/v1/models`)
    if (response.ok) {
      return { success: true, message: 'LM Studio is running!' }
    }
  } catch (error) {
    return { success: false, message: 'LM Studio is not reachable' }
  }
  return { success: false, message: 'LM Studio connection failed' }
}
```

### 3.4 Delete AI Tool

**File:** `app/api/ai-tools/[id]/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('user_ai_tools')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
```

### 3.5 Update Profile

**File:** `app/api/profile/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, profile })
}

export async function PUT(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const updates = await request.json()

  // Remove fields that shouldn't be updated directly
  const { id, email, created_at, stripe_customer_id, ...allowedUpdates } = updates

  const { data, error } = await supabase
    .from('profiles')
    .update(allowedUpdates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    message: 'Profile updated successfully',
    profile: data
  })
}
```

### 3.6 Usage Stats

**File:** `app/api/usage/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get profile with limits
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, ai_tools_limit')
    .eq('id', user.id)
    .single()

  // Get campaign usage this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: campaignsThisMonth } = await supabase
    .from('campaigns')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', startOfMonth.toISOString())

  // Get AI tools count
  const { count: aiToolsCount } = await supabase
    .from('user_ai_tools')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_active', true)

  // Get API usage and costs
  const { data: apiUsage } = await supabase
    .from('ai_tool_usage')
    .select('tokens_used, estimated_cost')
    .eq('user_id', user.id)
    .gte('created_at', startOfMonth.toISOString())

  const totalCost = apiUsage?.reduce((sum, u) => sum + Number(u.estimated_cost || 0), 0) || 0
  const apiCallsCount = apiUsage?.length || 0

  // Calculate campaign limits based on tier
  const campaignLimits = {
    free: 5,
    pro: 999999,
    premium: 999999
  }

  return NextResponse.json({
    success: true,
    usage: {
      campaignsUsed: campaignsThisMonth || 0,
      campaignsLimit: campaignLimits[profile?.subscription_tier || 'free'],
      aiToolsUsed: aiToolsCount || 0,
      aiToolsLimit: profile?.ai_tools_limit || 1,
      apiCallsThisMonth: apiCallsCount,
      estimatedCostSaved: totalCost, // If using LM Studio vs paid APIs
      currentTier: profile?.subscription_tier || 'free'
    }
  })
}
```

---

## 💳 Phase 4: Stripe Integration

### 4.1 Stripe Setup

**File:** `lib/stripe.ts`

```typescript
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

// Product IDs (create in Stripe Dashboard)
export const STRIPE_PRODUCTS = {
  PRO_MONTHLY: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
  PRO_YEARLY: process.env.STRIPE_PRO_YEARLY_PRICE_ID!,
  PREMIUM_MONTHLY: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID!,
  PREMIUM_YEARLY: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID!,
}

export const TIER_LIMITS = {
  free: {
    campaignsPerMonth: 5,
    aiTools: 1,
    socialPlatforms: 3,
    storageGB: 0.1, // 100MB
  },
  pro: {
    campaignsPerMonth: 999999,
    aiTools: 3,
    socialPlatforms: 999,
    storageGB: 10,
  },
  premium: {
    campaignsPerMonth: 999999,
    aiTools: 999,
    socialPlatforms: 999,
    storageGB: 100,
  },
}
```

**Environment Variables (.env.local):**
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_YEARLY_PRICE_ID=price_...
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_...
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

### 4.2 Checkout Session

**File:** `app/api/stripe/checkout/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { stripe, STRIPE_PRODUCTS } from '@/lib/stripe'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { priceId, tier } = await request.json()

  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, email')
    .eq('id', user.id)
    .single()

  let customerId = profile?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email,
      metadata: { supabase_user_id: user.id }
    })
    customerId = customer.id

    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?canceled=true`,
    metadata: {
      supabase_user_id: user.id,
      tier: tier
    }
  })

  return NextResponse.json({
    success: true,
    sessionId: session.id,
    url: session.url
  })
}
```

### 4.3 Webhook Handler

**File:** `app/api/stripe/webhook/route.ts`

```typescript
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe, TIER_LIMITS } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

// Use service role for webhook (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event: any

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object)
      break
    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(event.data.object)
      break
    case 'customer.subscription.deleted':
      await handleSubscriptionCancel(event.data.object)
      break
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutComplete(session: any) {
  const userId = session.metadata.supabase_user_id
  const tier = session.metadata.tier

  const limits = TIER_LIMITS[tier as keyof typeof TIER_LIMITS]

  await supabaseAdmin
    .from('profiles')
    .update({
      subscription_tier: tier,
      subscription_status: 'active',
      stripe_subscription_id: session.subscription,
      ai_tools_limit: limits.aiTools,
      subscription_current_period_end: new Date(session.expires_at * 1000).toISOString()
    })
    .eq('id', userId)
}

async function handleSubscriptionUpdate(subscription: any) {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .single()

  if (profile) {
    await supabaseAdmin
      .from('profiles')
      .update({
        subscription_status: subscription.status,
        subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
      })
      .eq('id', profile.id)
  }
}

async function handleSubscriptionCancel(subscription: any) {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .single()

  if (profile) {
    await supabaseAdmin
      .from('profiles')
      .update({
        subscription_tier: 'free',
        subscription_status: 'canceled',
        ai_tools_limit: TIER_LIMITS.free.aiTools
      })
      .eq('id', profile.id)
  }
}
```

### 4.4 Customer Portal

**File:** `app/api/stripe/portal/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 400 })
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`
  })

  return NextResponse.json({ url: session.url })
}
```

---

## 🚀 Phase 5: Campaign Generator Integration

### 5.1 Unified Generation Endpoint

**File:** `app/api/generate/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { decryptAPIKey } from '@/lib/encryption'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { topic, formats, preferredProvider } = await request.json()

  // Get user's configured AI tools
  const { data: userTools } = await supabase
    .from('user_ai_tools')
    .select('*, ai_providers(*)')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .eq('test_status', 'success')

  if (!userTools || userTools.length === 0) {
    return NextResponse.json({
      error: 'No AI tools configured. Please add an AI tool in Settings.'
    }, { status: 400 })
  }

  // Find preferred provider or use first available
  let selectedTool = userTools.find(t => t.ai_providers.provider_key === preferredProvider)
  if (!selectedTool) {
    selectedTool = userTools[0] // Fallback to first available
  }

  const provider = selectedTool.ai_providers
  const apiKey = selectedTool.api_key_encrypted ? decryptAPIKey(selectedTool.api_key_encrypted) : null

  // Generate content based on provider
  let content: any
  try {
    switch (provider.provider_key) {
      case 'openai':
        content = await generateWithOpenAI(apiKey!, topic, formats, selectedTool.configuration)
        break
      case 'anthropic':
        content = await generateWithClaude(apiKey!, topic, formats, selectedTool.configuration)
        break
      case 'google':
        content = await generateWithGemini(apiKey!, topic, formats, selectedTool.configuration)
        break
      case 'lmstudio':
        content = await generateWithLMStudio(topic, formats)
        break
      default:
        throw new Error('Provider not supported')
    }

    // Track usage
    await supabase.from('ai_tool_usage').insert({
      user_id: user.id,
      provider_id: provider.id,
      tokens_used: content.tokensUsed || 0,
      estimated_cost: content.estimatedCost || 0
    })

    return NextResponse.json({ success: true, content })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function generateWithOpenAI(apiKey: string, topic: string, formats: string[], config: any) {
  // Implementation similar to existing /api/generate-local but with OpenAI
  // ... (uses config.model, config.temperature, etc.)
}

async function generateWithClaude(apiKey: string, topic: string, formats: string[], config: any) {
  // Claude implementation
}

async function generateWithGemini(apiKey: string, topic: string, formats: string[], config: any) {
  // Gemini implementation
}

async function generateWithLMStudio(topic: string, formats: string[]) {
  // Reuse existing LM Studio logic from /api/generate-local
  const endpoint = process.env.API_GATEWAY_URL
    ? `${process.env.API_GATEWAY_URL}/generate`
    : 'http://10.10.10.105:1234/v1/chat/completions'

  // ... existing implementation
}
```

### 5.2 Update Campaign Creation Page

**File:** `app/(portal)/campaigns/new/page.tsx` (modifications)

```typescript
// In Step 3: Content Generation

// Fetch user's configured AI tools
const [aiTools, setAiTools] = useState<any[]>([])
const [selectedProvider, setSelectedProvider] = useState<string>('lmstudio')

useEffect(() => {
  async function loadAITools() {
    const response = await fetch('/api/ai-tools/list')
    const data = await response.json()
    if (data.success) {
      const configuredTools = data.providers.filter((p: any) => p.isConfigured)
      setAiTools(configuredTools)
      if (configuredTools.length > 0) {
        setSelectedProvider(configuredTools[0].provider_key)
      }
    }
  }
  loadAITools()
}, [])

// Update AI provider selector
<select
  value={selectedProvider}
  onChange={(e) => setSelectedProvider(e.target.value)}
  className="..."
>
  {aiTools.map(tool => (
    <option key={tool.provider_key} value={tool.provider_key}>
      {tool.name}
    </option>
  ))}
  {aiTools.length === 0 && (
    <option value="">No AI tools configured</option>
  )}
</select>

{aiTools.length === 0 && (
  <div className="text-sm text-red-600 mt-2">
    <Link href="/settings?tab=api-keys" className="underline">
      Configure an AI tool in Settings →
    </Link>
  </div>
)}

// Update generateContent function
async function generateContent() {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: selectedTrend.Hashtag,
      formats: contentFormats,
      preferredProvider: selectedProvider
    })
  })

  const data = await response.json()
  if (data.success) {
    setGeneratedContent(data.content)
  }
}
```

---

## 📋 Phase 6: Implementation Checklist

### Database Setup
- [ ] Run migration `003_ai_tools_and_profiles.sql`
- [ ] Verify RLS policies are active
- [ ] Test tier limit enforcement trigger
- [ ] Seed AI providers data

### Encryption
- [ ] Generate encryption key
- [ ] Add to `.env.local`
- [ ] Test encrypt/decrypt functions
- [ ] Never log decrypted keys

### API Endpoints
- [ ] `/api/ai-tools/list` - List tools
- [ ] `/api/ai-tools/configure` - Save config
- [ ] `/api/ai-tools/test` - Test connection
- [ ] `/api/ai-tools/[id]` - Delete tool
- [ ] `/api/profile` - GET/PUT profile
- [ ] `/api/usage` - Get usage stats
- [ ] `/api/generate` - Unified generation

### Stripe Setup
- [ ] Create Stripe account
- [ ] Create products (Pro, Premium)
- [ ] Create prices (monthly, yearly)
- [ ] Add price IDs to `.env.local`
- [ ] Set up webhook endpoint
- [ ] Test checkout flow
- [ ] Test webhook events
- [ ] Configure customer portal

### Integration
- [ ] Update campaigns/new with AI tools
- [ ] Add onboarding AI tools step
- [ ] Update settings with new fields
- [ ] Test tier enforcement
- [ ] Test usage limits

### Testing
- [ ] Test free tier limits
- [ ] Test upgrade flow
- [ ] Test downgrade flow
- [ ] Test API key encryption
- [ ] Test all AI providers
- [ ] Test usage tracking
- [ ] Load test with multiple users

---

## 🔒 Security Checklist

- [ ] API keys are encrypted at rest
- [ ] Never send decrypted keys to frontend
- [ ] RLS policies prevent cross-user access
- [ ] Stripe webhook signature verification
- [ ] Rate limiting on AI endpoints
- [ ] Input validation on all endpoints
- [ ] CORS configured correctly
- [ ] Environment variables secured

---

## 📝 Environment Variables Summary

Add to `.env.local`:
```bash
# Existing
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
API_GATEWAY_URL=...

# New - Encryption
ENCRYPTION_KEY=<64_char_hex_string>

# New - Supabase Admin
SUPABASE_SERVICE_ROLE_KEY=<from_supabase_dashboard>

# New - Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_YEARLY_PRICE_ID=price_...
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_...
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3002

# New - LM Studio
LM_STUDIO_ENDPOINT=http://10.10.10.105:1234
```

---

## 🚀 Deployment Notes

### Stripe Webhook Setup
1. In Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://3kpro.services/api/stripe/webhook`
3. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### Supabase Setup
1. Get service role key from Supabase Dashboard → Settings → API
2. Add to Vercel environment variables
3. Never commit service role key to git

### Vercel Environment Variables
Add all `.env.local` variables to Vercel project settings

---

**End of Backend Implementation Plan**
