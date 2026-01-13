# Technical Architecture - ReviewLens

## Data Flow
```
[GitHub/GitLab API] → [PR Ingestion] → [Comment Parser] → [Claude Classification] → [Pattern Analysis]
                                                                                          ↓
[Dashboard] ← [Statistical Analysis] ← [TimescaleDB Metrics] ←────────────────────────────┘
```

## Key Metrics
- Time-to-first-review by submitter
- Approval rate by reviewer-submitter pair
- Comment sentiment and actionability
- Review depth (LOC reviewed vs time spent)
