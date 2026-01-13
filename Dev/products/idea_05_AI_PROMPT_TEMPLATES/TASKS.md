# TASKS.md - AI Prompt Templates Marketplace
Last Updated: 2026-01-09

## NOW (One at a time only)

- [ ] (No tasks currently in NOW)

---

## BACKLOG (MVP Features)

















---

## COMPLETED
- [x] **Local Environment Configuration** (2026-01-10)
      - Changed `npm run dev` to run on port 3004 to avoid conflicts.
      - Updated `NEXTAUTH_URL` in env.

- [x] **Landing Page** (2026-01-10)
      - Implemented high-conversion Landing Page with Hero, Features, Featured Prompts, and CTA.
      - Restructured application routing to support Landing (`/`) vs Library (`/library`) separation.

- [x] **Bundle Offers** (2026-01-10)
      - Created `/bundles` page and `BundleCard` component.
      - Integrated bundles into Stripe checkout implementation.

- [x] **User Dashboard** (2026-01-10)
      - Dashboard page listing purchased prompts (mocked).
      - Copy & Download functionality added.

- [x] **Stripe Integration** (2026-01-10)
      - Implemented Checkout Session API and Webhook handler.
      - Integrated "Buy Now" button with Stripe flow.

- [x] **Prompt Detail Page** (2026-01-10)
      - Detail page with blurred preview, example inputs/outputs, and Buy CTA.
      - Linked from library grid.

- [x] **Prompt Library Page** (2026-01-10)
      - Implemented responsive grid with Sidebar Filters, Search, and Sort.
      - Uses `PromptCard` component with visual polish.

- [x] **Database Schema Design** (2026-01-10)
      - Defined SQL schema for `profiles`, `prompts`, `bundles`, and `purchases` in `prompt-marketplace/supabase/schema.sql`.

- [x] **Project Scaffolding** (2026-01-10)
      - Initialized Next.js app, installed dependencies (Supabase, NextAuth, Stripe), created env template, verified build.

- [x] **Curate 50 MVP Prompts** (2026-01-10)
      - Created 50 markdown files in `prompts/` directory using `scaffold_prompts.ps1`
      - Includes full prompt text, example outputs, and use cases.

---

## NOTES

**Priority:** Curate high-quality prompts FIRST. Marketplace is useless without great content.
**Focus:** Quality over quantity. 50 great prompts > 200 mediocre ones.
**Launch Goal:** 100 prompt sales by 2026-05-01
