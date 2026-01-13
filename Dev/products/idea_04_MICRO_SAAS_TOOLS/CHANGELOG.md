# CHANGELOG - Micro-SaaS Tools

All notable changes to the Micro-SaaS product line.

## Active Projects

- **Tool 1: Invoice Generator** - COMPLETE (MVP launched)
- **Tool 2: ContractGuard AI** - IN PROGRESS (scaffolding complete)
- **Tool 3: Social Media Caption Generator** - NOT STARTED
- **Tool 4: Email Sequence Builder** - NOT STARTED

---

## [2026-01-11] - ContractGuard AI - Project Scaffolding

**What Was Built:**
- Initialized Next.js 14 project with TypeScript
- Created product vision in `contract-analyzer/TRUTH.md`
- Designed MVP feature roadmap in `contract-analyzer/TASKS.md`
- Built homepage with professional UI (blue/green theme)
- Designed database schema for Supabase
- Configured all necessary dependencies:
  - Anthropic Claude SDK for AI analysis
  - pdf-parse for PDF document parsing
  - mammoth for Word document extraction
  - react-dropzone for file uploads
  - Stripe for payments
  - jspdf for report generation

**Files Created:**
- `contract-analyzer/TRUTH.md` - Product vision
- `contract-analyzer/TASKS.md` - Feature roadmap
- `contract-analyzer/package.json` - Dependencies
- `contract-analyzer/app/page.tsx` - Homepage
- `contract-analyzer/supabase/schema.sql` - Database schema
- Configuration files (tsconfig, tailwind, next.config)

**Next Step:** File Upload System

---

## [Unreleased]

### Planned
- Invoice creation form
- PDF export
- Email delivery
- 5 professional templates
- Invoice history tracking

---

## [2026-01-10] - Initial Codebase Setup

### Added
- Initialized Next.js 14 project (`invoice-generator`) with TypeScript and Tailwind CSS.
- Added `.env.local` template with Supabase, Clerk, Resend, and Stripe placeholders.
- Established project directory structure.
- Designed Supabase SQL schema (`supabase/schema.sql`) including:
  - `profiles` table linked to Auth.
  - `invoices` table with details, financials, and status.
  - `invoice_items` table for line items.
  - Row Level Security (RLS) policies for data protection.
- Implemented **Invoice Creation Form** UI:
  - Created reusable UI components: `Card`, `Button`, `Input`, `Label`.
  - Built interactive form with client details and dynamic line items.
  - Added auto-calculation for subtotal, tax, and total.
  - Added auto-generation of invoice numbers.
  - Applied premium glassmorphism and gradient aesthetics.
- Implemented **PDF Export**:
  - Integrated `html2canvas` and `jspdf` for client-side generation.
  - Created hidden `InvoicePreview` component for clean A4 rendering.
  - Added "Download PDF" button with loading state.
- Implemented **Template System**:
  - Created 5 professional templates (`Standard`, `Corporate`, `Modern`, `Minimal`, `Bold`).
  - Added company logo upload functionality.
  - Added accent color picker for brand customization.
  - Built interactive template selector.
- Implemented **Email Delivery**:
  - Integrated `resend` for seamless email delivery.
  - Created server-side API route for secure email handling.
  - Added "Send via Email" modal with custom message composition.
  - Implemented automatic PDF attachment generation and sending.
- Implemented **Invoice History**:
  - Connected Supabase Auth/DB for saving and retrieving invoices.
  - Created `/invoices` dashboard page.
  - Added client-side search and filtering logic.
  - Added sign-in page (`/login`) for authentication.
- Implemented **Stripe Integration**:
  - Set up Stripe Checkout for subscription ($9/mo) and lifetime ($79) deals.
  - Created `/pricing` page with comparison cards.
  - Added backend API for creating checkout sessions.
  - Prepared `profiles` table schema for subscription tracking.

---

## [2026-01-09] - Project Scaffolding

### Added
- Created TRUTH.md (product vision and scope)
- Created TASKS.md (MVP feature breakdown)
- Created CHANGELOG.md (this file)
- Created opencode.md (agent contract)

### Context
- Tool 1 of 4 planned micro-SaaS tools
- Target: Freelancers needing simple invoicing
- Launch goal: 2026-03-01

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
