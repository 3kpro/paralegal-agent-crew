# Technical Architecture - PactPull

## Data Flow
```
[Audio Upload] → [Deepgram Transcription] → [Claude Extraction] → [Commitment Objects]
                                                                         ↓
[Dashboard] ← [PostgreSQL Storage] ←─────────────────────────────────────┘
      ↓
[Asana/Linear Export]
```

## Commitment Object Schema
```typescript
interface Commitment {
  id: string;
  recording_id: string;
  actor: string;           // Who made the commitment
  action: string;          // What was promised
  deadline: string | null; // When (if mentioned)
  confidence: number;      // 0-1 score
  transcript_excerpt: string;
  timestamp_start: number;
  status: 'pending' | 'exported' | 'dismissed';
}
```

## API Endpoints (Planned)
- `POST /api/recordings/upload` — Upload audio file
- `GET /api/recordings/:id/commitments` — Get extracted commitments
- `POST /api/commitments/:id/export` — Export to task manager
- `PATCH /api/commitments/:id` — Update status

---
*To be expanded during MVP build.*
