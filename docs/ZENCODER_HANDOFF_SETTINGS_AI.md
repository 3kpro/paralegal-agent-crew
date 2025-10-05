# Content Cascade AI: Complete Settings & AI Tools UI/UX Specifications

**Project:** Content Cascade AI - Portal Settings & AI Tools Enhancement
**Date:** 2025-01-17  
**Version:** 2.0 - Complete UI/UX Handoff Package
**Assigned to:** ZenCoder (UI/UX Development)
**Backend Support:** Claude (APIs, Database, Stripe Integration)

---

## 📋 Executive Summary

This comprehensive UI/UX specification covers the complete enhancement of the Content Cascade AI portal's settings system and AI tools management. The package includes detailed wireframes, component specifications, design system guidelines, mock data structures, and full accessibility compliance for 6 major feature areas:

1. **API Keys Settings Enhancement** - Expandable instruction cards with step-by-step provider guides
2. **Enhanced Profile Settings** - 14 new fields including avatar, bio, social handles, and timezone
3. **AI Tools Selection Page** - Card-based tool browser with categories, status badges, and tier locks
4. **AI Tool Setup Wizard** - 4-step guided setup (Overview → API Key → Test → Configure)
5. **Onboarding Enhancement** - Step 3 AI tools selection integration
6. **Membership Page Redesign** - Visual pricing table, feature comparison, and usage meters

**Design Philosophy:** Clean, user-friendly interfaces following the "Notion meets Buffer meets Canva" aesthetic with large interactive elements, clear typography, and progressive disclosure patterns.

---

## 🎨 Task 1: API Keys Settings Enhancement

### Current State
- File: `app/(portal)/settings/page.tsx`
- Basic password input fields for 5 providers
- No instructions or guidance

### Required Changes

#### 1.1 Add Instruction Sections
For each API provider, add an expandable "How to get this key" section:

**Visual Design:**
```
┌─────────────────────────────────────────────────────────────┐
│ OpenAI API Key (GPT-4, DALL-E)                              │
│                                                             │
│ [••••••••••••••••••••] 🔑                                   │
│                                                             │
│ 📚 How to get your OpenAI API key ▼                        │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ Step 1: Go to https://platform.openai.com/api-keys    │ │
│ │ Step 2: Sign in or create an account                  │ │
│ │ Step 3: Click "Create new secret key"                 │ │
│ │ Step 4: Copy the key (you'll only see it once!)       │ │
│ │ Step 5: Paste it above                                │ │
│ │                                                        │ │
│ │ ⏱️  Setup time: ~3 minutes                             │ │
│ │ 💰 Cost: $5 free credit, then pay-as-you-go           │ │
│ │ 🔗 [Open OpenAI Platform →]                            │ │
│ └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### 1.2 Provider Instructions Content

**OpenAI (GPT-4, DALL-E, Whisper)**
- URL: https://platform.openai.com/api-keys
- Steps:
  1. Sign in to OpenAI Platform
  2. Click "Create new secret key"
  3. Name your key (e.g., "Content Cascade")
  4. Copy the key immediately (shown only once)
  5. Paste above and save
- Time: ~3 minutes
- Cost: $5 free credit, then $0.002-0.12 per 1K tokens
- Key format: `sk-...`

**Anthropic (Claude)**
- URL: https://console.anthropic.com/settings/keys
- Steps:
  1. Sign in to Anthropic Console
  2. Navigate to API Keys section
  3. Click "Create Key"
  4. Copy the key
  5. Paste above and save
- Time: ~3 minutes
- Cost: $5 free credit, then $0.25-$15 per million tokens
- Key format: `sk-ant-...`

**Google (Gemini, Imagen)**
- URL: https://aistudio.google.com/app/apikey
- Steps:
  1. Sign in with Google account
  2. Click "Get API key"
  3. Create a new project or select existing
  4. Copy the generated key
  5. Paste above and save
- Time: ~5 minutes
- Cost: Free tier available, then $0.00025-0.00125 per 1K chars
- Key format: `AIza...`

**xAI (Grok)**
- URL: https://console.x.ai/
- Steps:
  1. Sign in with X (Twitter) account
  2. Navigate to API section
  3. Generate API key
  4. Copy the key
  5. Paste above and save
- Time: ~3 minutes
- Cost: Pricing TBD (currently in beta)
- Key format: `xai-...`

**ElevenLabs (Voice Generation)**
- URL: https://elevenlabs.io/api
- Steps:
  1. Sign in to ElevenLabs
  2. Go to Profile Settings
  3. Copy your API key from the API section
  4. Paste above and save
- Time: ~2 minutes
- Cost: 10,000 free characters/month, then $5/month for 30K
- Key format: Standard alphanumeric

**Additional Tools to Add:**
- **Stability AI** (Stable Diffusion) - https://platform.stability.ai/
- **RunwayML** (Video AI) - https://runwayml.com/
- **Midjourney** (requires Discord setup - special instructions)
- **Replicate** (Multiple models) - https://replicate.com/
- **HuggingFace** (Open models) - https://huggingface.co/settings/tokens

#### 1.3 UI Components Needed

**Expandable Instruction Card Component:**
```typescript
interface InstructionCardProps {
  provider: string
  url: string
  steps: string[]
  timeEstimate: string
  costInfo: string
  keyFormat: string
  isExpanded?: boolean
}
```

**Features:**
- Click to expand/collapse (default: collapsed)
- Smooth animation
- "Copy URL" button next to link
- Visual step indicators (1️⃣ 2️⃣ 3️⃣)
- Color-coded badges (⏱️ Setup time, 💰 Cost, 🔑 Key format)

#### 1.4 Additional UX Improvements

1. **Visual Key Validation:**
   - Show ✅ checkmark when key format is correct
   - Show ⚠️ warning for invalid format
   - "Test Connection" button to verify key works

2. **Security Reminders:**
   - Add info box: "🔒 Your API keys are encrypted and stored securely. We never share them."
   - "🚫 Never share your API keys with anyone"

3. **Quick Start Guide:**
   - Add a "Getting Started" section at the top
   - "New to API keys? Start with OpenAI - it's the easiest!"
   - Link to detailed video tutorial (placeholder for now)

---

## 👤 Task 2: Profile Settings Enhancement

### Current State
- File: `app/(portal)/settings/page.tsx`
- Basic fields: Email, Full Name, Company Name

### Required Changes

#### 2.1 Enhanced Profile Fields

**New Layout (Two-Column Grid):**

```
┌─────────────────────────────────────────────────────────────┐
│ Profile Information                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────┐  [Upload Avatar]  [Remove]                │
│ │   Avatar    │                                            │
│ │   Preview   │  Recommended: 400x400px, JPG or PNG        │
│ └─────────────┘                                            │
│                                                             │
│ ┌─────────────────────────┐ ┌─────────────────────────┐   │
│ │ Full Name              │ │ Email                   │   │
│ │ [John Doe............] │ │ [john@example.com.....] │   │
│ └─────────────────────────┘ └─────────────────────────┘   │
│                                                             │
│ ┌─────────────────────────┐ ┌─────────────────────────┐   │
│ │ Company Name           │ │ Website                 │   │
│ │ [Acme Corp...........] │ │ [https://example.com..] │   │
│ └─────────────────────────┘ └─────────────────────────┘   │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Bio / Description (Optional)                           ││
│ │ [Tell us about yourself or your business............. ││
│ │  .................................................... ││
│ │  ....................................................]││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ Company Logo                                                │
│ ┌─────────────┐  [Upload Logo]  [Remove]                  │
│ │   Logo      │                                            │
│ │   Preview   │  Recommended: 200x200px, transparent PNG   │
│ └─────────────┘                                            │
│                                                             │
│ ┌─────────────────────────┐ ┌─────────────────────────┐   │
│ │ Timezone               │ │ Language                │   │
│ │ [▼ America/New_York..] │ │ [▼ English (US).......] │   │
│ └─────────────────────────┘ └─────────────────────────┘   │
│                                                             │
│ Social Media Handles (for auto-posting)                    │
│ ┌─────────────────────────┐ ┌─────────────────────────┐   │
│ │ 🐦 Twitter Handle      │ │ 💼 LinkedIn Profile    │   │
│ │ [@username..........]  │ │ [linkedin.com/in/...]  │   │
│ └─────────────────────────┘ └─────────────────────────┘   │
│                                                             │
│ ┌─────────────────────────┐ ┌─────────────────────────┐   │
│ │ 📘 Facebook Page       │ │ 📸 Instagram Handle    │   │
│ │ [facebook.com/......]  │ │ [@username..........]  │   │
│ └─────────────────────────┘ └─────────────────────────┘   │
│                                                             │
│                                [Cancel]  [Save Changes]     │
└─────────────────────────────────────────────────────────────┘
```

#### 2.2 New Fields to Add

**Backend will provide these fields:**
- `avatar_url` (string) - URL to uploaded image
- `company_logo_url` (string) - URL to uploaded logo
- `bio` (text) - User description
- `website` (string) - Company/personal website
- `timezone` (string) - User timezone
- `language` (string) - Preferred language
- `twitter_handle` (string)
- `linkedin_url` (string)
- `facebook_url` (string)
- `instagram_handle` (string)

**Note:** File uploads will use a placeholder "Upload" button for now. Backend will implement Supabase Storage later.

#### 2.3 UI/UX Details

1. **Avatar/Logo Upload:**
   - Circular preview for avatar
   - Square preview for logo
   - Drag-and-drop support
   - Image size validation (client-side check)
   - Cropping tool (optional - can use library like `react-image-crop`)

2. **Form Validation:**
   - URL validation for website, social links
   - Twitter handle format: @username
   - Character limit on bio (500 chars) with counter
   - Show validation errors inline

3. **Auto-save vs Manual Save:**
   - Manual save with "Save Changes" button
   - Show "Unsaved changes" warning if user tries to leave
   - Success message on save

---

## 🤖 Task 3: AI Tools Management System

### 3.1 AI Tools Selection Page

**New Page:** `app/(portal)/ai-tools/page.tsx`

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│ AI Tools                                                    │
│ Choose which AI tools you want to use for content creation │
│                                                             │
│ [🔍 Search tools...]        [▼ All Categories]             │
│                                                             │
│ ┌─ Text Generation ────────────────────────────────────┐   │
│ │                                                       │   │
│ │ ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │
│ │ │ OpenAI   │  │ Claude   │  │ Gemini   │           │   │
│ │ │  [GPT]   │  │[Anthropic]│  │ [Google] │           │   │
│ │ │          │  │          │  │          │           │   │
│ │ │ 🔑 Setup │  │ ✅ Ready │  │ 🔑 Setup │           │   │
│ │ └──────────┘  └──────────┘  └──────────┘           │   │
│ │                                                       │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─ Image Generation ───────────────────────────────────┐   │
│ │                                                       │   │
│ │ ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │
│ │ │ DALL-E   │  │ Midjourney│ │ Stable   │           │   │
│ │ │ [OpenAI] │  │[Discord] │  │Diffusion │           │   │
│ │ │          │  │          │  │[Stability]│           │   │
│ │ │ ✅ Ready │  │ 🔒 Pro   │  │ 🔑 Setup │           │   │
│ │ └──────────┘  └──────────┘  └──────────┘           │   │
│ │                                                       │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─ Voice & Audio ──────────────────────────────────────┐   │
│ │                                                       │   │
│ │ ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │
│ │ │ElevenLabs│  │ Whisper  │  │  Coqui   │           │   │
│ │ │  [Voice] │  │[Transcribe]│ │  [TTS]   │           │   │
│ │ │          │  │          │  │          │           │   │
│ │ │ 🔑 Setup │  │ ✅ Ready │  │🔒Premium │           │   │
│ │ └──────────┘  └──────────┘  └──────────┘           │   │
│ │                                                       │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─ Video Generation ───────────────────────────────────┐   │
│ │                                                       │   │
│ │ ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │
│ │ │  Sora    │  │ Runway   │  │ Pika Labs│           │   │
│ │ │ [OpenAI] │  │  [ML]    │  │          │           │   │
│ │ │          │  │          │  │          │           │   │
│ │ │🔒Premium │  │ 🔑 Setup │  │ 🔑 Setup │           │   │
│ │ └──────────┘  └──────────┘  └──────────┘           │   │
│ │                                                       │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─ Local AI (Free) ────────────────────────────────────┐   │
│ │                                                       │   │
│ │ ┌──────────┐  ┌──────────┐                          │   │
│ │ │LM Studio │  │ Ollama   │                          │   │
│ │ │ [Local]  │  │ [Local]  │                          │   │
│ │ │          │  │          │                          │   │
│ │ │ ✅ Ready │  │ 🔑 Setup │                          │   │
│ │ └──────────┘  └──────────┘                          │   │
│ │                                                       │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ [+ Add Custom API (Premium)]                                │
└─────────────────────────────────────────────────────────────┘
```

#### 3.2 Tool Card Component

```typescript
interface AIToolCardProps {
  id: string
  name: string
  provider: string
  category: 'text' | 'image' | 'voice' | 'video' | 'local'
  description: string
  logoUrl: string
  status: 'not_configured' | 'configured' | 'locked'
  requiredTier?: 'pro' | 'premium'
  isConfigured: boolean
  onClick: () => void
}
```

**Card States:**

1. **Not Configured (🔑 Setup)**
   - Gray/neutral colors
   - "Setup Required" badge
   - Click → Goes to setup wizard

2. **Configured (✅ Ready)**
   - Green accent
   - "Ready to Use" badge
   - Click → Goes to configuration page

3. **Locked (🔒 Pro/Premium)**
   - Locked overlay
   - "Upgrade to [Tier]" badge
   - Click → Shows upgrade modal

#### 3.3 Tool Categories

**Text Generation:**
- OpenAI (GPT-3.5, GPT-4, GPT-4-Turbo)
- Anthropic (Claude 3 Opus, Sonnet, Haiku)
- Google (Gemini Pro, Ultra)
- xAI (Grok)
- Meta (Llama via Replicate)
- Mistral AI
- Cohere

**Image Generation:**
- OpenAI (DALL-E 3)
- Stability AI (Stable Diffusion)
- Midjourney (Discord integration)
- Google (Imagen)
- Leonardo.ai
- Replicate (various models)

**Voice & Audio:**
- ElevenLabs (Voice cloning, TTS)
- OpenAI (Whisper - transcription)
- Google (Text-to-Speech)
- Coqui TTS
- PlayHT

**Video Generation:**
- OpenAI (Sora - when available)
- RunwayML (Gen-2)
- Pika Labs
- Synthesia (avatar videos)

**Local AI (Always Free):**
- LM Studio ✅ (already configured)
- Ollama
- GPT4All
- LocalAI

### 3.4 AI Tool Setup Wizard

**New Page:** `app/(portal)/ai-tools/[provider]/setup/page.tsx`

**4-Step Wizard Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to AI Tools                                          │
│                                                             │
│ Setup: OpenAI (GPT-4, DALL-E)                              │
│                                                             │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│ ● ━━━━━━━━ ○ ━━━━━━━━ ○ ━━━━━━━━ ○                       │
│ Overview   API Key   Test      Configure                    │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ STEP 1: Overview                                      │  │
│ │                                                       │  │
│ │ What is OpenAI?                                       │  │
│ │ OpenAI provides state-of-the-art AI models including │  │
│ │ GPT-4 for text generation and DALL-E for images.     │  │
│ │                                                       │  │
│ │ Capabilities:                                         │  │
│ │ ✅ Text content generation                            │  │
│ │ ✅ Image creation (DALL-E 3)                          │  │
│ │ ✅ Code generation                                    │  │
│ │ ✅ Audio transcription (Whisper)                      │  │
│ │                                                       │  │
│ │ Pricing:                                              │  │
│ │ • $5 free credit for new accounts                    │  │
│ │ • GPT-4: $0.03 per 1K input tokens                   │  │
│ │ • DALL-E 3: $0.04 per image (1024x1024)              │  │
│ │                                                       │  │
│ │ Estimated monthly cost for typical usage: $20-$50    │  │
│ │                                                       │  │
│ │                              [Next: Get API Key →]    │  │
│ └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Step 2: API Key** (reuse instruction card from Settings)

**Step 3: Test Connection**
```
┌───────────────────────────────────────────────────────┐
│ STEP 3: Test Connection                               │
│                                                       │
│ Let's verify your API key works correctly.           │
│                                                       │
│ [Test Connection]                                     │
│                                                       │
│ Status: Testing...                                    │
│ ┌─────────────────────────────────────────────────┐  │
│ │ ✓ API key format valid                          │  │
│ │ ✓ Connection established                        │  │
│ │ ✓ Successfully called GPT-4                     │  │
│ │ ✓ Rate limits checked                           │  │
│ └─────────────────────────────────────────────────┘  │
│                                                       │
│                              [Next: Configure →]      │
└───────────────────────────────────────────────────────┘
```

**Step 4: Configuration**
```
┌───────────────────────────────────────────────────────┐
│ STEP 4: Configure                                     │
│                                                       │
│ Default Model for Text Generation:                   │
│ [▼ GPT-4-Turbo (Recommended)          ]              │
│                                                       │
│ Image Generation Model:                               │
│ [▼ DALL-E 3 (Best quality)            ]              │
│                                                       │
│ Temperature (Creativity):                             │
│ [━━━━━━●━━━━━━━] 0.7                                 │
│ Lower = More focused, Higher = More creative          │
│                                                       │
│ Max Tokens per Request:                               │
│ [━━━━━━━━━●━━━] 2000                                 │
│                                                       │
│ ☑ Use for campaign content generation                │
│ ☑ Use for image generation                           │
│ ☐ Set as default AI provider                         │
│                                                       │
│                    [Cancel]  [Save & Finish]          │
└───────────────────────────────────────────────────────┘
```

### 3.5 Add AI Tools to Onboarding

**File:** `app/(portal)/onboarding/page.tsx`

**Add Step 3 (between current Step 2 and completion):**

```
┌─────────────────────────────────────────────────────────────┐
│ Step 3 of 3: Choose Your AI Tools                          │
│                                                             │
│ Select the AI tools you want to use (you can add more      │
│ later in Settings)                                          │
│                                                             │
│ 🌟 Recommended to Get Started:                             │
│                                                             │
│ ┌──────────────────┐  ┌──────────────────┐                │
│ │ ✅ LM Studio     │  │   OpenAI (GPT-4) │                │
│ │    (Free, Local) │  │   [Setup →]      │                │
│ │    Already Ready │  │   Recommended    │                │
│ └──────────────────┘  └──────────────────┘                │
│                                                             │
│ ┌──────────────────┐  ┌──────────────────┐                │
│ │  Claude (Anthropic)│  │  Google Gemini  │                │
│ │  [Setup →]       │  │  [Setup →]       │                │
│ └──────────────────┘  └──────────────────┘                │
│                                                             │
│ 💡 Tip: Start with LM Studio (free) and add paid tools     │
│    as you need more advanced features                      │
│                                                             │
│              [Skip for Now]     [Continue to Dashboard]    │
└─────────────────────────────────────────────────────────────┘
```

**Interaction Flow:**
1. User clicks "Setup →" on any tool
2. Opens setup wizard in a modal/slide-over (not full page redirect)
3. After setup, card updates to "✅ Configured"
4. User can setup multiple tools or skip
5. "Continue to Dashboard" becomes enabled after viewing the step

---

## 💳 Task 4: Membership Page Redesign

### Current State
- File: `app/(portal)/settings/page.tsx` (Membership tab)
- Basic plan cards with pricing

### Required Changes

#### 4.1 Visual Pricing Comparison

**New Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│ Membership & Billing                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Current Plan: Free Tier                        [Active]     │
│ Next billing date: N/A                                      │
│                                                             │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                             │
│         FREE          PRO            PREMIUM                │
│     ┌──────────┐  ┌──────────┐   ┌──────────┐             │
│     │   $0     │  │   $29    │   │   $99    │             │
│     │  /month  │  │  /month  │   │  /month  │             │
│     │          │  │          │   │          │             │
│     │ ✓ Current│  │ Upgrade →│   │ Upgrade →│             │
│     └──────────┘  └──────────┘   └──────────┘             │
│                                                             │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                             │
│ Feature Comparison:                                         │
│                                                             │
│                          FREE    PRO      PREMIUM           │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│ Campaigns per month       5       ∞         ∞              │
│ Social platforms          3       All       All            │
│ Team members              1       5         Unlimited      │
│ AI Tools                  1*      3         Unlimited      │
│ Content storage         100MB     10GB      100GB          │
│ Analytics history       7 days    1 year    Unlimited      │
│ API access               -        ✓         ✓              │
│ White-label              -        -         ✓              │
│ Custom AI training       -        -         ✓              │
│ Priority support         -        ✓         ✓              │
│ Dedicated manager        -        -         ✓              │
│                                                             │
│ *Free tier includes LM Studio (local AI) only              │
│                                                             │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                             │
│ AI Tools by Tier:                                           │
│                                                             │
│ FREE TIER (1 tool):                                         │
│ • LM Studio (Local) - No API costs!                        │
│                                                             │
│ PRO TIER (Up to 3 tools):                                   │
│ • All Free tier tools                                       │
│ • Choose any 3: OpenAI, Claude, Gemini, DALL-E,            │
│   Stable Diffusion, ElevenLabs, etc.                       │
│                                                             │
│ PREMIUM TIER (Unlimited):                                   │
│ • All AI tools available                                    │
│ • Bring Your Own API (BYOA) - Use any OpenAI-compatible    │
│   API endpoint                                              │
│ • Custom model fine-tuning                                  │
│ • Priority API rate limits                                  │
│                                                             │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                             │
│ 📊 Your Usage This Month:                                  │
│                                                             │
│ Campaigns created:        0 / 5                            │
│ AI API calls:             0                                │
│ Estimated AI costs saved: $0                               │
│ (by using LM Studio local AI)                              │
│                                                             │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                             │
│ 💡 Special Offer:                                          │
│ Upgrade to Pro now and get 20% off your first 3 months!    │
│                                                [Claim Offer]│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 4.2 Upgrade Modal

When user clicks "Upgrade →":

```
┌─────────────────────────────────────────────────────────────┐
│ Upgrade to Pro                                         [×]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ You're upgrading to:                                        │
│                                                             │
│     PRO PLAN                                                │
│     $29/month                                               │
│                                                             │
│ What you'll get:                                            │
│ ✓ Unlimited campaigns                                       │
│ ✓ All social platforms                                      │
│ ✓ Up to 3 AI tools of your choice                          │
│ ✓ 10GB content storage                                      │
│ ✓ 1 year analytics history                                  │
│ ✓ Priority support                                          │
│                                                             │
│ Billing:                                                    │
│ • First payment: $29 (charged today)                       │
│ • Renews: Monthly on the 4th                               │
│ • Cancel anytime (no commitment)                            │
│                                                             │
│ Payment method:                                             │
│ [💳 Add Credit Card]                                        │
│                                                             │
│ ☐ I agree to the Terms of Service                          │
│                                                             │
│              [Cancel]     [Confirm & Pay $29]               │
│                                                             │
│ 🔒 Secure payment powered by Stripe                         │
└─────────────────────────────────────────────────────────────┘
```

#### 4.3 Interactive Elements

1. **Tier Toggle:**
   - Add Monthly/Yearly toggle at top
   - Yearly: Show "Save 20%" badge
   - Update pricing dynamically

2. **Feature Tooltips:**
   - Hover over features to see detailed explanations
   - "What's white-label?" → "Remove Content Cascade branding"

3. **Usage Meters:**
   - Visual progress bars for current usage
   - Color coding: Green (< 50%), Yellow (50-80%), Red (> 80%)

4. **AI Cost Calculator:**
   - Interactive calculator: "How much would my campaigns cost with paid APIs?"
   - Shows savings with LM Studio vs OpenAI

---

## 🎨 Design System

### Colors
- Primary: `#4F46E5` (Indigo 600)
- Success: `#10B981` (Green 500)
- Warning: `#F59E0B` (Amber 500)
- Error: `#EF4444` (Red 500)
- Premium: `#8B5CF6` (Purple 500)

### Typography
- Headings: `font-bold`
- Body: `font-normal`
- Buttons: `font-semibold`

### Spacing
- Section padding: `p-6` or `p-8`
- Card spacing: `space-y-4` or `space-y-6`
- Grid gaps: `gap-4` or `gap-6`

### Components
- Cards: `rounded-xl border border-gray-200`
- Buttons: `rounded-lg px-6 py-3`
- Inputs: `rounded-lg px-4 py-3 border border-gray-300`

---

## 📦 Component Structure

### Shared Components to Create

1. **`components/InstructionCard.tsx`**
   - Expandable instruction sections
   - Reusable across API Keys and AI Setup

2. **`components/AIToolCard.tsx`**
   - Tool cards with status badges
   - Click handlers for setup/configure

3. **`components/PricingCard.tsx`**
   - Pricing comparison cards
   - Upgrade CTAs

4. **`components/UpgradeModal.tsx`**
   - Stripe checkout modal
   - Terms acceptance

5. **`components/UsageMeter.tsx`**
   - Progress bars for usage limits
   - Color-coded warnings

---

## 🔗 Integration Points (Backend)

ZenCoder components will connect to these APIs (Claude is building):

### API Endpoints

**AI Tools:**
- `GET /api/ai-tools/list` - Get available tools + user's configured tools
- `POST /api/ai-tools/configure` - Save tool configuration
- `POST /api/ai-tools/test` - Test API key validity
- `DELETE /api/ai-tools/[id]` - Remove tool

**Profile:**
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `POST /api/profile/avatar` - Upload avatar (Supabase Storage)

**Membership:**
- `POST /api/stripe/checkout` - Create checkout session
- `POST /api/stripe/portal` - Get customer portal URL
- `GET /api/usage` - Get current usage stats

### Data Types

**AITool:**
```typescript
interface AITool {
  id: string
  name: string
  provider: string
  category: 'text' | 'image' | 'voice' | 'video' | 'local'
  logoUrl: string
  description: string
  setupInstructions: {
    url: string
    steps: string[]
    timeEstimate: string
    costInfo: string
    keyFormat: string
  }
  requiredTier?: 'pro' | 'premium'
  isConfigured: boolean
  config?: {
    apiKey?: string  // Never sent to frontend (encrypted)
    model?: string
    temperature?: number
    maxTokens?: number
  }
}
```

**UserProfile:**
```typescript
interface UserProfile {
  id: string
  email: string
  full_name?: string
  company_name?: string
  avatar_url?: string
  company_logo_url?: string
  bio?: string
  website?: string
  timezone?: string
  language?: string
  twitter_handle?: string
  linkedin_url?: string
  facebook_url?: string
  instagram_handle?: string
  subscription_tier: 'free' | 'pro' | 'premium'
}
```

**Usage:**
```typescript
interface Usage {
  campaignsUsed: number
  campaignsLimit: number
  aiToolsUsed: number
  aiToolsLimit: number
  storageUsed: number  // bytes
  storageLimit: number  // bytes
  apiCallsThisMonth: number
  estimatedCostSaved: number  // USD
}
```

---

## ✅ Acceptance Criteria

### API Keys Settings
- [ ] All 5 current providers have instruction cards
- [ ] Instructions are expandable/collapsible
- [ ] Each provider has: URL, steps, time, cost, key format
- [ ] "Copy URL" buttons work
- [ ] Key format validation shows visual feedback
- [ ] Security reminder is visible

### Profile Settings
- [ ] Avatar upload UI (functional upload comes later)
- [ ] All new fields are present and styled
- [ ] Two-column responsive layout
- [ ] Form validation for URLs and handles
- [ ] Character counter on bio field
- [ ] Save button works with backend API

### AI Tools
- [ ] Tools page shows all categories
- [ ] Tool cards show correct status badges
- [ ] Locked tools show upgrade prompt
- [ ] Setup wizard has all 4 steps
- [ ] Test connection shows loading state
- [ ] Configuration saves successfully
- [ ] Onboarding includes AI tools step

### Membership
- [ ] Pricing comparison table is clear
- [ ] Feature differences are highlighted
- [ ] Current tier is indicated
- [ ] Usage meters show progress
- [ ] Upgrade modal has Stripe placeholder
- [ ] Monthly/Yearly toggle works (UI only for now)

---

## 📝 Notes for ZenCoder

1. **File Upload Placeholders:**
   - For now, just create the UI for avatar/logo upload
   - Backend will implement Supabase Storage later
   - Use a `<input type="file">` with styling

2. **Stripe Integration:**
   - Backend will provide Stripe Checkout redirect URL
   - Just create the modal UI and "Confirm & Pay" button
   - Backend handles actual payment processing

3. **AI Tool Logos:**
   - Use placeholders or emoji for now:
     - OpenAI: 🤖
     - Claude: 🧠
     - Gemini: ✨
     - DALL-E: 🎨
     - etc.
   - Backend will provide real logo URLs later

4. **Responsive Design:**
   - Mobile-first approach
   - Tool cards: 1 column on mobile, 2-3 on tablet, 3-4 on desktop
   - Pricing cards: Stack vertically on mobile

5. **Accessibility:**
   - Proper ARIA labels for buttons
   - Keyboard navigation support
   - Color contrast ratios meet WCAG AA
   - Form validation announces to screen readers

---

## 🚀 Getting Started

1. **Review this document** - Understand all requirements
2. **Create component files** - Start with shared components
3. **Build UI incrementally** - Test each section as you go
4. **Use mock data** - Don't wait for backend APIs
5. **Mobile test early** - Check responsive behavior often

---

## 📞 Questions?

If anything is unclear:
1. Check the existing codebase patterns
2. Reference the design system above
3. Ask for clarification if needed

Backend APIs will be ready for integration once UI is complete. Focus on creating beautiful, user-friendly interfaces!

---

## 🎨 Complete Design System & Component Specifications

### Color Palette & Design Tokens

**Primary Colors:**
```css
:root {
  /* Brand Colors */
  --brand-primary: #0066ff;    /* Content Cascade Blue */
  --brand-secondary: #6c7ee3;  /* Accent Purple */
  --brand-tertiary: #00d4aa;   /* Success Green */
  
  /* Status Colors */
  --status-success: #16a34a;   /* Setup Complete */
  --status-warning: #f59e0b;   /* Setup Needed */
  --status-error: #dc2626;     /* Setup Failed */
  --status-info: #3b82f6;      /* Information */
  --status-locked: #6b7280;    /* Tier Locked */
  
  /* Tier Colors */
  --tier-free: #10b981;        /* Free Tier */
  --tier-pro: #3b82f6;         /* Pro Tier */
  --tier-premium: #8b5cf6;     /* Premium Tier */
  
  /* Neutral Colors */
  --neutral-50: #fafafa;
  --neutral-100: #f5f5f5;
  --neutral-200: #e5e5e5;
  --neutral-300: #d4d4d4;
  --neutral-400: #a3a3a3;
  --neutral-500: #737373;
  --neutral-600: #525252;
  --neutral-700: #404040;
  --neutral-800: #262626;
  --neutral-900: #171717;
}
```

**Typography System:**
```css
/* Headings */
.heading-xl { font-size: 2.5rem; font-weight: 800; line-height: 1.2; }
.heading-lg { font-size: 2rem; font-weight: 700; line-height: 1.3; }
.heading-md { font-size: 1.5rem; font-weight: 600; line-height: 1.4; }
.heading-sm { font-size: 1.25rem; font-weight: 600; line-height: 1.4; }

/* Body Text */
.text-lg { font-size: 1.125rem; font-weight: 400; line-height: 1.6; }
.text-base { font-size: 1rem; font-weight: 400; line-height: 1.6; }
.text-sm { font-size: 0.875rem; font-weight: 400; line-height: 1.5; }
.text-xs { font-size: 0.75rem; font-weight: 400; line-height: 1.4; }

/* Special */
.text-caption { font-size: 0.75rem; font-weight: 500; line-height: 1.4; color: var(--neutral-600); }
.text-label { font-size: 0.875rem; font-weight: 500; line-height: 1.4; }
```

**Spacing System:**
```css
/* Spacing Scale (rem units) */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

**Shadow System:**
```css
/* Elevation Shadows */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
```

### Core Component Specifications

#### AI Tool Card Component
```typescript
interface AIToolCardProps {
  provider: {
    id: string;
    name: string;
    category: 'text' | 'image' | 'voice' | 'video' | 'local';
    description: string;
    logoUrl: string;
    requiredTier: 'free' | 'pro' | 'premium';
    setupUrl: string;
  };
  userStatus: {
    isConfigured: boolean;
    isActive: boolean;
    testStatus: 'success' | 'failed' | 'pending' | null;
  };
  userTier: 'free' | 'pro' | 'premium';
  onSetup: () => void;
  onConfigure: () => void;
  onToggle: (active: boolean) => void;
}

// Usage Example
<AIToolCard
  provider={openAIProvider}
  userStatus={{ isConfigured: true, isActive: true, testStatus: 'success' }}
  userTier="pro"
  onSetup={() => openSetupWizard('openai')}
  onConfigure={() => openConfiguration('openai')}
  onToggle={(active) => toggleTool('openai', active)}
/>
```

**Visual States:**
- **Not Configured:** Gray background, "Setup" button, provider logo grayed out
- **Configured & Active:** Green border, ✅ badge, "Configure" button
- **Configured & Inactive:** Orange border, ⏸️ badge, "Configure" button  
- **Tier Locked:** Purple border, 🔒 badge, "Upgrade" button

#### Setup Wizard Component
```typescript
interface SetupWizardProps {
  providerId: string;
  provider: AIProvider;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (config: AIToolConfig) => void;
}

interface SetupWizardState {
  currentStep: number; // 0-3 (Overview, API Key, Test, Configure)
  apiKey: string;
  configuration: Record<string, any>;
  testResults: {
    status: 'idle' | 'testing' | 'success' | 'failed';
    error?: string;
  };
}
```

**Step Flow:**
1. **Overview** - Provider info, requirements, cost estimation
2. **API Key** - Instructions + secure input field
3. **Test** - Verify connection with simple test call
4. **Configure** - Model selection, parameters, preferences

#### Profile Form Component
```typescript
interface ProfileFormProps {
  initialData: UserProfile;
  onSave: (data: UserProfile) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  companyName: string;
  avatarUrl?: string;
  companyLogoUrl?: string;
  bio?: string;
  website?: string;
  timezone: string;
  language: string;
  socialHandles: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
}
```

---

## 📊 Complete Mock Data Structures

### AI Providers Catalog Data
```typescript
const mockAIProviders: AIProvider[] = [
  // Text Generation
  {
    id: 'openai-gpt',
    name: 'OpenAI GPT',
    providerKey: 'openai',
    category: 'text',
    description: 'GPT-4, GPT-3.5 for advanced text generation and conversation',
    logoUrl: '/logos/openai.svg',
    setupUrl: 'https://platform.openai.com/api-keys',
    setupInstructions: {
      steps: [
        'Sign in to OpenAI Platform',
        'Click "Create new secret key"',
        'Name your key (e.g., "Content Cascade")',
        'Copy the key immediately (shown only once)',
        'Paste above and save'
      ],
      timeEstimate: '~3 minutes',
      costInfo: '$5 free credit, then $0.002-0.12 per 1K tokens',
      keyFormat: 'sk-...'
    },
    requiredTier: 'free',
    isActive: true,
    configSchema: {
      model: {
        type: 'select',
        options: ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
        default: 'gpt-4-turbo',
        label: 'Model'
      },
      temperature: {
        type: 'slider',
        min: 0,
        max: 2,
        step: 0.1,
        default: 0.7,
        label: 'Creativity (Temperature)'
      },
      maxTokens: {
        type: 'number',
        min: 100,
        max: 4000,
        default: 2000,
        label: 'Max Response Length'
      }
    }
  },
  {
    id: 'anthropic-claude',
    name: 'Anthropic Claude',
    providerKey: 'anthropic',
    category: 'text',
    description: 'Claude 3 Opus, Sonnet, Haiku for thoughtful AI assistance',
    logoUrl: '/logos/anthropic.svg',
    setupUrl: 'https://console.anthropic.com/settings/keys',
    setupInstructions: {
      steps: [
        'Sign in to Anthropic Console',
        'Navigate to API Keys section',
        'Click "Create Key"',
        'Copy the key',
        'Paste above and save'
      ],
      timeEstimate: '~3 minutes',
      costInfo: '$5 free credit, then $0.25-$15 per million tokens',
      keyFormat: 'sk-ant-...'
    },
    requiredTier: 'pro',
    isActive: true,
    configSchema: {
      model: {
        type: 'select',
        options: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
        default: 'claude-3-sonnet',
        label: 'Model'
      },
      temperature: {
        type: 'slider',
        min: 0,
        max: 1,
        step: 0.1,
        default: 0.7,
        label: 'Creativity (Temperature)'
      }
    }
  },
  // Image Generation
  {
    id: 'dalle-3',
    name: 'DALL-E 3',
    providerKey: 'dalle',
    category: 'image',
    description: 'OpenAI DALL-E 3 for high-quality image generation',
    logoUrl: '/logos/dalle.svg',
    setupUrl: 'https://platform.openai.com/api-keys',
    setupInstructions: {
      steps: [
        'Same as OpenAI GPT setup',
        'Uses the same API key',
        'No additional setup needed'
      ],
      timeEstimate: '~3 minutes',
      costInfo: '$0.04-0.12 per image generated',
      keyFormat: 'sk-...'
    },
    requiredTier: 'pro',
    isActive: true,
    configSchema: {
      size: {
        type: 'select',
        options: ['1024x1024', '1792x1024', '1024x1792'],
        default: '1024x1024',
        label: 'Image Size'
      },
      quality: {
        type: 'select',
        options: ['standard', 'hd'],
        default: 'standard',
        label: 'Image Quality'
      }
    }
  },
  // Voice Generation
  {
    id: 'elevenlabs-voice',
    name: 'ElevenLabs',
    providerKey: 'elevenlabs',
    category: 'voice',
    description: 'High-quality voice generation and cloning',
    logoUrl: '/logos/elevenlabs.svg',
    setupUrl: 'https://elevenlabs.io/api',
    setupInstructions: {
      steps: [
        'Sign in to ElevenLabs',
        'Go to Profile Settings',
        'Copy your API key from the API section',
        'Paste above and save'
      ],
      timeEstimate: '~2 minutes',
      costInfo: '10,000 free characters/month, then $5/month for 30K',
      keyFormat: 'Standard alphanumeric'
    },
    requiredTier: 'pro',
    isActive: true,
    configSchema: {
      voice: {
        type: 'select',
        options: ['rachel', 'adam', 'domi', 'bella', 'antonio'],
        default: 'rachel',
        label: 'Voice Model'
      },
      stability: {
        type: 'slider',
        min: 0,
        max: 1,
        step: 0.1,
        default: 0.5,
        label: 'Voice Stability'
      }
    }
  },
  // Local/Free Option
  {
    id: 'lm-studio',
    name: 'LM Studio (Local)',
    providerKey: 'lmstudio',
    category: 'local',
    description: 'Local AI models running on your hardware - 100% free',
    logoUrl: '/logos/lmstudio.svg',
    setupUrl: 'http://10.10.10.105:1234',
    setupInstructions: {
      steps: [
        'Already configured!',
        'LM Studio is running locally',
        'No API key needed',
        'Uses local models only'
      ],
      timeEstimate: '0 minutes',
      costInfo: '100% Free - runs on your hardware',
      keyFormat: 'N/A'
    },
    requiredTier: 'free',
    isActive: true,
    configSchema: {
      endpoint: {
        type: 'text',
        default: 'http://10.10.10.105:1234',
        label: 'Local Endpoint'
      }
    }
  }
];
```

### User Configuration Data
```typescript
const mockUserProfile: UserProfile = {
  id: 'user-123',
  email: 'john@contentcascade.com',
  fullName: 'John Doe',
  companyName: 'Content Cascade AI',
  avatarUrl: '/avatars/john-doe.jpg',
  companyLogoUrl: '/logos/content-cascade.svg',
  bio: 'Digital marketing professional specializing in AI-powered content creation and automation.',
  website: 'https://contentcascade.com',
  timezone: 'America/New_York',
  language: 'en-US',
  socialHandles: {
    twitter: '@johndoe',
    linkedin: 'https://linkedin.com/in/johndoe',
    facebook: 'https://facebook.com/contentcascade',
    instagram: '@contentcascade'
  },
  subscription: {
    tier: 'pro',
    status: 'active',
    periodEnd: '2025-02-17T00:00:00Z',
    aiToolsLimit: 5,
    monthlyCredits: 10000,
    creditsUsed: 2450
  }
};

const mockUserAITools: UserAITool[] = [
  {
    id: 'user-tool-1',
    providerId: 'openai-gpt',
    isActive: true,
    isConfigured: true,
    configuration: {
      model: 'gpt-4-turbo',
      temperature: 0.7,
      maxTokens: 2000
    },
    testStatus: 'success',
    lastTestedAt: '2025-01-17T10:30:00Z',
    usageCount: 145,
    estimatedMonthlyCost: 23.45
  },
  {
    id: 'user-tool-2',
    providerId: 'dalle-3',
    isActive: true,
    isConfigured: true,
    configuration: {
      size: '1024x1024',
      quality: 'standard'
    },
    testStatus: 'success',
    lastTestedAt: '2025-01-17T09:15:00Z',
    usageCount: 28,
    estimatedMonthlyCost: 11.20
  },
  {
    id: 'user-tool-3',
    providerId: 'anthropic-claude',
    isActive: false,
    isConfigured: true,
    configuration: {
      model: 'claude-3-sonnet',
      temperature: 0.8
    },
    testStatus: 'failed',
    lastTestedAt: '2025-01-16T14:22:00Z',
    usageCount: 0,
    estimatedMonthlyCost: 0
  }
];
```

### Membership Plans Data
```typescript
const mockMembershipPlans: MembershipPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    billingPeriod: 'month',
    description: 'Perfect for getting started with AI content creation',
    features: [
      '1 AI tool connection',
      '100 monthly AI credits',
      'Basic templates',
      'Community support',
      '5 campaigns per month'
    ],
    limits: {
      aiTools: 1,
      monthlyCredits: 100,
      campaigns: 5,
      teamMembers: 1
    },
    isPopular: false,
    buttonText: 'Current Plan',
    buttonVariant: 'secondary'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    billingPeriod: 'month',
    description: 'Scale your content creation with powerful AI tools',
    features: [
      '5 AI tool connections',
      '10,000 monthly AI credits',
      'Advanced templates',
      'Priority support',
      'Unlimited campaigns',
      'Analytics & insights',
      'API access'
    ],
    limits: {
      aiTools: 5,
      monthlyCredits: 10000,
      campaigns: -1, // unlimited
      teamMembers: 3
    },
    isPopular: true,
    buttonText: 'Upgrade to Pro',
    buttonVariant: 'primary'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 99,
    billingPeriod: 'month',
    description: 'Enterprise-grade features for large-scale content operations',
    features: [
      'Unlimited AI tool connections',
      '50,000 monthly AI credits',
      'Custom templates',
      'Dedicated support',
      'White-label options',
      'Advanced analytics',
      'Custom integrations',
      'Priority processing'
    ],
    limits: {
      aiTools: -1, // unlimited
      monthlyCredits: 50000,
      campaigns: -1, // unlimited
      teamMembers: 10
    },
    isPopular: false,
    buttonText: 'Upgrade to Premium',
    buttonVariant: 'premium'
  }
];
```

---

## ♿ Complete Accessibility Compliance

### WCAG 2.1 AA Standards Implementation

#### Color Accessibility
```css
/* Ensure minimum contrast ratios */
.text-primary { color: #171717; } /* 21:1 contrast on white */
.text-secondary { color: #404040; } /* 10.7:1 contrast on white */
.text-muted { color: #525252; } /* 7:1 contrast on white */

/* Status colors with accessibility in mind */
.status-success { 
  color: #166534; 
  background: #dcfce7; 
  border: 2px solid #16a34a;
}
.status-warning { 
  color: #92400e; 
  background: #fef3c7; 
  border: 2px solid #f59e0b;
}
.status-error { 
  color: #991b1b; 
  background: #fee2e2; 
  border: 2px solid #dc2626;
}
```

#### Focus Management
```css
/* Visible focus indicators */
.focus-ring:focus {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(0, 102, 255, 0.1);
}

/* Skip navigation for keyboard users */
.skip-nav {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--brand-primary);
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 9999;
}
.skip-nav:focus {
  top: 6px;
}
```

#### ARIA Implementation
```typescript
// AI Tool Card Accessibility
const AIToolCard: React.FC<AIToolCardProps> = ({ provider, userStatus, onSetup }) => {
  return (
    <div
      role="article"
      aria-labelledby={`tool-${provider.id}-name`}
      aria-describedby={`tool-${provider.id}-status`}
      className="ai-tool-card"
    >
      <h3 id={`tool-${provider.id}-name`}>{provider.name}</h3>
      <p id={`tool-${provider.id}-status`} aria-live="polite">
        Status: {userStatus.isConfigured ? 'Configured' : 'Needs setup'}
      </p>
      <button
        onClick={onSetup}
        aria-describedby={`tool-${provider.id}-description`}
        className="setup-button focus-ring"
      >
        {userStatus.isConfigured ? 'Configure' : 'Setup'}
      </button>
    </div>
  );
};

// Setup Wizard Accessibility  
const SetupWizard: React.FC<SetupWizardProps> = ({ isOpen, currentStep, totalSteps }) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizard-title"
      aria-describedby="wizard-description"
    >
      <h2 id="wizard-title">AI Tool Setup</h2>
      <p id="wizard-description">
        Step {currentStep + 1} of {totalSteps}: Setting up your AI tool
      </p>
      <div role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={totalSteps}>
        Progress: {Math.round(((currentStep + 1) / totalSteps) * 100)}%
      </div>
      {/* Step content */}
    </div>
  );
};

// Form Field Accessibility
const FormField: React.FC<FormFieldProps> = ({ id, label, error, required, children }) => {
  const errorId = error ? `${id}-error` : undefined;
  
  return (
    <div className="form-field">
      <label htmlFor={id} className={required ? 'required' : ''}>
        {label}
        {required && <span aria-label="required">*</span>}
      </label>
      <div aria-describedby={errorId}>
        {children}
      </div>
      {error && (
        <div id={errorId} role="alert" className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};
```

#### Keyboard Navigation
```typescript
// Custom hook for keyboard navigation
const useKeyboardNavigation = (items: string[], onSelect: (id: string) => void) => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setActiveIndex((prev) => (prev + 1) % items.length);
          break;
        case 'ArrowUp':
          event.preventDefault();
          setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          onSelect(items[activeIndex]);
          break;
        case 'Escape':
          // Close any open modals/dropdowns
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, items, onSelect]);
  
  return { activeIndex, setActiveIndex };
};

// Usage in AI Tools Grid
const AIToolsGrid: React.FC = () => {
  const toolIds = providers.map(p => p.id);
  const { activeIndex } = useKeyboardNavigation(toolIds, (id) => {
    // Handle selection
  });
  
  return (
    <div role="grid" aria-label="Available AI tools">
      {providers.map((provider, index) => (
        <AIToolCard
          key={provider.id}
          provider={provider}
          tabIndex={index === activeIndex ? 0 : -1}
          aria-posinset={index + 1}
          aria-setsize={providers.length}
        />
      ))}
    </div>
  );
};
```

#### Screen Reader Support
```typescript
// Live region announcements
const useAnnouncements = () => {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);
  
  return { announce };
};

// Usage examples
const { announce } = useAnnouncements();

// On successful AI tool setup
announce('AI tool setup completed successfully', 'assertive');

// On navigation change
announce(`Navigated to ${pageName}`, 'polite');

// On error
announce(`Error: ${errorMessage}`, 'assertive');
```

### Mobile Accessibility Features
```css
/* Touch target sizes (minimum 44px) */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: var(--space-3);
}

/* Improved mobile form controls */
.mobile-input {
  font-size: 16px; /* Prevents zoom on iOS */
  padding: var(--space-4);
  border: 2px solid var(--neutral-200);
  border-radius: var(--radius-md);
}

.mobile-input:focus {
  border-color: var(--brand-primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
}

/* Responsive text scaling */
@media (prefers-reduced-motion: no-preference) {
  html {
    scroll-behavior: smooth;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 📱 Responsive Design Specifications

### Breakpoint System
```css
/* Mobile-first breakpoints */
:root {
  --bp-sm: 640px;   /* Small tablets */
  --bp-md: 768px;   /* Tablets */
  --bp-lg: 1024px;  /* Small desktops */
  --bp-xl: 1280px;  /* Large desktops */
  --bp-2xl: 1536px; /* Extra large screens */
}
```

### Layout Specifications
```css
/* Container system */
.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

@media (min-width: 640px) {
  .container { padding: 0 var(--space-6); }
}

@media (min-width: 1024px) {
  .container { padding: 0 var(--space-8); }
}

/* Grid system for AI tools */
.ai-tools-grid {
  display: grid;
  gap: var(--space-6);
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .ai-tools-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .ai-tools-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .ai-tools-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Profile form responsive layout */
.profile-form {
  display: grid;
  gap: var(--space-6);
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .profile-form {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .profile-form .full-width {
    grid-column: 1 / -1;
  }
}

/* Setup wizard responsive */
.setup-wizard {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

@media (max-width: 640px) {
  .setup-wizard {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  .wizard-content {
    flex: 1;
    overflow-y: auto;
  }
  
  .wizard-actions {
    padding: var(--space-4);
    border-top: 1px solid var(--neutral-200);
  }
}
```

---

## 🧪 Testing Specifications

### Component Testing Strategy
```typescript
// AI Tool Card Tests
describe('AIToolCard', () => {
  it('renders provider information correctly', () => {
    render(<AIToolCard provider={mockProvider} userStatus={mockStatus} />);
    expect(screen.getByText(mockProvider.name)).toBeInTheDocument();
    expect(screen.getByText(mockProvider.description)).toBeInTheDocument();
  });
  
  it('shows correct status badge', () => {
    const configuredStatus = { isConfigured: true, isActive: true, testStatus: 'success' };
    render(<AIToolCard provider={mockProvider} userStatus={configuredStatus} />);
    expect(screen.getByText('✅')).toBeInTheDocument();
  });
  
  it('handles tier restrictions', () => {
    const premiumProvider = { ...mockProvider, requiredTier: 'premium' };
    render(<AIToolCard provider={premiumProvider} userTier="free" />);
    expect(screen.getByText('🔒')).toBeInTheDocument();
    expect(screen.getByText('Upgrade')).toBeInTheDocument();
  });
  
  it('supports keyboard navigation', () => {
    render(<AIToolCard provider={mockProvider} userStatus={mockStatus} />);
    const setupButton = screen.getByRole('button', { name: /setup/i });
    setupButton.focus();
    expect(setupButton).toHaveFocus();
    
    fireEvent.keyDown(setupButton, { key: 'Enter' });
    // Assert setup function was called
  });
});

// Setup Wizard Tests
describe('SetupWizard', () => {
  it('progresses through all steps', async () => {
    const user = userEvent.setup();
    render(<SetupWizard providerId="openai" isOpen={true} />);
    
    // Step 1: Overview
    expect(screen.getByText(/step 1 of 4/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /continue/i }));
    
    // Step 2: API Key
    expect(screen.getByText(/step 2 of 4/i)).toBeInTheDocument();
    await user.type(screen.getByLabelText(/api key/i), 'sk-test-key');
    await user.click(screen.getByRole('button', { name: /continue/i }));
    
    // Step 3: Test
    expect(screen.getByText(/step 3 of 4/i)).toBeInTheDocument();
    // Mock API test success
    await waitFor(() => {
      expect(screen.getByText(/test successful/i)).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /continue/i }));
    
    // Step 4: Configure
    expect(screen.getByText(/step 4 of 4/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /complete setup/i }));
    
    // Verify completion
    expect(screen.getByText(/setup complete/i)).toBeInTheDocument();
  });
  
  it('handles API key validation', async () => {
    const user = userEvent.setup();
    render(<SetupWizard providerId="openai" isOpen={true} />);
    
    // Navigate to API key step
    await user.click(screen.getByRole('button', { name: /continue/i }));
    
    // Try invalid key format
    await user.type(screen.getByLabelText(/api key/i), 'invalid-key');
    await user.click(screen.getByRole('button', { name: /continue/i }));
    
    expect(screen.getByText(/invalid api key format/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled();
  });
});

// Profile Form Tests
describe('ProfileForm', () => {
  it('validates social media URLs', async () => {
    const user = userEvent.setup();
    render(<ProfileForm initialData={mockProfile} />);
    
    const linkedinInput = screen.getByLabelText(/linkedin/i);
    await user.clear(linkedinInput);
    await user.type(linkedinInput, 'invalid-url');
    
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    expect(screen.getByText(/please enter a valid linkedin url/i)).toBeInTheDocument();
  });
  
  it('handles avatar upload', async () => {
    const user = userEvent.setup();
    const mockFile = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' });
    
    render(<ProfileForm initialData={mockProfile} />);
    
    const fileInput = screen.getByLabelText(/upload avatar/i);
    await user.upload(fileInput, mockFile);
    
    expect(fileInput.files[0]).toBe(mockFile);
    expect(screen.getByText('avatar.jpg')).toBeInTheDocument();
  });
});
```

### Accessibility Testing
```typescript
// Accessibility test suite
describe('Accessibility Tests', () => {
  it('has no axe violations on AI Tools page', async () => {
    const { container } = render(<AIToolsPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('supports screen reader navigation', () => {
    render(<AIToolsGrid providers={mockProviders} />);
    
    // Check for proper ARIA labels
    expect(screen.getByRole('grid')).toHaveAttribute('aria-label', 'Available AI tools');
    
    // Check each tool card has proper structure
    const toolCards = screen.getAllByRole('article');
    toolCards.forEach(card => {
      expect(card).toHaveAttribute('aria-labelledby');
      expect(card).toHaveAttribute('aria-describedby');
    });
  });
  
  it('supports keyboard navigation', () => {
    render(<AIToolsGrid providers={mockProviders} />);
    
    const firstTool = screen.getAllByRole('button')[0];
    firstTool.focus();
    expect(firstTool).toHaveFocus();
    
    // Test arrow key navigation
    fireEvent.keyDown(firstTool, { key: 'ArrowDown' });
    const secondTool = screen.getAllByRole('button')[1];
    expect(secondTool).toHaveFocus();
  });
  
  it('announces status changes to screen readers', async () => {
    const mockAnnounce = jest.fn();
    jest.mock('../hooks/useAnnouncements', () => ({
      useAnnouncements: () => ({ announce: mockAnnounce })
    }));
    
    render(<AIToolCard provider={mockProvider} />);
    
    // Simulate successful setup
    fireEvent.click(screen.getByRole('button', { name: /setup/i }));
    await waitFor(() => {
      expect(mockAnnounce).toHaveBeenCalledWith('AI tool setup completed successfully', 'assertive');
    });
  });
});
```

### Performance Testing
```typescript
// Performance benchmarks
describe('Performance Tests', () => {
  it('renders large AI tools list efficiently', () => {
    const manyProviders = Array.from({ length: 50 }, (_, i) => ({
      ...mockProvider,
      id: `provider-${i}`,
      name: `Provider ${i}`
    }));
    
    const startTime = performance.now();
    render(<AIToolsGrid providers={manyProviders} />);
    const endTime = performance.now();
    
    // Should render in under 100ms
    expect(endTime - startTime).toBeLessThan(100);
  });
  
  it('handles rapid user interactions smoothly', async () => {
    const user = userEvent.setup();
    render(<SetupWizard providerId="openai" isOpen={true} />);
    
    const continueButton = screen.getByRole('button', { name: /continue/i });
    
    // Rapid clicks should not break state
    await user.click(continueButton);
    await user.click(continueButton);
    await user.click(continueButton);
    
    // Component should still be in valid state
    expect(screen.getByText(/step/i)).toBeInTheDocument();
  });
});
```

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Week 1)
**Goal:** Set up core infrastructure and basic components

**Tasks:**
1. **Design System Setup**
   - Create CSS custom properties for colors, typography, spacing
   - Set up shadcn/ui base configuration
   - Create core utility classes

2. **Base Components**
   - `InstructionCard` component for API key setup
   - `FormField` component with validation
   - `StatusBadge` component for tool status

3. **Enhanced Settings Page**
   - Add API key instruction cards
   - Implement expandable sections
   - Add provider setup URLs

**Deliverables:**
- Updated `app/(portal)/settings/page.tsx`
- New `components/ui/instruction-card.tsx`
- New `components/ui/form-field.tsx`
- Updated CSS with design system tokens

### Phase 2: AI Tools System (Week 2)
**Goal:** Build complete AI tools management interface

**Tasks:**
1. **AI Tools Selection Page**
   - Create new route `app/(portal)/ai-tools/page.tsx`
   - Implement tool cards with status badges
   - Add category filtering and search

2. **Tool Status Management**
   - Setup, configuration, and test status indicators
   - Tier-based access controls
   - Usage analytics display

3. **Mock Data Integration**
   - Create comprehensive mock data files
   - Implement data fetching patterns
   - Add loading and error states

**Deliverables:**
- New `app/(portal)/ai-tools/page.tsx`
- New `components/ai-tools/tool-card.tsx`
- New `components/ai-tools/tools-grid.tsx`
- Mock data files in `lib/mock-data/`

### Phase 3: Setup Wizard (Week 3)
**Goal:** Create guided AI tool setup experience

**Tasks:**
1. **Setup Wizard Component**
   - 4-step wizard with progress indicator
   - API key validation and testing
   - Configuration options per provider

2. **Wizard Integration**
   - Modal/drawer implementation
   - Smooth step transitions
   - Form state management

3. **API Key Security**
   - Secure input fields (masking)
   - Client-side key format validation
   - Connection testing UI

**Deliverables:**
- New `components/ai-tools/setup-wizard.tsx`
- New `components/ui/step-progress.tsx`
- Integration with existing AI tools page

### Phase 4: Enhanced Profile (Week 4)
**Goal:** Complete profile management with social features

**Tasks:**
1. **Profile Form Enhancement**
   - Two-column responsive layout
   - Avatar and logo upload UI (placeholder)
   - Social media handle inputs

2. **Profile Validation**
   - URL format validation
   - Image size/format requirements
   - Character limits with counters

3. **User Experience Improvements**
   - Auto-save vs manual save options
   - Unsaved changes warnings
   - Success/error notifications

**Deliverables:**
- Enhanced `app/(portal)/settings/page.tsx`
- New `components/profile/avatar-upload.tsx`
- New `components/profile/social-handles.tsx`

### Phase 5: Membership System (Week 5)
**Goal:** Visual membership management and upgrade flows

**Tasks:**
1. **Membership Page**
   - Create `app/(portal)/membership/page.tsx`
   - Visual pricing cards with feature comparison
   - Usage meters and limit tracking

2. **Upgrade Integration**
   - Tier comparison tables
   - Usage analytics and projections
   - Call-to-action optimization

3. **Onboarding Enhancement**
   - Add Step 3 for AI tools selection
   - Guided flow improvements
   - Progress persistence

**Deliverables:**
- New `app/(portal)/membership/page.tsx`
- New `components/membership/pricing-card.tsx`
- Enhanced onboarding flow

### Phase 6: Testing & Accessibility (Week 6)
**Goal:** Comprehensive testing and accessibility compliance

**Tasks:**
1. **Component Testing**
   - Unit tests for all new components
   - Integration tests for user flows
   - Mock API responses

2. **Accessibility Compliance**
   - WCAG 2.1 AA compliance audit
   - Keyboard navigation testing
   - Screen reader compatibility

3. **Performance Optimization**
   - Component lazy loading
   - Image optimization
   - Bundle size analysis

**Deliverables:**
- Complete test suite (80%+ coverage)
- Accessibility audit report
- Performance benchmark results

---

## 📋 Quality Assurance Checklist

### Pre-Development Checklist
- [ ] Design system tokens are properly configured
- [ ] Mock data structures match backend specifications
- [ ] Component interfaces are well-defined
- [ ] Accessibility requirements are documented

### Development Checklist
- [ ] All components use consistent design tokens
- [ ] Mobile-first responsive design implemented
- [ ] Proper TypeScript interfaces and types
- [ ] Error handling and loading states included
- [ ] Form validation with clear error messages

### Testing Checklist
- [ ] Unit tests for all components (>80% coverage)
- [ ] Integration tests for user flows
- [ ] Accessibility testing with axe-core
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Mobile device testing (iOS, Android)

### Accessibility Checklist
- [ ] Keyboard navigation works for all interactive elements
- [ ] Focus indicators are clearly visible
- [ ] ARIA labels and roles properly implemented
- [ ] Color contrast meets WCAG AA standards (4.5:1 ratio)
- [ ] Screen reader compatibility verified
- [ ] Live regions announce dynamic content changes

### Performance Checklist
- [ ] Components render in under 100ms
- [ ] Images are optimized and lazy-loaded
- [ ] Bundle size impact analyzed
- [ ] No memory leaks in dynamic components
- [ ] Smooth animations and transitions

### User Experience Checklist
- [ ] Clear visual hierarchy and information architecture
- [ ] Consistent interaction patterns
- [ ] Helpful error messages and validation
- [ ] Intuitive navigation and flow
- [ ] Progressive disclosure of complex features

---

**End of Complete ZenCoder Handoff Document**

**Total Implementation Time:** 6 weeks
**Components Created:** 15+ new components  
**Pages Enhanced/Created:** 4 pages
**Design System Tokens:** 50+ tokens
**Mock Data Objects:** 100+ data points
**Accessibility Standards:** WCAG 2.1 AA compliant
**Test Coverage Target:** 80%+

This comprehensive specification provides everything needed to build a world-class Settings & AI Tools management system for Content Cascade AI. The implementation follows modern React/Next.js best practices while ensuring accessibility, performance, and user experience excellence.
