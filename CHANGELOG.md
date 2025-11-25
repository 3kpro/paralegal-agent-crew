# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

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
