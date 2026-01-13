# TASKS.md - ContractGuard AI (Tool 2)
Last Updated: 2026-01-11

## NOW (One at a time only)

- [ ] **File Upload System**
      - Implement drag-and-drop upload (react-dropzone)
      - Support PDF, DOCX, TXT formats
      - File validation (max 10MB, contract types only)
      - Loading states and error handling

---

## BACKLOG (MVP Features)

### Phase 1: Document Processing

- [ ] **Document Parsing**
      - PDF extraction (pdf-parse or PDF.js)
      - Word document extraction (mammoth.js)
      - Text extraction and cleanup
      - Section identification (payment, liability, IP, etc.)

### Phase 2: AI Risk Analysis

- [ ] **Claude API Integration**
      - Create system prompt for contract analysis
      - Define risk categories and severity levels
      - Implement structured output (JSON format)
      - Add retry logic and error handling

- [ ] **Risk Detection Engine**
      - Analyze payment terms (Net days, missing schedules)
      - Check liability clauses (unlimited, one-sided)
      - Review IP ownership (work-for-hire, portfolio rights)
      - Scan termination terms (notice, kill fees)
      - Detect non-compete issues (geography, duration)
      - Flag missing critical clauses

### Phase 3: Report Generation

- [ ] **Analysis Results UI**
      - Display risk summary (Critical, Medium, Low counts)
      - Show flagged clauses with context
      - Plain-English explanations for each risk
      - Suggested fixes/edits for problematic clauses

- [ ] **PDF Report Export**
      - Design professional report template
      - Include company branding
      - Highlight risks with color coding
      - Add legal disclaimer
      - Generate downloadable PDF (jspdf or react-pdf)

### Phase 4: Template Library

- [ ] **Contract Templates**
      - Create 10 pre-reviewed templates
      - NDAs (Mutual, One-Way)
      - Freelance Service Agreement
      - Statement of Work (SoW)
      - Consulting Agreement
      - Independent Contractor Agreement
      - Master Services Agreement (MSA)
      - Work-for-Hire Agreement
      - Non-Compete Agreement
      - Confidentiality Agreement

- [ ] **Template Browser**
      - List templates with descriptions
      - Preview templates
      - Download as PDF or DOCX
      - Search and filter by type

### Phase 5: User Management

- [ ] **Authentication**
      - Integrate Clerk for auth
      - Sign up / Sign in pages
      - Protected routes (dashboard, analysis history)
      - Free tier: 1 analysis (no credit card)

- [ ] **Database Schema**
      - Create Supabase tables
      - `users` (profile, subscription)
      - `analyses` (document, results, timestamp)
      - `templates` (name, category, file URL)
      - RLS policies for data security

- [ ] **Analysis History**
      - Dashboard showing past analyses
      - View previous reports
      - Re-download PDFs
      - Delete old analyses
      - Usage limits based on plan

### Phase 6: Payments

- [ ] **Stripe Integration**
      - Create products (Monthly $14, Lifetime $99)
      - Implement Stripe Checkout
      - Webhook for subscription events
      - Update user subscription status in DB
      - Handle free tier limits (1 analysis)

- [ ] **Pricing Page**
      - Compare Free vs Monthly vs Lifetime
      - Feature comparison table
      - CTA buttons for each plan
      - FAQ section

### Phase 7: Landing Page

- [ ] **Homepage**
      - Hero section with value prop
      - Demo video or screenshot
      - Key benefits (speed, cost, accuracy)
      - Social proof (testimonials if available)
      - CTA: Try Free Analysis

- [ ] **How It Works**
      - 3-step process (Upload → Analyze → Review)
      - Visual walkthrough
      - Sample report preview

- [ ] **Legal Disclaimer**
      - Footer text
      - Dedicated /disclaimer page
      - Clear "not legal advice" messaging

### Phase 8: Polish & Launch

- [ ] **UI/UX Refinements**
      - Mobile responsive design
      - Loading states and animations
      - Toast notifications for actions
      - Accessibility (ARIA labels, keyboard nav)

- [ ] **Testing**
      - Test with sample contracts (NDA, SoW)
      - Verify risk detection accuracy
      - Test payment flows (Stripe test mode)
      - Cross-browser testing

- [ ] **Launch Prep**
      - Set up domain (contractguard.ai or similar)
      - Deploy to Vercel
      - Create ProductHunt listing
      - Prepare social media posts
      - Add to 3kpro.services/factory

---

## COMPLETED

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
