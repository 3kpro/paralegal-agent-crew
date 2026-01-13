# Technical Architecture - TrialRevive

## Overview
This document outlines the technical architecture for TrialRevive.

## System Components

### 1. Event Ingestion Layer
- Webhook receivers for Segment, Mixpanel, Amplitude
- Event normalization pipeline
- Storage in ClickHouse for analytics queries

### 2. Classification Engine
- Behavioral pattern detection
- Claude API integration for classification
- Confidence scoring

### 3. Playbook Generator
- Template library for recovery messages
- Dynamic personalization based on classification
- Export adapters for marketing tools

### 4. Dashboard
- React frontend
- Real-time trial status
- Playbook effectiveness metrics

## Data Flow
```
[Analytics Platform] → [Webhook/API] → [Event Normalizer] → [ClickHouse]
                                                                ↓
[Dashboard] ← [Playbook Generator] ← [Classification Engine] ←──┘
                     ↓
            [Marketing Tool Export]
```

## API Endpoints (Planned)
- `POST /api/events/ingest` — Receive events
- `GET /api/trials` — List classified trials
- `GET /api/trials/:id/playbook` — Get recovery playbook
- `POST /api/export/customerio` — Push to Customer.io

---
*To be expanded during MVP build.*
