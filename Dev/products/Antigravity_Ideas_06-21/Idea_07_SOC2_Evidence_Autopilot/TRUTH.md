# Statement of Truth - ComplianceGhost

## Core Purpose
Automate the tedious collection of SOC 2 audit evidence by connecting to your cloud infrastructure and business tools, capturing screenshots and logs on schedule, and mapping them to specific control requirements.

## Target User
- Startup CTOs and engineering managers (Series A-C)
- Compliance officers at SaaS companies
- DevOps/Platform teams responsible for audit prep
- Consultants helping multiple clients achieve SOC 2

## Value Proposition
Save 200-400 hours per audit cycle. Stop rebuilding evidence packages from scratch every year.

## MVP Features (v1.0 ONLY)
- [ ] OAuth connectors for AWS, GitHub, Okta (3 core integrations)
- [ ] Scheduled evidence capture (screenshots, log exports)
- [ ] Evidence-to-control mapping (manual assignment initially)
- [ ] Basic dashboard showing evidence inventory and gaps
- [ ] Export evidence package as ZIP for auditors

## Anti-Scope (DO NOT BUILD)
- Full compliance management platform (evidence only)
- Policy document generation (use existing tools)
- Auditor communication/workflow features
- SOC 1 or HIPAA (SOC 2 Type II only for MVP)

## Tech Stack
- Backend: Node.js or Python (FastAPI)
- Database: PostgreSQL with audit logging
- Queue: Redis + Bull for scheduled capture jobs
- Storage: S3-compatible for evidence files
- AI Layer: Claude API for evidence-to-control suggestions (v1.1)
- Frontend: React dashboard

## Monetization
- Model: Monthly SaaS subscription
- Starter: $299/month — up to 10 integrations
- Growth: $599/month — unlimited integrations, AI matching
- Enterprise: $1,200/month — SSO, custom frameworks

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
