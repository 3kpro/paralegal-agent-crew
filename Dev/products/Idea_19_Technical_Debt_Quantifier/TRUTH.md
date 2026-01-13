# Statement of Truth - DebtScore

## Core Purpose
Quantify technical debt by correlating code quality metrics with actual engineering velocity, translating debt into business impact.

## Target User
- Engineering managers justifying refactoring investments
- CTOs communicating tech debt impact to boards
- Tech leads prioritizing which debt to pay down
- Product managers understanding estimate inflation

## Value Proposition
Turn "we have tech debt" into "tech debt costs us 2.3 days per feature in module X."

## MVP Features (v1.0 ONLY)
- [ ] Codebase analysis (complexity, coverage, dependency age)
- [ ] Velocity correlation (code quality vs ticket completion time)
- [ ] Debt hotspot map (visual heatmap)
- [ ] Cost translation (days added per feature)
- [ ] Basic trend tracking

## Anti-Scope (DO NOT BUILD)
- Code review automation
- Refactoring suggestions (v2)
- Security vulnerability scanning (use Snyk)
- Full static analysis (use SonarQube for that)

## Tech Stack
- Code Analysis: AST parsers, complexity calculators
- Git Integration: Git history for churn and ownership
- Issue Tracker: Jira/Linear APIs for velocity data
- Database: PostgreSQL + TimescaleDB
- Frontend: React with D3.js visualizations

## Monetization
- Team: $299/month — 5 repos
- Growth: $599/month — 20 repos, velocity correlation
- Enterprise: $999/month — unlimited, executive dashboards

## Current Phase
- [ ] Research & Validation
- [ ] MVP Build

## Session Log
| Date | Agent/Human | Action | Outcome |
|------|-------------|--------|---------|
| 2026-01-11 | Claude Opus | Scaffolding | Created TRUTH.md and directory structure |
