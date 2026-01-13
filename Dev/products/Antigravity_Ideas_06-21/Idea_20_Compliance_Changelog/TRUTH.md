# Statement of Truth - RegWatch

## Core Purpose
Monitor regulatory changes across federal and state sources, filter by relevance to your business, and deliver plain-language summaries with compliance deadlines.

## Target User
- Compliance officers at healthcare providers
- Legal/compliance teams at fintech companies
- Operations leaders at cannabis companies
- Consultants serving regulated industries

## Value Proposition
Never miss a regulatory change that affects your business again.

## MVP Features (v1.0 ONLY)
- [ ] Source aggregation (Federal Register, state agencies)
- [ ] AI relevance filtering (by industry, geography)
- [ ] Plain language summaries (what changed, who's affected, when)
- [ ] Compliance calendar (deadlines, effective dates)
- [ ] Email/Slack digests

## Anti-Scope (DO NOT BUILD)
- Legal advice or interpretation
- Policy/procedure document generation
- Audit management
- Multi-jurisdiction comparison tools (v2)

## Tech Stack
- Scraping: Playwright, Scrapy for government sites
- AI Layer: Claude for relevance filtering and summarization
- Database: PostgreSQL + Elasticsearch for search
- Scheduler: Temporal for monitoring jobs
- Frontend: React with calendar view
- Notifications: Email, Slack, webhooks

## Monetization
- Essential: $249/month — single domain, one state
- Professional: $499/month — multi-domain, multi-state
- Enterprise: $999/month — unlimited, API access

## Current Phase
- [ ] Research & Validation
- [ ] MVP Build

## Session Log
| Date | Agent/Human | Action | Outcome |
|------|-------------|--------|---------|
| 2026-01-11 | Claude Opus | Scaffolding | Created TRUTH.md and directory structure |
