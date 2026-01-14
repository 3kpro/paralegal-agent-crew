- [ ] **Launch Prep**
      - [ ] Set up Supabase production tables
      - [ ] Configure Clerk production keys
      - [ ] Set up Stripe live mode price IDs
      - [ ] Deploy to Vercel

---

## BACKLOG (MVP Features)

### Phase 2: AI Risk Analysis







### Phase 4: Template Library





### Phase 5: User Management







### Phase 6: Payments





### Phase 7: Landing Page







### Phase 8: Polish & Launch




- [ ] **Marketing & Growth**
      - Create ProductHunt listing
      - Prepare social media posts
      - Add to 3kpro.services/factory

---

## COMPLETED

- [x] **Testing**
      - Created comprehensive test suite in `tests/test_files` (risky NDA, clean SoW, non-contract text)
      - Verified end-to-end analysis flow including file upload, parsing, and AI results display
      - Validated custom animations (fade-in-up) and motion-enhanced loading states in a live dev environment
      - Confirmed "Legal Notice" and disclaimer integration on the final report view

- [x] **UI/UX Refinements**
      - Implemented `MobileNav` component for full responsive navigation
      - Added high-fidelity entrance animations using custom Tailwind keyframes
      - Built a full-screen, motion-enhanced loading overlay for AI analysis
      - Standardized toast notifications via `sonner` across all user flows

- [x] **Legal Disclaimer**
      - Created dedicated `/disclaimer` page with comprehensive legal language
      - Standardized "not legal advice" footer messaging across the entire app
      - Integrated persistent legal warnings into the `AnalysisResults` view
      - Added quick links to full disclosure in page footers

- [x] **How It Works**
      - Developed dedicated `/how-it-works` page with detailed 3-step visual guide
      - Implemented "Live Sample Report" preview using the `AnalysisResults` component
      - Integrated walkthrough links across all site headers and footers

- [x] **Homepage**
      - Overhauled landing page with premium 3KPRO aesthetics
      - Implemented responsive hero, benefits, and "How it Works" sections
      - Added high-fidelity social proof components (Testimonials, Logo bar)
      - Integrated "What We Detect" feature showcase with problem/solution positioning

- [x] **Pricing Page**
      - Designed detailed plan comparison table (Free vs Pro vs Lifetime)
      - Integrated Stripe checkout for Monthly/Lifetime upgrades
      - Implemented comprehensive FAQ section for legal and security clarity
      - Added professional footer with legal disclaimers and quick links

- [x] **Template Browser**
      - Created `components/TemplateBrowser.tsx` with search and category filtering
      - Implemented safe `Preview` and `Download` logic with Pro-tier checks
      - Built `app/templates/page.tsx` as the main library hub
      - Added `generateTemplatePDF` to PDF utility for clean document exports

- [x] **Contract Templates**
      - Created 10 professional legal templates in `public/templates/`
      - Defined comprehensive SQL seed script for database population
      - Categorized templates (NDA, Service, Professional, IP, Employment)
      - Marked premium vs free templates for monetization logic

- [x] **Stripe Integration**
      - Integrated `stripe` and `@stripe/stripe-js`
      - Implemented `createCheckoutSession` and Webhook responder
      - Created high-fidelity Pricing Page with Pro Monthly ($14) and Lifetime ($99) tiers
      - Enforced 1-analysis free tier limit with automated redirect to pricing
      - Linked subscription status to Supabase `users` table

- [x] **Analysis History**
      - Created `app/dashboard/page.tsx` for tracking reports
      - Implemented `saveAnalysis` and `getAnalysisHistory` server actions
      - Built `components/HistoryList.tsx` with risk scores and report retrieval
      - Linked analysis results directly to user accounts via Supabase

- [x] **Database Schema**
      - Defined SQL migration `20240114000000_initial_schema.sql`
      - Created `users`, `analyses`, and `templates` tables
      - Enabled RLS policies for secure access

- [x] **Authentication**
      - Integrated `@clerk/nextjs`
      - Added `middleware.ts` to protect all routes except homepage
      - Created Sign-In (`/sign-in`) and Sign-Up (`/sign-up`) pages
      - Updated `app/layout.tsx` with `<ClerkProvider>`
      - Added UserButton to `/analyze` header

- [x] **PDF Report Export**
      - Installed `jspdf` and `jspdf-autotable`
      - Created `lib/pdf-generator.ts` with professional branding
      - Implemented downloadable risk report with color-coded tables
      - Added "Download Report" button to Results UI

- [x] **Analysis Results UI**
      - Created `components/AnalysisResults.tsx` to visualize findings
      - Implemented severity-based color coding (Red/Orange/Blue)
      - Added dynamic risk counters and summary display
      - Integrated results view into `/analyze` page

- [x] **Risk Detection Engine**
      - Engine delivered via System Prompt v1 (`lib/prompts.ts`)
      - Covers 6 key risk categories (Payment, Liability, IP, Termination, Non-Compete, Scope)
      - Validated through `analyzeContractText` server action

- [x] **Claude API Integration**
      - Created `lib/claude.ts` client initialization
      - Defined expert System Prompt in `lib/prompts.ts` with risk categories
      - Enabled Structured Output (JSON) with Zod validation
      - Created secure server action `analyzeContractText`
      - Implemented UI integration in `/analyze`

- [x] **Document Parsing**
      - Installed parsing libraries (`pdf-parse`, `mammoth`)
      - Created `lib/document-parser.ts` utility
      - Implemented PDF, DOCX, and TXT parsing with text cleanup
      - Created server action `extractContractText` for secure file handling

- [x] **File Upload System**
      - Implemented drag-and-drop upload (react-dropzone)
      - Supported PDF, DOCX, TXT formats
      - Added file validation (max 10MB)
      - Added loading states and error handling in `components/FileUpload.tsx` and `app/analyze/page.tsx`

- [x] **Project Scaffolding**
      - Created Next.js 14 project with TypeScript
      - Set up directory structure (app/, components/, lib/, supabase/)
      - Added `.env.local` template with required API keys (Anthropic, Supabase, Stripe)
      - Configured dependencies (pdf-parse, mammoth, react-dropzone, Claude SDK)
      - Created homepage with professional UI
      - Designed database schema (profiles, analyses, templates, stripe_events)

---

## NOTES

**Priority:** Upload → Parse → Analyze → Report (core flow first)
**Focus:** Accuracy of risk detection is critical (users trust AI output)
**Launch Goal:** 10 paying customers by 2026-03-01

**Risk Detection Examples to Test:**
- "Net 90 days" → Flag as "Slow payment (industry standard is Net 30)"
- "Client owns all IP" → Flag as "Broad IP transfer (includes pre-existing work?)"
- "No termination clause" → Flag as "Missing termination terms"

**Claude Prompt Strategy:**
Use structured prompts with few-shot examples of risky clauses. Ask for JSON output with:
```json
{
  "risks": [
    {
      "category": "Payment Terms",
      "severity": "Medium",
      "clause": "Payment due Net 90 days",
      "issue": "Extended payment timeline beyond industry standard",
      "suggestion": "Negotiate Net 30 or Net 60 with late fees"
    }
  ]
}
```
