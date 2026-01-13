# Technical Architecture - PostmortemAI

## Data Flow
```
[Slack Thread] + [PagerDuty Alerts] + [Deploy Logs] → [Timeline Aggregator] → [Claude Generator]
                                                                                      ↓
[Review Editor] ← [Postmortem Draft] ← [Action Item Extractor] ←──────────────────────┘
       ↓
[Export to Notion/Confluence]
```

## Postmortem Sections Generated
- Executive Summary
- Timeline of Events
- Root Cause Analysis (guided)
- Impact Assessment
- Action Items
- Lessons Learned
