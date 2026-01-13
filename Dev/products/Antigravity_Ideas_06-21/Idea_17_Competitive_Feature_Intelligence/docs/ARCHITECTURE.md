# Technical Architecture - LaunchRadar

## Data Flow
```
[Competitor URLs] → [Playwright Scraper] → [Page Snapshot] → [Semantic Diff] → [Claude Summary]
                                                                                      ↓
[Dashboard/Timeline] ← [PostgreSQL Changes] ←───────────────────────────────────────────┘
          ↓
    [Slack/Email Digest]
```

## Monitored Page Types
- Marketing homepage
- Features page
- Pricing page
- Changelog/release notes
- Documentation (optional)
