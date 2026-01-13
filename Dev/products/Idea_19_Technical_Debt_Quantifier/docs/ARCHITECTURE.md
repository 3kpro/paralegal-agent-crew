# Technical Architecture - DebtScore

## Data Flow
```
[Git Repo] → [Complexity Analysis] → [Quality Metrics]
                                           ↓
[Jira/Linear] → [Velocity Data] → [Correlation Engine] → [Cost Model]
                                                              ↓
[Dashboard] ← [Hotspot Map] ← [PostgreSQL/TimescaleDB] ←──────┘
```

## Key Metrics
- Cyclomatic complexity
- Code churn (frequency of changes)
- Test coverage gaps
- Dependency age
- Ticket completion time by touched module
