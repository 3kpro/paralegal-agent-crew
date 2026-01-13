# Technical Architecture - SchemaSentry

## Data Flow
```
[Data Sources] → [Scheduled Introspection] → [Schema Snapshot] → [Diff Engine] → [Alert Queue]
                                                                                       ↓
[Dashboard] ← [Impact Analysis] ← [PostgreSQL History] ←───────────────────────────────┘
```

## Change Types Detected
- Column added (safe)
- Column removed (breaking)
- Type changed (breaking)
- Nullability changed (potentially breaking)
- Constraint added/removed
