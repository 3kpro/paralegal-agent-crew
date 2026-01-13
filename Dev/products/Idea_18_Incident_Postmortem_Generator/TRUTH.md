# Statement of Truth - PostmortemAI

## Core Purpose
Auto-generate incident postmortems by aggregating Slack threads, PagerDuty alerts, and deployment logs, then using AI to construct the narrative and extract action items.

## Target User
- Engineering managers responsible for incident management
- SRE/Platform teams maintaining reliability practices
- On-call engineers tired of writing postmortems
- Engineering leadership wanting pattern visibility

## Value Proposition
Postmortems that actually get written — because they write themselves.

## MVP Features (v1.0 ONLY)
- [ ] Slack thread ingestion (incident channels)
- [ ] PagerDuty alert timeline
- [ ] AI narrative generation ("what happened")
- [ ] Action item extraction from conversation
- [ ] Export to Notion/Confluence/Google Docs

## Anti-Scope (DO NOT BUILD)
- Incident response orchestration (use Incident.io)
- Alerting/on-call scheduling (use PagerDuty)
- Root cause analysis AI (v2)
- Cross-incident pattern detection (v2)

## Tech Stack
- Integrations: Slack API, PagerDuty API, GitHub deployments
- AI Layer: Claude for narrative and action item extraction
- Backend: Python for aggregation
- Database: PostgreSQL for postmortem storage
- Frontend: React editor with structured sections
- Export: Notion API, Confluence API, Google Docs API

## Monetization
- Team: $199/month — 20 incidents/month
- Growth: $399/month — 50 incidents, pattern detection
- Enterprise: $799/month — unlimited, custom templates

## Current Phase
- [ ] Research & Validation
- [ ] MVP Build

## Session Log
| Date | Agent/Human | Action | Outcome |
|------|-------------|--------|---------|
| 2026-01-11 | Claude Opus | Scaffolding | Created TRUTH.md and directory structure |
