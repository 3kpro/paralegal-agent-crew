# Statement of Truth - LaunchRadar

## Core Purpose
Automatically track competitor feature releases, pricing changes, and positioning shifts by monitoring their marketing sites, changelogs, and public communications.

## Target User
- Product managers tracking competitive landscape
- Product marketing managers positioning against competitors
- Founders in competitive markets
- Strategy teams at growth-stage startups

## Value Proposition
Know when competitors ship before your customers tell you.

## MVP Features (v1.0 ONLY)
- [ ] Competitor watchlist (define by domain)
- [ ] Change detection (marketing site, changelog, pricing page)
- [ ] AI change summarization (natural language, not raw diffs)
- [ ] Slack/email digests by competitor
- [ ] Basic feature matrix (manual initially)

## Anti-Scope (DO NOT BUILD)
- Win/loss analysis (requires sales data)
- Battlecard automation (v2)
- Social media monitoring
- Review site aggregation (G2, Capterra)

## Tech Stack
- Scraping: Playwright for JS-rendered pages
- Diff Engine: Semantic diffing (content, not HTML)
- AI Layer: Claude for summarization and classification
- Database: PostgreSQL for change history
- Storage: S3 for page snapshots
- Frontend: React with timeline view

## Monetization
- Starter: $79/month — 5 competitors, weekly
- Growth: $199/month — 15 competitors, daily
- Pro: $399/month — 50 competitors, battlecards

## Current Phase
- [ ] Research & Validation
- [ ] MVP Build

## Session Log
| Date | Agent/Human | Action | Outcome |
|------|-------------|--------|---------|
| 2026-01-11 | Claude Opus | Scaffolding | Created TRUTH.md and directory structure |
