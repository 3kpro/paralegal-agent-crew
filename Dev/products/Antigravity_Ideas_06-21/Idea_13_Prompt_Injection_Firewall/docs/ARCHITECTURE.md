# Technical Architecture - PromptArmor

## Data Flow
```
[User Request] → [Input Scanner] → [Pattern Matcher] → [ML Classifier] → [Allow/Block Decision]
                                                                                ↓
                                                                         [LLM API Call]
                                                                                ↓
[Response to User] ← [Output Scanner] ← [Canary Check] ← [LLM Response] ←───────┘
```

## Detection Patterns (v1)
- DAN (Do Anything Now) variations
- Instruction override attempts
- Encoding tricks (base64, unicode)
- Multi-turn context manipulation
- System prompt extraction attempts
