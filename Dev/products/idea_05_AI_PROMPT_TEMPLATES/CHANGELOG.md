# CHANGELOG - AI Prompt Templates Marketplace

All notable changes to the AI Prompt Templates Marketplace.

---

## [2026-01-10] - Local Environment Configuration

### Changed
- Updated local development port to `3004` to avoid conflict with existing Xelora project.
- Updated `package.json` dev script and `.env.local` `NEXTAUTH_URL`.

## [2026-01-10] - Landing Page

### Added
- Created `app/page.tsx` as the main landing page with:
  - Hero Section containing value proposition and call-to-actions.
  - Features Section highlighting instant results, expert curation, and verification.
  - Featured Prompts Section displaying a subset (slice) of MOCK_PROMPTS.
  - Call To Action (CTA) section.
- Moved previous Library page to `app/library/page.tsx` to serve as the full browse view.
- Updated Navigation in Header and Prompt Detail pages to correctly link between Landing, Library, Bundles, and Dashboard.

## [2026-01-10] - Bundle Offers

### Added
- Created `app/bundles/page.tsx` displaying premium bundle offers.
- Created `components/ui/BundleCard.tsx` with unified checkout flow.
- Added 3 Curated Bundles to `MOCK_BUNDLES` in `lib/mockData.ts`:
  - Marketing Super Pack ($49)
  - Content Creator Toolkit ($69)
  - Business Automation Suite ($59)
- Updated Stripe Webhook and Checkout API to handle Bundle product types.

## [2026-01-10] - User Dashboard

### Added
- Created `app/dashboard/page.tsx` displaying purchase history (mocked).
- Created `components/dashboard/PurchasedPromptCard.tsx` with:
  - Copy to Clipboard functionality.
  - Download as .txt file functionality.
  - Full prompt text visibility.
- Added empty state handling with navigation back to library.

## [2026-01-10] - Stripe Integration

### Added
- Created `lib/stripe.ts` and `lib/supabase-admin.ts` for server-side operations.
- Implemented `/api/checkout` route to create Stripe Sessions.
- Implemented `/api/webhook/stripe` route to fulfill purchases in Supabase.
- Created `components/purchase/PurchaseCard.tsx` to handle client-side checkout.
- Updated `types/supabase.ts` with complete schema definitions.
- Verified build passes with validated environment variables.

## [2026-01-10] - Prompt Detail Page

### Added
- Created `app/prompt/[slug]/page.tsx` for individual prompt display.
- Implemented blurred full-text preview with "Unlock" CTA.
- Added use case breakdown and example output sections.
- Updated `PromptCard` to link to detail pages.
- Verified flow with mock data.

## [2026-01-10] - Prompt Library Page

### Added
- Created `components/ui/PromptCard.tsx` with category-based styling.
- Implemented `app/page.tsx` main view with:
  - Sidebar category filters.
  - Search and Sort toolbar.
  - Responsive Grid layout.
- Added `lib/mockData.ts` to populate UI before database connection.
- Added `types/supabase.ts` and `lib/supabase.ts` for future data integration.

## [2026-01-10] - Database Schema Design

### Added
- Created `supabase/schema.sql` defining:
  - `profiles` (linked to auth.users)
  - `prompts` (core product data)
  - `bundles` & `bundle_items` (product packaging)
  - `purchases` (transaction history)
- Implemented Row Level Security (RLS) policies for all tables.

## [2026-01-10] - Project Scaffolding

### Added
- Initialized Next.js project (`prompt-marketplace`) with:
  - TypeScript
  - Tailwind CSS
  - App Router
- Installed dependencies:
  - `@supabase/supabase-js`
  - `@supabase/auth-helpers-nextjs`
  - `next-auth`
  - `stripe`
- Created `.env.local` template.
- Verified build with `npm run build`.

## [2026-01-10] - Prompt Curation

### Added
- Created 50 curated MVP prompts across 5 categories:
  - 10 Marketing Prompts
  - 15 Content Creation Prompts
  - 10 Code & Development Prompts
  - 10 Business Operations Prompts
  - 5 Creative Writing Prompts
- Created `scaffold_prompts.ps1` script to manage and regenerate prompt files.

---

## [Unreleased]

### Planned
- Build marketplace website
- Stripe integration for one-time purchases
- User dashboard for purchased prompts
- Bundle offerings

---

## [2026-01-09] - Project Scaffolding

### Added
- Created TRUTH.md (product vision and scope)
- Created TASKS.md (MVP feature breakdown)
- Created CHANGELOG.md (this file)
- Created opencode.md (agent contract)

### Context
- Target: Content creators, marketers, developers using AI daily
- Monetization: $5-$15 per prompt, $49-$69 bundles
- Launch goal: 2026-04-01

---

## Notes

**Version Format:** [YYYY-MM-DD] - Description

**Categories:**
- **Added** - New features
- **Changed** - Changes to existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security updates
