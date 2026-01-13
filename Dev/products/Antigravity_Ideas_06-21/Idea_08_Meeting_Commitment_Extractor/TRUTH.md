# Statement of Truth - PactPull

## Core Purpose
Extract actionable commitments, deadlines, and verbal agreements from meeting recordings and automatically convert them into tracked tasks in project management tools.

## Target User
- Account managers and customer success teams
- Sales reps who make promises on calls
- Agency project managers handling multiple clients
- Consultants documenting client commitments

## Value Proposition
Never forget what was promised. Bridge the gap between "what was said" and "what gets tracked."

## MVP Features (v1.0 ONLY)
- [ ] Recording upload (Zoom, Google Meet, Loom, direct audio)
- [ ] AI transcription via Deepgram/AssemblyAI
- [ ] Commitment detection (who, what, when)
- [ ] Confidence scoring for extracted commitments
- [ ] One-click export to Asana or Linear
- [ ] Basic dashboard showing pending commitments

## Anti-Scope (DO NOT BUILD)
- Live meeting bot/recording (upload only for MVP)
- Calendar integration (v2)
- Automatic meeting join (v2)
- CRM integration beyond task export

## Tech Stack
- Backend: Python (FastAPI)
- Transcription: Deepgram or AssemblyAI API
- AI Layer: Claude API for commitment extraction
- Database: PostgreSQL
- Integrations: Asana API, Linear API
- Frontend: React dashboard

## Monetization
- Model: Monthly SaaS + usage-based
- Free: 5 recordings/month
- Pro: $29/month — 50 recordings, integrations
- Team: $79/month — unlimited, shared workspace

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
