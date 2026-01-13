# Statement of Truth - Micro-SaaS Tools (Invoice Generator - Tool 1)

## Core Purpose
Provide a simple, professional invoice generation tool for freelancers and small agencies who need clean billing without complex accounting software.

## Target User
Freelancers, contractors, and small agencies (<5 employees) who:
- Send 5-20 invoices per month
- Don't need full accounting software (QuickBooks is overkill)
- Want professional-looking invoices in seconds
- Need invoice tracking and email delivery

## Value Proposition
Create professional invoices in 2 minutes instead of 30 minutes with Word/Excel. Auto-numbered, branded, with one-click PDF + email.

## MVP Features (v1.0 ONLY)
- [ ] **Invoice Creation Form**
  - Client name, email, address
  - Line items (description, quantity, rate, amount)
  - Auto-calculated totals (subtotal, tax, total due)
  - Auto-numbering (INV-001, INV-002...)

- [ ] **Professional Templates**
  - 5 pre-designed templates (modern, minimal, corporate, creative, bold)
  - Logo upload (user's branding)
  - Color customization

- [ ] **Export & Delivery**
  - PDF export (download)
  - Email invoice directly to client
  - Invoice preview before sending

- [ ] **Basic Tracking**
  - Invoice history (list of all created invoices)
  - Status: Draft, Sent, Paid
  - Simple search/filter by client or date

## Anti-Scope (DO NOT BUILD)
- Full accounting features (expenses, reports, reconciliation) → Use QuickBooks
- Payment processing (Stripe checkout links) → v2 feature
- Recurring invoices/subscriptions → v2 feature
- Multi-user/team accounts → Keep it single-user for v1
- Mobile app → Web-only for v1

## Tech Stack
- Frontend: Next.js (React)
- Auth: Clerk or NextAuth
- Database: Supabase (PostgreSQL)
- PDF Generation: jsPDF or react-pdf
- Email: Resend or SendGrid
- Hosting: Vercel

## Monetization
- Model: Subscription + Lifetime Deal
- Price Point: $9/mo or $79 lifetime
- Sales Channel: Gumroad + 3kpro.services marketplace
- Target: 200 customers × $9 = $1,800 MRR in Year 1

## Timeline
- MVP Complete: 2026-02-15 (3 weeks)
- Beta Users: 2026-02-20 (get 10 testers)
- Public Launch: 2026-03-01
- Milestone: 50 customers by 2026-04-01

## Current Phase
- [ ] Research & Validation
- [ ] MVP Build (Tool 1 - Invoice Generator)
- [ ] Internal Testing
- [ ] Beta Testing
- [ ] Package & Deploy
- [ ] Launch & Market

## Future Tools (Post-MVP)
This is **Tool 1** of 4 planned micro-SaaS tools:
1. ✅ Invoice Generator (MVP)
2. Contract Analyzer (Q2 2026)
3. Social Media Caption Generator (Q3 2026)
4. Email Sequence Builder (Q4 2026)

Bundle pricing: $30/mo for all 4 tools once complete.

## Session Log
| Date | Agent/Human | Action | Outcome |
|------|-------------|--------|---------|
| 2026-01-09 | Claude | Scaffolding | Created TRUTH.md and directory structure |
