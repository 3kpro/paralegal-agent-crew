# TrialRevive - Agent Setup & Handover

## Project Integrity
TrialRevive is an event-driven trial recovery engine. The core logic resides in a series of Python services that process analytics streams into actionable recovery playbooks.

## Environment Setup
1. **Python Context**: Ensure `PYTHONPATH` is set to the project root for package imports to work.
2. **API Keys**: Integration requires `SLACK_WEBHOOK_URL`, `CUSTOMERIO_SITE_ID`, and `CUSTOMERIO_API_KEY`.
3. **Port Management**: Default FastAPI port is `8000`. Dashboard (Vite) typically uses `5173`.

## Verification Commands
Run these in order to verify the integrity of the engine:

```powershell
# 1. Test Domain Logic
$env:PYTHONPATH = "."; python src/test_engine.py

# 2. Test Content Generation
$env:PYTHONPATH = "."; python src/test_playbooks.py

# 3. Test Integration Handlers
$env:PYTHONPATH = "."; python src/test_slack.py
$env:PYTHONPATH = "."; python src/test_customerio.py

# 4. Test Experimentation Engine
$env:PYTHONPATH = "."; python src/test_ab_tester.py
```

## Dashboard Development
The dashboard is a standalone React app. To build/verify UI:
```bash
cd dashboard
npm install
npm run build
```

## Final Handover State
- [x] Ingestion Pipeline (Multi-source)
- [x] Classification Engine
- [x] Playbook Generator (Templates included)
- [x] Slack/Customer.io Connectors
- [x] A/B Testing Infrastructure
- [x] Premium Management Dashboard UI
