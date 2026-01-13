# Statement of Truth - TrialRevive

## Core Purpose
Diagnose why SaaS trial users abandon before converting, classify them into actionable segments, and generate personalized recovery playbooks to win them back.

## Target User
- Growth/product marketers at B2B SaaS companies
- Founders of early-stage startups optimizing trial-to-paid
- Customer success teams doing trial user outreach
- RevOps teams analyzing conversion funnels

## Value Proposition
Turn your 95% trial abandonment into recovered revenue. AI-powered diagnosis + prescription for every lost trial.

## MVP Features (v1.0 ONLY)
- [ ] Event ingestion from Segment/Mixpanel/Amplitude (webhook or API pull)
- [ ] Drop-off pattern detection (onboarding incomplete, key feature unused, usage flatline)
- [ ] AI abandonment classification (confused, wrong fit, needs more time, competitor eval)
- [ ] Recovery playbook generation (email copy, offer suggestions, timing)
- [ ] Basic dashboard showing classified trials and suggested actions

## Anti-Scope (DO NOT BUILD)
- Full marketing automation (integrate with existing tools instead)
- Email sending (output to Customer.io/Intercom/Sendgrid)
- Real-time in-app interventions (v2 feature)
- Custom ML model training per customer (use general model)

## Tech Stack
- Backend: Python (FastAPI) for event processing
- Database: PostgreSQL + ClickHouse for behavioral analytics
- AI Layer: Claude API for classification and copy generation
- Integrations: Segment, Mixpanel, Amplitude webhooks; Customer.io, Intercom export
- Frontend: React dashboard

## Monetization
- Model: Monthly SaaS subscription
- Starter: $199/month — up to 1,000 trial users/month
- Growth: $499/month — 5,000 trials, Slack alerts, A/B testing
- Scale: $999/month — unlimited, custom models, API access

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
