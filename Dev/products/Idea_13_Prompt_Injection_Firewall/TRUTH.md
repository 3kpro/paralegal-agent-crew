# Statement of Truth - PromptArmor

## Core Purpose
Protect AI-powered applications from prompt injection attacks by scanning inputs for adversarial patterns and outputs for signs of compromise.

## Target User
- Security engineers at companies with AI features
- ML/AI teams shipping LLM-based products
- AppSec teams adding AI to threat models
- Compliance officers preparing for AI regulations

## Value Proposition
WAFs don't understand prompt injection. We do.

## MVP Features (v1.0 ONLY)
- [ ] Request firewall (scan user inputs for injection patterns)
- [ ] Pattern library (known jailbreaks, encoding tricks)
- [ ] Response scanning (detect system prompt leakage)
- [ ] Canary tokens (invisible markers to detect prompt extraction)
- [ ] Shadow mode (log without blocking)
- [ ] Basic dashboard with incident review

## Anti-Scope (DO NOT BUILD)
- Content moderation (use LLM provider filters)
- Model fine-tuning for safety
- Full WAF functionality
- Rate limiting (use existing infra)

## Tech Stack
- Core Engine: Rust or Go for high-performance inspection
- Pattern Matching: Regex, ML classifiers, heuristics
- AI Layer: Fine-tuned classifier for novel injection detection
- Deployment: API proxy, SDK, edge worker (Cloudflare compatible)
- Dashboard: React admin console
- Database: PostgreSQL for audit logs

## Monetization
- Starter: $99/month — 50K requests, core patterns
- Pro: $299/month — 500K requests, response scanning, canary tokens
- Enterprise: $799/month — unlimited, custom rules, SLA

## Current Phase
- [ ] Research & Validation
- [ ] MVP Build

## Session Log
| Date | Agent/Human | Action | Outcome |
|------|-------------|--------|---------|
| 2026-01-11 | Claude Opus | Scaffolding | Created TRUTH.md and directory structure |
