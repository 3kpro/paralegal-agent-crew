# Statement of Truth - VendorScope

## Core Purpose
Automate vendor security assessments by aggregating pre-built intelligence on common SaaS tools and using AI to analyze vendor documentation against custom risk frameworks.

## Target User
- IT procurement managers
- Security/GRC analysts doing vendor reviews
- Startup ops teams evaluating new tools
- Compliance officers maintaining vendor inventories

## Value Proposition
Cut vendor assessment time from days to minutes with pre-populated security profiles and AI-powered risk analysis.

## MVP Features (v1.0 ONLY)
- [ ] Vendor intelligence database (500+ common SaaS tools)
- [ ] Document auto-fetch (Trust Center, SOC 2 reports, privacy policies)
- [ ] AI risk scoring against standard framework
- [ ] Questionnaire auto-fill from vendor docs
- [ ] Basic comparison view (2-3 vendors side-by-side)

## Anti-Scope (DO NOT BUILD)
- Custom risk framework builder (use standard framework for MVP)
- Vendor outreach/communication features
- Contract management
- Continuous monitoring (point-in-time assessment only)

## Tech Stack
- Backend: Python for scraping and document processing
- Database: PostgreSQL + vector DB (Pinecone) for document search
- AI Layer: Claude API for analysis and questionnaire generation
- Scraping: Playwright for dynamic Trust Center pages
- Storage: S3 for cached vendor documents
- Frontend: React dashboard

## Monetization
- Model: Monthly SaaS subscription
- Starter: $199/month — 10 assessments/month
- Business: $499/month — 50 assessments, auto-fill
- Enterprise: $999/month — unlimited, custom frameworks

## Timeline
- MVP Complete: TBD
- Beta Users: TBD
- Public Launch: TBD

## Current Phase
- [ ] Research & Validation
- [ ] MVP Build
- [ ] Internal Testing
- [ ] Beta Testing
- [ ] Package & Deploy
- [ ] Launch & Market

## Session Log
| Date | Agent/Human | Action | Outcome |
|------|-------------|--------|---------|
| 2026-01-11 | Claude Opus | Scaffolding | Created TRUTH.md and directory structure |
