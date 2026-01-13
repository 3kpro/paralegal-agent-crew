# Statement of Truth - SchemaSentry

## Core Purpose
Monitor upstream data sources for schema changes (columns added/removed, type changes) and alert data teams before pipelines break.

## Target User
- Data engineers maintaining ETL/ELT pipelines
- Analytics engineers managing dbt transformations
- ML engineers with feature pipelines
- Data platform teams responsible for data quality

## Value Proposition
Discover schema changes when they happen, not when dashboards break.

## MVP Features (v1.0 ONLY)
- [ ] Schema snapshot registry (catalog current schemas)
- [ ] Change detection (additions, removals, type changes)
- [ ] Impact analysis (which downstream objects affected)
- [ ] Severity classification (breaking vs safe)
- [ ] Slack/email alerts with context

## Anti-Scope (DO NOT BUILD)
- Data quality monitoring (values, not schema)
- Full data catalog (use Atlan, DataHub)
- Auto-fix/migration generation
- Data lineage discovery (manual registration for MVP)

## Tech Stack
- Backend: Python for database introspection
- Connectors: PostgreSQL, MySQL, Snowflake, BigQuery, Redshift
- Scheduler: Temporal or Airflow for periodic checks
- Database: PostgreSQL for schema history
- Frontend: React dashboard with lineage visualization

## Monetization
- Starter: $149/month — 10 sources, daily checks
- Team: $349/month — 50 sources, hourly checks, impact analysis
- Enterprise: $749/month — unlimited, contract mode, CI integration

## Current Phase
- [ ] Research & Validation
- [ ] MVP Build

## Session Log
| Date | Agent/Human | Action | Outcome |
|------|-------------|--------|---------|
| 2026-01-11 | Claude Opus | Scaffolding | Created TRUTH.md and directory structure |
