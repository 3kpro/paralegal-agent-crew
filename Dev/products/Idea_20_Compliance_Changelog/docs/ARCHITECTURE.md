# Technical Architecture - RegWatch

## Data Flow
```
[Federal Register] + [State Agencies] → [Scraping Jobs] → [Raw Regulations]
                                                               ↓
[User Profile] → [Claude Relevance Filter] → [Summary Generator] → [PostgreSQL]
                                                                        ↓
[Dashboard/Calendar] ← [Elasticsearch Search] ←────────────────────────┘
         ↓
   [Email/Slack Digest]
```

## Supported Regulatory Domains (MVP)
- Healthcare (CMS, HHS, state health departments)
- Financial services (SEC, FINRA, state banking)
- Cannabis (state-by-state regulatory boards)
