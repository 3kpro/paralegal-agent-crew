# Technical Architecture - VendorScope

## Data Flow
```
[Vendor Name] → [Intelligence DB] → [Trust Center Scrape] → [Document Parse] → [Claude Analysis] → [Risk Score]
```

## Core Entities
- Vendor (name, domain, trust_center_url)
- Document (vendor_id, type, content, embeddings)
- Assessment (vendor_id, risk_score, findings)
