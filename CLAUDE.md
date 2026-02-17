# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Xelora** is a B2B SaaS platform for AI-powered social media management. The platform enables businesses to:
- Discover trending topics across Twitter, Reddit, and Google Trends
- Generate AI-optimized content for multiple platforms simultaneously
- Publish to Twitter, LinkedIn, Facebook, Instagram, TikTok, and YouTube
- Track campaign performance and engagement analytics

**Tech Stack:**
- Next.js 16 (App Router) + React 19 + TypeScript
- Supabase (PostgreSQL + Auth)
- Stripe (Subscriptions)
- Multiple AI providers (OpenAI, Anthropic, Google, xAI)
- Vercel deployment with Upstash Redis

## Multi-Project Monorepo Structure

This IDE contains **three independent project builds**, each with isolated SYSTEM folders:

1. **3kpro.services** (`3kpro-website/`)
   - Main consulting/company site
   - Dev server: `localhost:3001`
   - Start with: `3001.bat` (clears node_modules, restarts dev)

2. **Xelora** (`landing-page/`)
   - Flagship SaaS for AI-powered social media management
   - Dev server: `localhost:3000`
   - Start with: `3000.bat` (clears node_modules, restarts dev)

3. **3KPRO Marketplace** (`3kpro-website/marketplace`)
   - Product showcase on 3kpro.services
   - Showcases Xelora and other SaaS products

**Why separate SYSTEM folders?**
Each project has its own:
- `docs/SYSTEM/VISION.md` - Project-specific vision
- `docs/SYSTEM/TASKS.md` - Project-specific work queue
- `docs/SYSTEM/AGENT_CONTRACT.md` - Project-specific rules
- `docs/SYSTEM/CHANGELOG.md` - Project-specific history

This keeps agents working in their own lane without cross-contamination.

## Development Workflow

### Work Process (Human-in-Loop)

1. **Agent receives task** from `docs/SYSTEM/TASKS.md` (NOW section)
2. **Agent develops locally** - no production changes yet
3. **Agent completes ONE task** - updates CHANGELOG, marks complete, queues next task
4. **Human verifies work** on localhost (runs `.bat` file to restart clean)
5. **Human approves** - tells agent "verified, ready to commit"
6. **Agent commits and pushes** - uses Vercel CLI for production deployment

### Key Rules

- **NO automatic deployments** - Agent waits for human verification
- **All work stays local** - Until human gives explicit approval
- **One task per session** - Agent STOPS after completing ONE task
- **Clean dev restart** - Use `.bat` files to wipe node_modules and restart dev server

### Development Commands

```bash
# Development
npm run dev              # Start dev server on localhost:3000
npm run build            # Production build
npm run lint             # Run ESLint

# Testing
npm test                 # Run Jest tests
npm run test:watch       # Jest in watch mode
npm run test:coverage    # Generate coverage report

# Deployment
npm run deploy:local     # Docker Compose local deployment
npm run deploy:prod      # Docker Compose production deployment

# Diagnostics
npm run diagnose:tiktok  # Debug TikTok OAuth configuration
npm run check:tiktok     # Verify TikTok app setup
```

## Architecture Overview

### App Router Structure

```
app/
├── (portal)/                    # Authenticated routes (protected by middleware)
│   ├── campaigns/              # Campaign management
│   │   ├── create/            # Multi-step campaign creation wizard
│   │   ├── [id]/              # Campaign detail view
│   │   └── [id]/edit/         # Campaign editing
│   ├── settings/              # User settings (Profile, API Keys, Connections, Membership)
│   ├── dashboard/             # Main overview page
│   ├── analytics/             # Performance tracking
│   └── helix/                 # AI assistant interface
│
└── api/                        # API routes
    ├── auth/                   # OAuth flows
    │   ├── connect/[platform]/     # Initiate OAuth (generates state/PKCE)
    │   └── callback/[platform]/    # Token exchange and storage
    ├── social/                # Direct publishing endpoints
    ├── social-publishing/     # Queue-based multi-platform publishing
    ├── stripe/                # Payment integration
    ├── trends/                # Trend discovery
    └── generate/              # AI content generation
```

### Library Organization

```
lib/
├── supabase/
│   ├── client.ts          # Browser client (SSR-compatible)
│   ├── server.ts          # Server client (cookie-based auth)
│   ├── admin.ts           # Admin client (service role)
│   └── middleware.ts      # Session refresh + route protection
│
├── publishers/            # Platform-specific publishing logic
│   ├── twitter.publisher.ts
│   ├── linkedin.publisher.ts
│   ├── facebook.publisher.ts
│   ├── instagram.publisher.ts
│   ├── tiktok.publisher.ts
│   └── youtube.publisher.ts
│
├── auth/
│   └── oauth.ts          # OAuth utilities (PKCE, state generation, token refresh)
│
├── social/
│   └── token-manager.ts  # Token lifecycle with auto-refresh
│
├── encryption.ts         # AES-256-GCM token encryption
├── rate-limit.ts         # Dual-mode rate limiting (Redis/in-memory)
└── api-error.ts          # Standardized error handling
```

## OAuth Integration Pattern

All social platform integrations follow a consistent 3-step OAuth flow:

### Step 1: Connect (`/api/auth/connect/[platform]`)
- Generates OAuth state (32-char random) and PKCE code_verifier/challenge
- Stores state, verifier, and challenge in secure httpOnly cookies (10-min expiry)
- Redirects to platform's OAuth authorization endpoint with platform-specific scopes

### Step 2: Callback (`/api/auth/callback/[platform]`)
- Validates state parameter against cookie (CSRF protection)
- Exchanges authorization code for access/refresh tokens
- Fetches user profile from platform API
- **Encrypts tokens with AES-256-GCM** before database storage
- Stores in `user_social_connections` table with expiry timestamp

### Step 3: Token Management (`lib/social/token-manager.ts`)
- Auto-refreshes tokens when within 5 minutes of expiry
- Supported refresh flows: Twitter, LinkedIn, Facebook, YouTube
- Marks connection inactive if refresh fails
- Tracks usage count and last used timestamp

**Critical:** All OAuth tokens are encrypted using `lib/encryption.ts` before database storage.

## Publishing Architecture

### Two Publishing Approaches

**1. Direct Publishing** (`/api/social/post`)
- Immediate single-platform posting
- Auto-refreshes expired tokens
- Tracks performance metrics for ML feedback
- Returns post URL immediately

**2. Queue-Based Publishing** (`/api/social-publishing`)
- Multi-platform batch posting
- Supports scheduled posts (future dates)
- Queue status tracking: `publishing` → `published`/`failed`
- Retry mechanism with `retry_count`

### Publisher Interface

All publishers in `lib/publishers/` implement this contract:

```typescript
interface PublishResult {
  success: boolean
  platformPostId?: string
  platformUrl?: string
  error?: string
}
```

**Pattern:** Each publisher loads platform capabilities from `libs/capabilities/social/[platform].json` and implements platform-specific upload/posting logic.

## Campaign Creation Flow

The campaign creation wizard (`app/(portal)/campaigns/create/page.tsx`) uses a **card-based progression** (7 steps):

1. **Basics**: Campaign name, platform selection, account verification
2. **Content Source**: Choose "Trending" (discover viral topics) or "Promote" (market products)
3. **Content Settings**: AI provider, tone, length, target audience, content focus, CTA
4. **AI Generation**: Generate multi-platform content with viral score prediction
5-6. **Review & Edit**: Per-platform content cards with inline editing
7. **Publish**: Schedule and publish to selected platforms

**State Management:** Local state with optional per-platform customization. Supports multi-trend selection for trending campaigns.

## Key Patterns & Conventions

### Authentication Pattern

Use in all API routes:

```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data: { user }, error: authError } = await supabase.auth.getUser()

if (authError || !user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}
```

### Rate Limiting Pattern

Apply to API routes:

```typescript
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit'

const limitError = await rateLimit(request, RateLimitPresets.PUBLISHING)
if (limitError) return limitError
```

**Available Presets:**
- `STANDARD`: 60 requests/minute
- `GENERATION`: 10 requests/minute
- `PUBLISHING`: 10 requests/hour
- `TRENDS`: 30 requests/minute

**Implementation:** Uses Upstash Redis in production, falls back to in-memory Map in development.

### Error Handling Pattern

Use standardized errors from `lib/api-error.ts`:

```typescript
import { AppError, unauthorized, forbidden, notFound } from '@/lib/api-error'

// Throw with custom details
throw new AppError(400, 'Invalid platform', { platform })

// Or use helpers
return unauthorized()
return forbidden()
return notFound('Campaign')
```

### Token Encryption Pattern

Always encrypt tokens before database storage:

```typescript
import { encryptAPIKey, decryptAPIKey } from '@/lib/encryption'

// Encrypt before storing
const encryptedToken = encryptAPIKey(accessToken)

// Decrypt when retrieving
const accessToken = decryptAPIKey(row.access_token_encrypted)
```

Uses AES-256-GCM with authentication tags to prevent tampering.

### Supabase Client Selection

Use the appropriate client for context:

- **Browser/Client Components**: `lib/supabase/client.ts` (uses anon key)
- **Server Components/API Routes**: `lib/supabase/server.ts` (cookie-based auth)
- **Admin Operations**: `lib/supabase/admin.ts` (service role key, bypasses RLS)

## Database Schema

**Key Tables:**
- `user_social_connections` - OAuth tokens (encrypted), expiry, platform metadata
- `social_providers` - Platform configuration (provider_key, scopes, endpoints)
- `campaigns` - Campaign data with platform-specific content
- `profiles` - User profiles with company info and preferences
- `analytics_events` - Event tracking for usage analytics
- `scheduled_posts` - Publishing queue with status tracking

**Middleware:** Handles session refresh on every request and protects authenticated routes.

## Environment Variables

Critical variables validated via Zod schema in `lib/env.ts`:

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `ENCRYPTION_KEY` (32 bytes for AES-256)
- `NEXT_PUBLIC_APP_URL`

**OAuth Credentials (per platform):**
- Twitter: `TWITTER_CLIENT_ID`, `TWITTER_CLIENT_SECRET`
- LinkedIn: `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`
- Facebook: `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`
- Instagram: (uses Facebook credentials)
- TikTok: `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`
- YouTube: `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`

**AI Providers (optional):**
- OpenAI, Anthropic, Google, xAI API keys

**Build-time fallback:** Allows CI/Vercel builds to proceed with placeholder values for optional credentials.

## Testing

- **Unit Tests**: Jest with React Testing Library
- **E2E Tests**: Playwright (configured in `playwright.config.ts`)
- **Component Tests**: Located in `__tests__/` directories
- **Coverage**: `npm run test:coverage`

Test files exist for campaign creation flow components.

## Deployment

**Primary Platform:** Vercel

**Custom Skills:**
- `/deploy` - Triggers git commit + Vercel production deployment
- `/fix-cache` - Adds version query params for Next.js cache busting

**Production Configuration:**
- Upstash Redis for rate limiting and caching
- Security headers (CSP, X-Frame-Options) in `next.config.js`
- Environment variables set in Vercel dashboard
- OAuth redirect URIs must include production domain

## Code Style

- **TypeScript**: Strict mode enabled
- **Path Alias**: `@/*` maps to project root
- **Components**: Memoize expensive components (React.memo)
- **Animations**: Framer Motion with AnimatePresence
- **Styling**: Tailwind CSS with custom Tron theme colors
- **Responsive**: Mobile-first, primary breakpoint at `md` (768px)
