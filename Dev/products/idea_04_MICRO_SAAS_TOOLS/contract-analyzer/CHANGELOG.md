# CHANGELOG - ContractGuard AI

All notable changes to this project will be documented in this file.

---

## [Unreleased]

### 2026-01-11 - Project Scaffolding

**Files Created:**
- `TRUTH.md` - Product vision and strategy
- `TASKS.md` - Feature roadmap and task breakdown
- `package.json` - Dependencies (Next.js, Claude API, pdf-parse, mammoth, Stripe)
- `tsconfig.json` - TypeScript configuration
- `next.config.ts` - Next.js configuration with 10MB file upload limit
- `tailwind.config.ts` - Tailwind CSS setup
- `postcss.config.mjs` - PostCSS configuration
- `.gitignore` - Git ignore rules
- `.env.local.template` - Environment variables template
- `app/layout.tsx` - Root layout with Inter font
- `app/globals.css` - Global styles and Tailwind imports
- `app/page.tsx` - Homepage with hero, features, and CTA sections
- `README.md` - Project documentation
- `supabase/schema.sql` - Database schema for profiles, analyses, templates, and Stripe events

**What Was Accomplished:**
- Initialized Next.js 14 project structure
- Configured TypeScript, Tailwind CSS, and build tools
- Created homepage with professional UI (blue/green color scheme)
- Designed database schema with RLS policies
- Set up required dependencies:
  - `@anthropic-ai/sdk` for Claude API
  - `pdf-parse` for PDF document parsing
  - `mammoth` for Word document parsing
  - `react-dropzone` for file uploads
  - `stripe` for payments
  - `jspdf` for PDF report generation

**Next Steps:**
- Install dependencies (`npm install`)
- Create upload/analyze page
- Implement document parsing logic
- Build Claude API integration for risk detection

---

## Instructions for Agent

When continuing work on this project:

1. **Read `TASKS.md`** to see what's in the NOW section
2. **Update this CHANGELOG** when completing tasks
3. **Mark tasks complete** in TASKS.md by changing `[ ]` to `[x]`
4. **Move next task** from BACKLOG to NOW when ready
5. **Follow the Agent Contract** (see `../AGENT_CONTRACT.md`)

Remember: One task at a time. Human review between tasks.
