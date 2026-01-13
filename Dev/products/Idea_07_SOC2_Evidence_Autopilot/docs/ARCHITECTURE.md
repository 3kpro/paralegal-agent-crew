# Technical Architecture - ComplianceGhost

## Overview
This document outlines the technical architecture for ComplianceGhost.

## System Components

### 1. Integration Connectors
- OAuth-based connections to cloud providers
- Each connector implements: `connect()`, `capture()`, `disconnect()`
- Stored credentials encrypted at rest

### 2. Capture Scheduler
- Bull queue for scheduled jobs
- Configurable capture frequency per integration
- Retry logic for failed captures

### 3. Evidence Storage
- S3-compatible storage for captured evidence
- Metadata in PostgreSQL (timestamp, control mapping, integration source)
- Versioning for year-over-year comparison

### 4. Control Mapping Engine
- SOC 2 Type II control library
- Manual and AI-suggested evidence-to-control mapping
- Gap detection based on missing required evidence

### 5. Dashboard
- React frontend
- Evidence inventory view
- Gap analysis and audit readiness score

## Data Flow
```
[Cloud Provider] → [OAuth Connector] → [Capture Job] → [S3 Storage]
                                                            ↓
[Dashboard] ← [Control Mapper] ← [PostgreSQL Metadata] ←────┘
      ↓
[Auditor Export ZIP]
```

## API Endpoints (Planned)
- `POST /api/integrations/connect` — OAuth flow
- `GET /api/evidence` — List captured evidence
- `POST /api/evidence/:id/map` — Map to control
- `GET /api/gaps` — Show missing evidence
- `POST /api/export` — Generate auditor package

---
*To be expanded during MVP build.*
