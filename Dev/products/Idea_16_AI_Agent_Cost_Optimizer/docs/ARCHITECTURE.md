# Technical Architecture - AgentMeter

## Data Flow
```
[Your App] → [AgentMeter SDK] → [LLM API] → [Response]
                  ↓
           [Telemetry Event] → [Ingestion API] → [ClickHouse]
                                                      ↓
           [Dashboard] ← [Cost Aggregation] ←─────────┘
```

## Cost Calculation
- Input tokens × model input price
- Output tokens × model output price
- Tool calls × estimated cost
- Aggregated by: agent, conversation, user, time period
