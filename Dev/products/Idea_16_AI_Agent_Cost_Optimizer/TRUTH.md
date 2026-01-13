# Statement of Truth - AgentMeter

## Core Purpose
Provide visibility into per-conversation and per-agent costs for AI deployments, identifying waste and enabling budget controls.

## Target User
- AI/ML engineering leads managing production agents
- FinOps teams attributing AI spend
- CTOs at AI-first startups watching runway
- Platform teams building internal agent frameworks

## Value Proposition
See exactly where your AI budget is going, per conversation.

## MVP Features (v1.0 ONLY)
- [ ] Instrumentation SDK (wraps OpenAI/Anthropic calls)
- [ ] Real-time cost dashboard (per-agent, per-conversation)
- [ ] Waste detection (bloated prompts, redundant calls)
- [ ] Budget guardrails (per-agent limits, alerts)
- [ ] Basic recommendations

## Anti-Scope (DO NOT BUILD)
- Full LLM gateway (use LiteLLM, Portkey)
- Prompt management/versioning
- Evaluation/testing framework
- Model fine-tuning

## Tech Stack
- SDK: Python and TypeScript wrappers
- Telemetry: OpenTelemetry-based tracing
- Backend: Go or Rust for high-throughput ingestion
- Database: ClickHouse for time-series analytics
- Frontend: React dashboard
- Alerts: PagerDuty, Slack, email

## Monetization
- Starter: $99/month — up to $1K tracked spend
- Growth: $299/month — $10K tracked, guardrails
- Scale: $799/month — unlimited, model routing suggestions

## Current Phase
- [ ] Research & Validation
- [ ] MVP Build

## Session Log
| Date | Agent/Human | Action | Outcome |
|------|-------------|--------|---------|
| 2026-01-11 | Claude Opus | Scaffolding | Created TRUTH.md and directory structure |
