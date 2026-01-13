# Statement of Truth - ReplyClip

## Core Purpose
Enable threaded, asynchronous video conversations where participants can reply to specific moments in videos, eliminating unnecessary synchronous meetings.

## Target User
- Customer success managers handling onboarding
- Sales engineers doing technical Q&A
- Support teams explaining complex issues
- Agencies managing client communication
- Distributed teams across time zones

## Value Proposition
Loom is broadcast. Zoom is synchronous. ReplyClip is conversation.

## MVP Features (v1.0 ONLY)
- [ ] Video recording (screen + camera + annotation)
- [ ] Threaded conversations (video replies organized in threads)
- [ ] Timestamped responses (reply to specific moments)
- [ ] AI transcript + summary
- [ ] Basic sharing (public link or email invite)

## Anti-Scope (DO NOT BUILD)
- Live video calling (async only)
- Full editing suite (trim only)
- Team workspaces (v2)
- CRM integrations (v2)

## Tech Stack
- Recording: Browser MediaRecorder API + optional desktop app
- Video Processing: FFmpeg for transcoding
- Storage: S3 + CloudFront CDN
- AI Layer: Deepgram/Whisper for transcription, Claude for summary
- Backend: Node.js or Python
- Frontend: React with custom video player

## Monetization
- Free: 25 videos/month, 5-min max
- Pro: $19/user/month — unlimited, 15-min, annotations
- Team: $39/user/month — shared inbox, routing

## Current Phase
- [ ] Research & Validation
- [ ] MVP Build

## Session Log
| Date | Agent/Human | Action | Outcome |
|------|-------------|--------|---------|
| 2026-01-11 | Claude Opus | Scaffolding | Created TRUTH.md and directory structure |
