# Statement of Truth - ReviewLens

## Core Purpose
Analyze code review patterns across your engineering team to detect bias, inconsistency, and quality issues in how PRs get reviewed.

## Target User
- Engineering managers wanting objective review quality metrics
- HR/People teams investigating unfair treatment claims
- Team leads calibrating reviewer expectations
- Developer experience teams optimizing PR workflows

## Value Proposition
Surface the hidden dynamics in your code review process with data, not gut feel.

## MVP Features (v1.0 ONLY)
- [ ] GitHub/GitLab integration (PR review history ingestion)
- [ ] Reviewer pattern analysis (approval rates, time-to-review by submitter)
- [ ] Bias detection dashboard (statistical anomalies)
- [ ] AI comment quality scoring (actionable vs nitpicky)
- [ ] Basic reporting export

## Anti-Scope (DO NOT BUILD)
- Individual contributor shaming/leaderboards
- Automated PR assignment (v2)
- Code quality analysis (use SonarQube)
- Performance reviews integration

## Tech Stack
- Backend: Python for data analysis
- Database: PostgreSQL + TimescaleDB for time-series
- AI Layer: Claude API for comment classification
- Integrations: GitHub API, GitLab API
- Frontend: React with D3.js visualizations

## Monetization
- Team: $149/month — up to 20 contributors
- Growth: $349/month — 100 contributors, bias detection
- Enterprise: $749/month — unlimited, SSO, custom reports

## Current Phase
- [ ] Research & Validation
- [ ] MVP Build

## Session Log
| Date | Agent/Human | Action | Outcome |
|------|-------------|--------|---------|
| 2026-01-11 | Claude Opus | Scaffolding | Created TRUTH.md and directory structure |
