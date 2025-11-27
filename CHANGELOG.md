# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [2025-11-26] - Viral Score AI Upgrade

### Added
- **Hybrid AI Viral Score Engine**:
  - Replaced heuristic-only model with a Hybrid AI + Data approach.
  - Integrated **Gemini 2.0 Flash Lite** (via API Key) for psychological content analysis.
  - New scoring algorithm: 70% Content (AI) / 30% Data (Volume/Freshness).
  - Achieved **72/100** accuracy score for high-potential/low-volume topics (e.g., new AI trends).
  - Detailed documentation: `docs/VIRAL_SCORE_OPTIMIZATION.md`.

### Changed
- **Viral Score Algorithm**:
  - Previous: Heavily weighted towards search volume (failed on new trends).
  - New: Heavily weighted towards "Hook Quality", "Broad Appeal", and "Emotional Trigger".
  - "How to use AI for Content Marketing" score improved from **20/100** (Low) to **72/100** (High).
- **AI Integration**:
  - Switched from Vertex AI (Cloud IAM) to Google Generative AI (API Key) for immediate reliability and speed.
  - Implemented robust error handling and fallback to heuristics if AI fails.

### Technical
- **Gemini 2.0 Flash Lite**:
  - Selected for speed and reasoning capabilities.
  - Configured with `maxOutputTokens: 500` for detailed reasoning.
- **Test Suite**:
  - Updated `scripts/test-viral-score.ts` to validate the new hybrid model.


## [2025-01-26] - Business Strategy & Press Materials

### Added
- **Press Pack - TrendPulse**: Complete press kit for consumer/SMB product
  - Positioning: Social media management for small businesses ($9-$79/month)
  - Bootstrap financial model with real costs
  - Year 1-3 projections (profitable from Month 6)
  - AI workforce strategy section
  - Unit economics breakdown
  - File: TRENDPULSE_PRESS_PACK.md

- **Press Pack - CCAI**: Complete press kit for enterprise product
  - Positioning: Marketing automation platform for mid-market/enterprise ($199-$1,499+/month)
  - Phased launch strategy (TrendPulse Year 1, CCAI Year 2+)
  - 3-year financial projections ($3.6M ARR by Year 3)
  - AI-powered bootstrap playbook
  - $100M+ exit strategy
  - File: CCAI_PRESS_PACK.md

- **Press Pack Summary**: Quick reference guide comparing both products
  - Side-by-side pricing comparison
  - Real bootstrap costs ($14,772 Year 1)
  - Launch strategy overview
  - File: PRESS_PACK_SUMMARY.md

- **Meta Support Handoff**: Documentation for Facebook/Instagram setup
  - Complete walkthrough for Meta Developer Portal
  - OAuth configuration steps
  - Role and permissions setup
  - Files: META_SUPPORT_HANDOFF.md, META_AI_HANDOFF.txt, META_SETUP_CHECKLIST.md

- **Gemini AI Assistant Implementation Plan**: Technical handoff for AI assistant
  - Architecture using Google Vertex AI (Gemini 1.5 Pro)
  - Chat widget implementation
  - Advanced analytics expansion
  - RAG knowledge base setup
  - Cost analysis ($1,300 Google Cloud credits)
  - File: GEMINI_AI_ASSISTANT_HANDOFF.md

### Changed
- **Pricing Strategy Updated**: Revised to bootstrap-friendly tiers
  - TrendPulse: Free/$9/$29/$79 (vs previous $29/$99)
  - CCAI: $199/$499/$1,499+ (enterprise focus)
  - Lower barrier to entry, better conversion funnel

- **Financial Projections**: Corrected to reflect real bootstrap costs
  - Year 1 costs: $14,772 (not $60K-$150K)
  - Infrastructure: $0 (free tiers until scale)
  - Monthly burn: $132 (vs typical $50K+)
  - Break-even: 20 customers (Month 3-6)
  - Profit margins: 89-94% Year 1-2

- **Go-to-Market Strategy**: Phased approach clarified
  - Phase 1 (2025): TrendPulse only, product-led growth
  - Phase 2 (2026): Introduce CCAI, hire 1 salesperson
  - Phase 3 (2027+): Scale both products, team of 3-5

### Technical
- **Unit Economics Validated**:
  - Starter ($9): $8.43 profit (94% margin)
  - Pro ($29): $26.71 profit (92% margin)
  - Business ($79): $69.61 profit (88% margin)
  - CAC: $0-$20 (organic growth)
  - LTV:CAC ratio: 35:1

- **AI Cost Analysis**:
  - OpenAI: $0.014 per content generation
  - Vertex AI: Covered by $1,300 Google credits (20+ months)
  - Stripe: 2.9% + $0.30 per transaction
  - Total AI costs scale perfectly with revenue

### Business Strategy
- **Bootstrap-First Model**: No VC funding required
  - $1,292 capital needed for 6-month runway
  - Profitable by Month 6
  - 100% equity retained
  - Optionality to raise capital from strength (Year 2+)

- **AI Workforce Strategy**: Replace traditional hiring with AI
  - Claude Code: Development acceleration (10X faster)
  - GPT-4: Content creation and marketing
  - Gemini: Customer support and analytics
  - Saves $390K/year vs hiring team

- **Exit Strategy**: $100M-$500M acquisition target
  - Year 3: $3.6M ARR → $36M-$54M valuation
  - Year 5: $15M ARR → $120M-$180M valuation
  - Strategic buyers: Salesforce, HubSpot, Adobe, Meta
  - Bootstrap path maintains maximum equity

## [2024-11-24] - Multi-Platform Social Integration Complete

### Added
- **Instagram Integration**: Complete OAuth and posting implementation ✅
  - OAuth via Facebook Graph API
  - 2-step posting (create container → publish)
  - Business account support with Facebook Pages integration
  - Fixed profile fetch to use Facebook Pages → Instagram Business Account flow
  - Credentials configured and ready for testing
  - Comprehensive setup guide: INSTAGRAM_QUICK_START.md

- **LinkedIn Integration**: Complete OAuth and posting implementation ✅
  - OAuth 2.0 with OpenID Connect
  - UGC Post API with multi-image support
  - Professional profile integration
  - App verified and approved (App ID: 228330330)
  - Credentials configured and ready for use
  - Setup guide: LINKEDIN_QUICK_START.md

- **TikTok Integration**: Complete OAuth and posting implementation ⏳
  - Content Posting API v2
  - Video publishing support
  - Auto token refresh
  - Privacy Policy page created (required for app verification)
  - Terms of Service page created (required for app verification)
  - Webhook endpoint implemented at `/api/webhooks/tiktok`
  - Domain verification file configured
  - App submitted for review (awaiting approval)
  - Setup guide: TIKTOK_QUICK_START.md

- **Legal Pages**: Required for platform compliance
  - Privacy Policy at `/privacy`
  - Terms of Service at `/terms`
  - Both styled with Tron theme
  - Covers all integrated platforms and data handling

- **Master Setup Guide**: SOCIAL_PLATFORMS_SETUP.md
  - All platforms overview
  - Setup order recommendations
  - Feature comparison matrix
  - Common troubleshooting

- **README.md**: Comprehensive project documentation
  - Architecture overview
  - Setup instructions
  - Platform integration links

### Fixed
- **Instagram Profile Fetch**: Fixed callback handler to properly fetch Instagram Business Account
  - Changed from direct `graph.instagram.com/me` to Facebook Pages API
  - Now fetches Facebook Pages first, then Instagram Business Account from page
  - Falls back to Facebook Page info if no Instagram linked
  - Resolves "Failed to fetch Instagram profile" error

- **TikTok OAuth Scope**: Updated from `video.upload` to `video.publish` per current API docs

- **TikTok Webhook**: Created POST/GET endpoint, deployed to production

### Changed
- Updated `.env.local` with Instagram credentials (Client ID: 846908931167911)
- Updated `.env.local` with TikTok credentials (Client Key: awor4roxingfnfin)
- Updated `.env.local` with LinkedIn credentials (Client ID: 86ajcfglpco29h)
- Fixed Instagram callback to use Facebook Graph API for profile data

### Technical
- Instagram OAuth uses Facebook Graph API endpoint with Pages integration
- All platforms use same OAuth flow pattern
- Encrypted token storage with AES-256
- Automatic token refresh for all platforms
- TikTok webhook handles: video.publish.complete, video.publish.failed, authorization.revoked
- All legal pages served from Next.js app routes

## [2024-11-24] - Twitter Integration Complete

### Added
- Twitter/X OAuth 2.0 integration with PKCE support
- Encrypted token storage in `user_social_connections` table
- Working PublishButton component for posting to Twitter from campaigns
- Auto-redirect to campaigns list after successful publish
- Toast notifications with clickable Twitter post links
- Twitter connection management in Settings > Connections tab
- Test page for Twitter publishing at `/test-twitter`

### Fixed
- OAuth callback routes now use `/api/auth/callback/[platform]` instead of old routes
- Twitter tokens now properly encrypted before database storage
- Campaign publish button now functional (removed "Coming Soon" placeholder)
- OAuth redirect now goes to Settings > Connections tab after authorization
- Content Flow page import errors resolved

### Changed
- Migrated from `social_accounts` table to `user_social_connections` table
- Deleted old OAuth routes in `/api/social-connections/oauth/`
- Updated AddConnectionModal to use new OAuth endpoints
- PublishButton now shows success toast with Twitter link

### Technical
- Added debug logging for OAuth flow tracking
- Implemented token refresh logic for expired tokens
- Added encryption/decryption utilities for API keys
- PKCE (code_verifier/code_challenge) support for Twitter OAuth

## [2024-11-24] - Twitter Integration Complete

### Summary
Complete Twitter/X publishing integration from campaign creation to posting. Users can now:
1. Connect Twitter account via OAuth 2.0
2. Create campaigns with AI-generated content
3. Publish directly to Twitter
4. View published tweets via clickable links
5. Manage connections in Settings

### Technical Details
- OAuth 2.0 with PKCE (Proof Key for Code Exchange)
- Token encryption using AES-256
- Automatic token refresh on expiry
- Multi-platform publishing support (extensible to other platforms)
