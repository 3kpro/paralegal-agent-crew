# Statement of Truth - ExtensionAudit

## Core Purpose
Give IT and security teams visibility into browser extensions installed across the organization, risk-score them by permissions, and enforce compliance policies.

## Target User
- IT security teams at mid-size companies (100-1000 employees)
- Compliance officers documenting endpoint security
- MSPs managing multiple client environments
- CISOs building shadow IT visibility programs

## Value Proposition
Browser extensions are a blind spot. We make them visible and auditable.

## MVP Features (v1.0 ONLY)
- [ ] Lightweight agent/extension for Chrome (inventory installed extensions)
- [ ] Permission risk scoring (dangerous permission combinations)
- [ ] Extension intelligence database (known malicious/risky extensions)
- [ ] Policy enforcement (allowlist/blocklist)
- [ ] Basic admin dashboard

## Anti-Scope (DO NOT BUILD)
- Browser activity monitoring (extensions only)
- Firefox/Safari support (Chrome/Edge only for MVP)
- Auto-remediation without approval
- Full endpoint security (use CrowdStrike)

## Tech Stack
- Agent: Chrome extension for inventory collection
- Backend: Node.js or Go for policy evaluation
- Database: PostgreSQL for inventory, Redis for real-time
- Admin Console: React dashboard
- Deployment: Google Workspace Admin, Azure AD integration

## Monetization
- Starter: $4/user/month — inventory + risk scoring (100 user min)
- Business: $7/user/month — policy enforcement, alerts
- Enterprise: $10/user/month — SIEM integration, custom policies

## Current Phase
- [ ] Research & Validation
- [ ] MVP Build

## Session Log
| Date | Agent/Human | Action | Outcome |
|------|-------------|--------|---------|
| 2026-01-11 | Claude Opus | Scaffolding | Created TRUTH.md and directory structure |
