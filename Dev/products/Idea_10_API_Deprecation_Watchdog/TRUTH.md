# Statement of Truth - BreakingChange

## Core Purpose
Monitor third-party API changelogs, deprecation notices, and breaking changes across all your integrations, alerting teams before production breaks.

## Target User
- Backend engineers managing multiple API integrations
- Platform/DevOps teams responsible for integration health
- Engineering managers needing visibility into technical debt
- CTOs at API-heavy startups (fintech, marketplaces)

## Value Proposition
Discover breaking changes when they're announced, not when production breaks.

## MVP Features (v1.0 ONLY)
- [ ] Integration registry (declare APIs you depend on)
- [ ] Multi-source monitoring (changelogs, RSS, GitHub releases)
- [ ] AI change classification (breaking vs minor)
- [ ] Slack/email alerts by severity
- [ ] Deprecation timeline calendar view

## Anti-Scope (DO NOT BUILD)
- Codebase scanning for deprecated usage (v2)
- Auto-fix suggestions (v2)
- Package/dependency monitoring (use Dependabot)
- API testing or uptime monitoring

## Tech Stack
- Backend: Python for scraping and classification
- Database: PostgreSQL for registry and change history
- Queue: Celery + Redis for monitoring jobs
- AI Layer: Claude API for change classification
- Scraping: RSS parsing, Playwright, Twitter/X API
- Frontend: React dashboard with timeline

## Monetization
- Free: 5 APIs, email digest
- Pro: $39/month — 25 APIs, Slack alerts
- Team: $99/month — unlimited, severity filtering

## Current Phase
- [ ] Research & Validation
- [ ] MVP Build

## Session Log
| Date | Agent/Human | Action | Outcome |
|------|-------------|--------|---------|
| 2026-01-11 | Claude Opus | Scaffolding | Created TRUTH.md and directory structure |
