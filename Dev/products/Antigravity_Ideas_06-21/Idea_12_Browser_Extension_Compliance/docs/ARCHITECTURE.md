# Technical Architecture - ExtensionAudit

## Data Flow
```
[Chrome Extension Agent] → [Extension Inventory API] → [Permission Parser] → [Risk Scorer]
                                                                                   ↓
[Admin Dashboard] ← [Policy Engine] ← [PostgreSQL Inventory] ←─────────────────────┘
```

## Risk Scoring Factors
- Permission scope (all URLs = high risk)
- Permission combinations (clipboard + network = high risk)
- Extension reputation (Web Store reviews, known malicious lists)
- Update frequency and developer history
