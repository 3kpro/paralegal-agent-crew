# ⭐ STATEMENT OF TRUTH

**Project:** TrendPulse by Content Cascade AI
**Version:** 1.6.0 (Active Development)
**Status:** Beta - Core Features Working, Monetization In Development
**Last Updated:** November 14, 2024

---

## 1. The Vision: AI-Powered Social Media Trend Discovery & Content Generation

TrendPulse solves the creator's #1 problem: **"What should I post about today?"**

We help content creators, marketers, and influencers discover trending topics in their niche and generate optimized content across multiple social platforms using AI.

**Our competitive advantage:** Real-time trend discovery from multiple sources + local AI for unlimited free content generation + flexible multi-provider AI architecture.

---

## 2. What Actually Works Right Now

### ✅ TrendPulse™ Trend Discovery
- **PowerShell Microservice** (v2.3) - Keyword-aware trend search running on localhost:5003
- **Google Gemini Fallback** - AI-generated trends when microservice unavailable
- **Mock Data Fallback** - Ensures UI never breaks (production safety)
- **Real-time Twitter trend integration** via Twitter API v1.1

### ✅ Local AI via LM Studio
- **Free, unlimited content generation** using Mistral-7B model
- Runs on IBM P51 server @ 10.10.10.105:1234
- Zero API costs, full privacy, no rate limits
- Primary AI option for beta users

### ✅ Multi-Provider AI Architecture
Users can configure their own API keys for:
- **OpenAI** (GPT-4, DALL-E)
- **Anthropic** (Claude)
- **Google** (Gemini, Imagen)
- **ElevenLabs** (Voice Generation)
- **xAI** (Grok - Beta)

All API keys encrypted with AES-256-GCM and stored securely in Supabase.

### ✅ Subscription Tier System
- **Free Tier:** 3 daily generations, 10K tokens/day, 1 AI tool
- **Pro Tier:** 25 daily generations, 100K tokens/day, 3 AI tools ($29/mo - coming soon)
- **Premium Tier:** Unlimited generations, unlimited AI tools ($99/mo - coming soon)

Tier limits enforced via Supabase RPC functions with daily usage tracking.

### ✅ User Authentication & Profiles
- Supabase Auth with email/password
- Extended profile data: bio, social handles (Twitter, LinkedIn, Instagram, TikTok, Reddit, Facebook)
- Company branding support (logo, company name)

### ✅ Settings & Management UI
- **Profile Tab:** Full profile editing with 14+ fields
- **API Keys Tab:** Configure AI providers with encrypted storage + connection testing
- **Membership Tab:** Usage meters, tier display, upgrade buttons

---

## 3. What's In Development

### 🚧 Stripe Payment Integration (90% Complete)
- Checkout flow implemented
- Webhook handlers created
- Customer portal ready
- **Status:** Shows "Coming Soon" modal instead of redirecting to Stripe
- **Blocker:** Awaiting live Stripe configuration

### 🚧 Content Generation Workflow
- Trend selection UI exists
- AI generation endpoints created
- **Status:** Integration between trends and generation incomplete

### 🚧 Social Media Publishing
- Twitter OAuth credentials configured
- API endpoints scaffolded
- **Status:** Not yet connected to UI

---

## 4. Tech Stack (Actual)

### Frontend
- **Next.js 15.5.6** (App Router, React Server Components)
- **TypeScript** with strict type checking
- **Tailwind CSS v4.1.15** with custom Tron theme
- **Framer Motion** for animations
- **Lucide React** for icons

### Backend & Database
- **Supabase** (PostgreSQL, Auth, Row Level Security)
- **12+ Migrations** defining profiles, API tools, tier limits, daily usage tracking
- **Encryption:** AES-256-GCM for sensitive API keys

### Deployment
- **Vercel** (auto-deploy from GitHub main branch)
- **Production URL:** https://trendpulse.3kpro.services
- **GitHub Repo:** 3kpro/content-cascade-ai-landing

### AI Services
- **LM Studio** (local, free) - Primary option
- **Google Gemini API** - Trends fallback
- **Multi-provider support** via encrypted user API keys
- **NO OpenRouter** - Each provider integrated directly

### Microservices
- **PowerShell Trends Service** (v2.3) - Localhost:5003, keyword-aware search
- **API Gateway via ngrok** (optional) - Exposes local services to production

### Caching & Rate Limiting
- **Redis:** Disabled (`REDIS_ENABLED=false`)
- **Rate limiting:** Implemented via Supabase daily_usage table

---

## 5. Design System (Actual)

**Theme:** Cyberpunk "Tron" aesthetic

**Colors:**
- `tron-cyan`: #00D9FF (primary accent)
- `tron-magenta`: #FF006E (secondary accent)
- `tron-dark`: #0a0e27 (background)
- `tron-grid`: #1a1f3a (cards/borders)
- `tron-text`: #e2e8f0 (primary text)
- `tron-text-muted`: #94a3b8 (secondary text)
- `tron-green`: #00ff9f (success states)

**Typography:** Inter font, clean and modern

**Components:** Dark backgrounds, neon accents, grid patterns, gradient effects

**Note:** The 3kpro.services website uses a different "Professional Modern" theme with coral/salmon colors - this is intentional separation.

---

## 6. Database Schema (Key Tables)

### `profiles`
User profile data including subscription tier, social handles, preferences

### `ai_provider_tools`
Encrypted API keys for user-configured AI providers

### `tier_limits`
Defines limits for Free/Pro/Premium tiers (generations, tokens, campaigns, AI tools)

### `daily_usage`
Tracks per-user daily consumption for rate limiting

### RPC Functions
- `get_user_tier_limits(UUID)` - Returns tier configuration
- `get_user_daily_usage(UUID)` - Returns today's usage stats
- `can_user_generate(UUID)` - Checks if user can generate content
- `increment_daily_usage(UUID, INTEGER)` - Updates usage counters

---

## 7. Development Workflow

### For AI Agents Working on This Codebase

**CRITICAL RULES:**
1. **Read this document first** - It's the source of truth, not old documents
2. **Check CHANGELOG.md** for recent changes before coding
3. **Follow the Tron design system** - Use tron-* color classes, not coral/salmon
4. **All API keys must be encrypted** via `lib/encryption.ts`
5. **Validate inputs with Zod** on all API endpoints
6. **Test locally before pushing** - Production errors block real users
7. **Update CHANGELOG.md** after completing work
8. **Never commit with --no-verify** unless it's an urgent production fix

### Common Pitfalls
- ❌ Assuming OpenRouter exists (it doesn't)
- ❌ Using "Professional Modern" colors (that's 3kpro.services, not TrendPulse)
- ❌ Expecting Redis to work (it's disabled)
- ❌ Hardcoding API keys (must be user-configured and encrypted)

---

## 8. Current Focus & Priorities

### Immediate (This Week)
1. ✅ **Fix /api/usage errors** - COMPLETED (Supabase function aliasing + response parsing)
2. 🔄 **Test Upgrade button** - In progress
3. 📋 **Enable Stripe live payments** - Waiting for business decision

### Short Term (Next 2 Weeks)
1. Complete trend → content generation workflow
2. Implement social media publishing for Twitter
3. Add usage analytics dashboard
4. Build campaign management system

### Medium Term (Next Month)
1. Add LinkedIn, Facebook, Instagram publishing
2. Implement scheduling system
3. Build content calendar view
4. Add team collaboration features

---

## 9. Known Issues & Limitations

### Production Bugs
- ✅ `/api/usage` 500 error - **FIXED** (Nov 14, 2024)
- ⚠️ ESLint config broken - Missing `@eslint/js` package

### Feature Gaps
- No viral score prediction (mentioned in old docs but never implemented)
- No feedback tracking system
- No ML model training
- Stripe checkout shows "Coming Soon" instead of real checkout

### Technical Debt
- Multiple TODO comments in codebase
- Some unused mock data endpoints
- Settings page expects usage data structure not fully populated

---

## 10. Environment Configuration

### Required Environment Variables

**Supabase:**
```
NEXT_PUBLIC_SUPABASE_URL=https://hvcmidkylzrhmrwyigqr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon key]
```

**AI Services:**
```
LM_STUDIO_URL=http://10.10.10.105:1234
LM_STUDIO_MODEL=mistral-7b-instruct-v0.3
USE_LOCAL_AI=true
AI_PROVIDER=local
GOOGLE_API_KEY=[fallback for trends]
```

**PowerShell Microservice:**
```
POWERSHELL_TRENDS_URL=http://localhost:5003
```

**Stripe (Test Mode):**
```
STRIPE_SECRET_KEY=[test key]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[test key]
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_...
```

**Encryption:**
```
ENCRYPTION_KEY=[32-byte hex string]
```

**Twitter API (Legacy v1.1):**
```
TWITTER_API_KEY=...
TWITTER_API_SECRET=...
TWITTER_ACCESS_TOKEN=...
TWITTER_ACCESS_TOKEN_SECRET=...
TWITTER_BEARER_TOKEN=...
```

---

## 11. Success Metrics (When Live)

### Beta Launch Goals
- 50 active users testing TrendPulse
- 500+ trend generations
- 5 paying subscribers (Pro/Premium)

### Product-Market Fit Indicators
- Users return 3+ times/week
- Average session generates 2+ pieces of content
- 10%+ conversion from Free to paid tiers

---

## 12. What This Project Is NOT

- ❌ Not using OpenRouter
- ❌ Not using Vertex AI (yet)
- ❌ Not using Redis caching (disabled)
- ❌ Not using machine learning for viral scores
- ❌ Not a white-label platform
- ❌ Not built for agencies (solo creators first)

---

**Last Verified:** November 14, 2024 by Claude Code
**Next Review:** When major features ship or architecture changes
