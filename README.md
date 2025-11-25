# TrendPulse - AI-Powered Social Media Management Platform

TrendPulse is a B2B SaaS platform that helps businesses discover trending topics, generate AI-powered content, and publish to multiple social media platforms from a single dashboard.

## 🚀 Features

### Core Features
- 🔥 **Trend Discovery**: AI-powered trend analysis from Twitter, Reddit, Google Trends
- 🤖 **AI Content Generation**: Create platform-optimized content with Claude AI
- 📊 **Campaign Management**: Organize and schedule content campaigns
- 🔗 **Multi-Platform Publishing**: Post to Twitter, Instagram, LinkedIn, TikTok, Facebook
- 📈 **Analytics & Tracking**: Monitor post performance and engagement
- 💳 **Subscription Management**: Stripe-powered billing with tiered plans

### Platform Integrations
- ✅ **Twitter / X**: OAuth 2.0 with PKCE, tweet posting, image support
- ✅ **Instagram**: Business account posting via Facebook Graph API
- ✅ **LinkedIn**: Professional profile posting with multi-image support
- ✅ **TikTok**: Video posting via Content Posting API
- ✅ **Facebook**: Page posting via Graph API

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Supabase account (database & auth)
- Stripe account (payments)
- Platform API credentials (Twitter, Instagram, LinkedIn, TikTok)

## 🛠️ Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd landing-page
npm install
```

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and configure:

```bash
# See .env.local for full configuration
# Required: Supabase, Stripe, Encryption Key
# Social platforms: Add credentials as you set them up
```

### 3. Social Media Platform Setup

**Quick Start Guides:**
- [📊 All Platforms Overview](SOCIAL_PLATFORMS_SETUP.md) - Start here!
- [✅ Twitter](CHANGELOG.md#twitter-integration-complete) - Already working!
- [📸 Instagram](INSTAGRAM_QUICK_START.md) - 30 min setup
- [💼 LinkedIn](LINKEDIN_QUICK_START.md) - 15 min setup
- [🎵 TikTok](TIKTOK_QUICK_START.md) - 20 min + API approval

**Recommended Order:**
1. Twitter ✅ (Already done!)
2. LinkedIn (instant approval)
3. Instagram (test in dev mode)
4. TikTok (requires API approval)

See [SOCIAL_PLATFORMS_SETUP.md](SOCIAL_PLATFORMS_SETUP.md) for complete setup instructions.

### 4. Database Setup

```bash
# Supabase migrations are in /supabase/migrations
# Run via Supabase dashboard or CLI
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
landing-page/
├── app/                          # Next.js 15 App Router
│   ├── (portal)/                # Authenticated portal pages
│   │   ├── campaigns/           # Campaign management
│   │   ├── settings/            # User settings & connections
│   │   └── trends/              # Trend discovery
│   └── api/                     # API routes
│       ├── auth/                # OAuth flows (connect, callback)
│       └── social/              # Social posting endpoints
├── components/                   # React components
│   ├── campaigns/               # Campaign UI components
│   ├── settings/                # Settings & connections UI
│   └── ui/                      # Shared UI components
├── lib/                         # Utilities & helpers
│   ├── auth/                    # OAuth utilities
│   ├── supabase/                # Supabase clients
│   └── encryption.ts            # Token encryption
├── docs/                        # Documentation
│   └── INSTAGRAM_SETUP_GUIDE.md # Detailed Instagram guide
├── CHANGELOG.md                 # Release notes
├── SOCIAL_PLATFORMS_SETUP.md    # Master setup guide
├── INSTAGRAM_QUICK_START.md     # Instagram quick setup
├── LINKEDIN_QUICK_START.md      # LinkedIn quick setup
└── TIKTOK_QUICK_START.md        # TikTok quick setup
```

## 🔐 Security

- **Token Encryption**: All social media tokens encrypted with AES-256
- **Environment Variables**: Sensitive credentials in `.env.local`
- **Database Security**: Supabase RLS policies
- **OAuth 2.0**: Industry-standard authentication
- **HTTPS Only**: Production enforces HTTPS

## 🧪 Testing

### Test Social Connections

1. Start dev server: `npm run dev`
2. Navigate to Settings > Connections
3. Click "Connect" for any platform
4. Authorize the app
5. Verify connection shows as "Connected"

### Test Publishing

1. Create a new campaign
2. Generate AI content
3. Click "Publish"
4. Verify post appears on platform
5. Check success toast shows clickable link

## 📦 Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Add production redirect URIs to all platform apps
```

### Environment Variables for Production

Add these to Vercel:
- All `.env.local` variables
- Update `NEXT_PUBLIC_APP_URL` to production URL
- Add production OAuth redirect URIs to platform apps

## 🔄 Recent Changes

See [CHANGELOG.md](CHANGELOG.md) for detailed release notes.

**Latest (2024-11-24):**
- ✅ Twitter integration complete
- ✅ Instagram code ready (needs credentials)
- ✅ LinkedIn code ready (needs credentials)
- ✅ TikTok code ready (needs credentials + API approval)
- ✅ All platform setup guides created

## 📚 Documentation

- [Social Platforms Setup](SOCIAL_PLATFORMS_SETUP.md) - Master guide
- [Instagram Setup](INSTAGRAM_QUICK_START.md) - Quick start
- [LinkedIn Setup](LINKEDIN_QUICK_START.md) - Quick start
- [TikTok Setup](TIKTOK_QUICK_START.md) - Quick start
- [Instagram Detailed Guide](docs/INSTAGRAM_SETUP_GUIDE.md) - Deep dive
- [Changelog](CHANGELOG.md) - Release history

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

Proprietary - 3K Pro Services

## 🆘 Support

For questions or issues:
- Check platform-specific guides
- Review [SOCIAL_PLATFORMS_SETUP.md](SOCIAL_PLATFORMS_SETUP.md)
- Contact: support@3kpro.services

---

**Built with:**
- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- Supabase
- Stripe
- Claude AI
