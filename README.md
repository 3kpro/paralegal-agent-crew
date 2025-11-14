# Content Cascade AI (CCAI)

## TrendPulse Beta - AI-Powered Content Campaign Platform

**Current Phase:** Production-Ready - Visual Redesign Complete
**Version:** 1.11.0 (Unreleased)
**Status:** 🎨 Professional modern theme with Google Gemini AI integration

**Design Update**: Transformed from Tron Legacy theme to professional modern aesthetic (coral #e5a491, white backgrounds, clean typography)

**AI Integration**: Using Google Gemini 2.5 Flash for real-time trend analysis and content generation (~500ms response time)

---

## 📖 **FULL PROJECT CONTEXT**

👉 **For complete project context, strategy, and AI agent workflow:**
**Read [STATEMENT_OF_TRUTH.md](STATEMENT_OF_TRUTH.md) first**

This README is a quick start guide only. All project strategy, architecture, and agent workflow is in the Statement of Truth.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- (Optional) AI provider API keys (Gemini, OpenAI, Claude, etc.)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env.local

# 3. Configure environment variables
# Edit .env.local with your Supabase credentials and API keys

# 4. Run database migrations (if first time)
# Connect to Supabase and run migrations in supabase/migrations/

# 5. Start development server
npm run dev
```

Server runs at **http://localhost:3000**

### Using the Restart Script

For clean testing (kills servers, rebuilds, runs dev):

```bash
.\restart-dev.bat
```

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 15.5.4 (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Supabase (Auth, Database, Storage), Next.js API Routes
- **AI Integration:** Google Gemini 2.5 Flash, OpenAI, Claude (LM Studio deprecated)
- **ML Training:** Feedback tracking system with auto-calculation triggers (PostgreSQL)
- **Styling:** Professional modern theme (coral #e5a491, white backgrounds, gray text)
- **Deployment:** Vercel
- **Testing:** Jest, React Testing Library, Playwright

---

## 📁 Project Structure

```
landing-page/
├── app/                      # Next.js App Router
│   ├── (portal)/             # Authenticated pages (dashboard, campaigns, settings)
│   └── api/                  # API endpoints
├── components/               # React components
├── lib/                      # Core libraries (Supabase, Stripe, encryption)
├── supabase/migrations/      # Database migrations
├── docs/                     # All documentation
├── STATEMENT_OF_TRUTH.md     # ⭐ Master context document
├── CHANGELOG.md              # Version history
├── TASK_QUEUE.md             # Current tasks
└── KNOWN_BUGS.md             # Bug tracking
```

---

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start dev server (port 3000)
npm run build            # Production build
npm start               # Start production server

# Testing
npm test                # Run Jest tests
npm run test:watch      # Watch mode
npm run test:e2e        # Playwright E2E tests (if configured)

# Utilities
.\restart-dev.bat       # Windows: Clean restart (kill servers, rebuild, run)
npm run lint            # Run ESLint
```

---

## 🌐 Environment Variables

Required in `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe (Payment Integration)
STRIPE_SECRET_KEY=your_stripe_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable
STRIPE_WEBHOOK_SECRET=your_webhook_secret
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxx
STRIPE_PRO_YEARLY_PRICE_ID=price_xxx
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_xxx
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_xxx

# AI Providers (Optional - can configure in UI)
GOOGLE_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_claude_key

# Security
ENCRYPTION_KEY=64_character_hex_string

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 🎯 Key Features

### TrendPulse Workflow (Current)

1. **Campaign Creation** - Name your campaign, select platforms
2. **Trend Discovery** - Multi-source trending topics with **Viral Score™ prediction**
   - **NEW: Viral Score™** - AI-powered viral prediction (0-100 score)
     - Predicts which topics will perform best
     - Color-coded badges: 🔥 High (70+), ⚡ Medium (50-69), 📊 Low (<50)
     - 4-factor algorithm: Volume, Multi-source validation, Specificity, Freshness
     - Automatic sorting by viral potential (best trends first)
   - **Trend Sources**: Mixed, Google Trends, Twitter Trends, Reddit Hot Topics
   - **AI Fallback**: 3-tier system (Real-time APIs → Gemini AI → Mock data)
   - **Response Time**: ~500ms for AI-generated trends, ~100-150ms average with caching
   - **Cache Strategy**: Redis with 5-minute TTL (24x faster than API calls)
3. **Content Generation** - AI-generated content for multiple platforms
   - **Providers**: Google Gemini 2.5 Flash (primary), OpenAI, Claude
   - **Performance**: 50% faster than previous version (4.8s vs 9.6s)
4. **Review & Save** - Preview and save campaign drafts
5. **Performance Tracking & ML Training** - Feedback system for continuous improvement
   - **Automatic Tracking**: Records viral score predictions when content is published
   - **Engagement Collection**: Tracks actual performance (likes, shares, comments) after 24-48 hours
   - **Analytics Dashboard**: View prediction accuracy and ML readiness at `/analytics`
   - **ML Data Export**: Export training data (CSV/JSON) when ready for Phase 2 ML model
   - **Two-Phase Strategy**:
     - Phase 1 (Current): Heuristic algorithm collects real-world data
     - Phase 2 (Future): Machine learning model trained on user outcomes

### AI Tools Integration

- **Primary AI**: Google Gemini 2.5 Flash (keyword-optimized content in ~500ms)
- Multiple AI providers (OpenAI, Claude - LM Studio deprecated)
- Encrypted API key storage (AES-256-GCM)
- Tier-based access (Free: 1 tool, Pro: 3, Premium: unlimited)
- **API Optimization**: Parallelization and non-blocking cache writes (12-30% faster)

### Subscription System

- **Free Tier** - 5 campaigns/month, 1 AI tool
- **Pro Tier** ($29/mo) - Unlimited campaigns, 3 AI tools
- **Premium Tier** ($99/mo) - Unlimited everything
- **Stripe Integration** - Test mode enabled, production-ready checkout flow

### Authentication & Security

- **Remember Me** - Optional persistent login (localStorage) vs temporary sessions (sessionStorage)
  - Checked (default): Users stay logged in across browser restarts
  - Unchecked: Auto-logout when browser closes (secure for shared computers)
- **Enhanced Logout** - Cleans up session data across all navigation components
- **API Key Encryption** - AES-256-GCM for user-configured AI provider keys

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**

   ```bash
   git push origin main
   ```

2. **Connect to Vercel**

   - Import repository in Vercel dashboard
   - Configure environment variables
   - Deploy automatically

3. **Custom Domain**

   - Add domain in Vercel settings
   - Configure DNS (A/CNAME records)
   - Target: `ccai.3kpro.services` (or custom domain)

4. **Webhook Configuration**
   - Configure Stripe webhook URL in dashboard
   - Add `STRIPE_WEBHOOK_SECRET` to Vercel env vars

---

## 📚 Documentation

**Essential Reads:**

- [STATEMENT_OF_TRUTH.md](STATEMENT_OF_TRUTH.md) - ⭐ Start here for full context
- [CHANGELOG.md](CHANGELOG.md) - Version history and updates
- [TASK_QUEUE.md](TASK_QUEUE.md) - Current tasks and agent assignments
- [KNOWN_BUGS.md](KNOWN_BUGS.md) - Tracked issues

**Additional Documentation:**

- [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) - Architecture details
- [docs/AI_TOOLS_SETUP_GUIDE.md](docs/AI_TOOLS_SETUP_GUIDE.md) - AI provider configuration
- [docs/ZENCODER_HANDOFF_PORTAL.md](docs/ZENCODER_HANDOFF_PORTAL.md) - UI/UX specifications
- [docs/FEEDBACK_TRACKING_SYSTEM.md](docs/FEEDBACK_TRACKING_SYSTEM.md) - ML training and analytics
- [docs/QUICK_INTEGRATION_GUIDE.md](docs/QUICK_INTEGRATION_GUIDE.md) - 5-minute feedback setup
- [docs/SUPABASE_HANDOFF.md](docs/SUPABASE_HANDOFF.md) - Database migration instructions

**Archived:**

- [docs/handoffs/](docs/handoffs/) - Historical agent handoffs (reference only)

---

## 🐛 Bug Reports

Found a bug? Check [KNOWN_BUGS.md](KNOWN_BUGS.md) first.

If it's new, add it to KNOWN_BUGS.md with:

- Bug ID
- Description
- Steps to reproduce
- Expected vs actual behavior
- Files involved

---

## 🤝 Contributing

**For AI Agents:**

1. Read [STATEMENT_OF_TRUTH.md](STATEMENT_OF_TRUTH.md) for workflow
2. Check [TASK_QUEUE.md](TASK_QUEUE.md) for assignments
3. Follow Tron theme design system
4. Update [CHANGELOG.md](CHANGELOG.md) after work
5. Mark tasks complete in [TASK_QUEUE.md](TASK_QUEUE.md)

**For Human Developers:**

- Follow existing code patterns
- Use Tron theme Tailwind classes
- Write tests for new features
- Update documentation

---

## 📞 Support

- **Project Lead:** Check STATEMENT_OF_TRUTH.md for current context
- **Documentation:** docs/ directory
- **Issues:** KNOWN_BUGS.md

---

## 📄 License

Copyright © 2025 3K Pro Services. All rights reserved.

---

**Current Focus:** Perfecting TrendPulse for beta launch 🎯

For complete project context and strategy: **[STATEMENT_OF_TRUTH.md](STATEMENT_OF_TRUTH.md)**
