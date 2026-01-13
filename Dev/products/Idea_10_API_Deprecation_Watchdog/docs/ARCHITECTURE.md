# Technical Architecture - BreakingChange

## Data Flow
```
[API Registry] → [Scheduled Scraper Jobs] → [Changelog Parser] → [Claude Classification] → [Alert Queue]
                                                                                               ↓
[Dashboard/Timeline] ← [PostgreSQL Change Log] ←───────────────────────────────────────────────┘
```

## Core Entities
- Integration (name, changelog_url, rss_url, github_repo)
- Change (integration_id, detected_at, severity, summary, raw_content)
- Alert (change_id, channel, sent_at)
