# Statement of Truth - OAuth Token Manager

## Core Purpose
A standalone dashboard for Creators and Agencies to manage, monitor, and auto-refresh social media OAuth tokens to prevent broken automation.

## Target User
Automation Engineers (n8n/Zapier users) and Agency Owners who manage multiple client social accounts.

## Value Proposition
Prevent "Zombie Automations" caused by expired tokens. One place to check health for 50+ clients.

## MVP Features (v1.0 ONLY)
- [ ] **Multi-Platform Auth**: Connect Instagram, TikTok, LinkedIn, Twitter (Basic).
- [ ] **Health Dashboard**: Green/Red status for all stored tokens.
- [ ] **Auto-Refresh Daemon**: Scheduled job to refresh tokens before expiry.
- [ ] **Expose New Token**: Secure API endpoint to fetch the *fresh* token for use in n8n.

## Anti-Scope (DO NOT BUILD)
- Posting Content (This is NOT a social media manager).
- Analytics (This is strictly Infrastructure).
- User Management (Start with Single User / Personal tool).

## Tech Stack
- Frontend: Next.js
- Backend: Supabase (Edge Functions for Refresh Cron)
- Database: Supabase (Encrypted Tokens)

## Monetization
- Model: Subscription or Lifetime Deal
- Price Point: $19/mo or $149 LTD
- Sales Channel: Direct to Agency Owners

## Timeline
- MVP Complete: 2026-02-15
- Beta Users: 2026-03-01
- Public Launch: 2026-03-15

## Current Phase
- [ ] Research & Validation
- [x] MVP Build (Scaffolding)
- [ ] Internal Testing
- [ ] Beta Testing
- [ ] Package & Deploy
- [ ] Launch & Market
