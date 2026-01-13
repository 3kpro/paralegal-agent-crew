# TrialRevive - Abandoned Trial Recovery Engine 💎

> **Status:** MVP Complete ✅  
> **Mission:** Transform trial churn into recovered revenue using behavioral diagnosis and personalized recovery playbooks.

## 🎯 The Problem
Standard trial drip campaigns are ineffective because they treat all "lost" users the same. Whether a user was confused during onboarding, price-sensitive, or simply testing against a competitor, they receive the same generic email.

## 💡 The Solution: TrialRevive
TrialRevive analyzes event streams to diagnose the *why* behind abandonment and triggers the perfect recovery strategy.

### Core Pipeline
1.  **Ingestion**: Accept webhooks from Segment, Mixpanel, and Amplitude.
2.  **Diagnosis**: Classify users into behavioral buckets (Confused, Price Sensitive, Competitor Eval, etc.).
3.  **Strategy**: Generate custom Playbooks (Email templates + specialized offers).
4.  **Action**: Sync attributes and trigger recovery campaigns in Customer.io and Slack.

---

## 🛠️ Technical Implementation

### Backend (Python/FastAPI)
- **FastAPI Engine**: Scalable event ingestion pipeline.
- **Pydantic Models**: Robust domain modeling for behavioral analytics.
- **Connectors**: Native support for Segment, Mixpanel, and Amplitude payloads.
- **A/B Testing**: Deterministic hashing for scientific recovery optimization.

### Frontend (React/TypeScript)
- **Insight Dashboard**: Premium dark-mode UI for monitoring recovery opportunities.
- **Glassmorphism Design**: High-density visualization of AI confidence and reasoning.

---

## 🚀 Getting Started

### Backend Setup
1.  **Installation**:
    ```bash
    pip install fastapi uvicorn pydantic requests
    ```
2.  **Run the API**:
    ```bash
    python src/main.py
    ```
    *Endpoints: `/api/events/segment`, `/api/events/mixpanel`, `/api/events/amplitude`*

3.  **Run Logic Tests**:
    ```bash
    # Set PYTHONPATH to project root
    $env:PYTHONPATH = "."
    python src/test_engine.py      # Test Classification
    python src/test_playbooks.py   # Test Playbooks
    python src/test_ab_tester.py   # Test A/B Testing
    ```

### Dashboard Setup
1.  **Installation**:
    ```bash
    cd dashboard
    npm install
    ```
2.  **Run Development Server**:
    ```bash
    npm run dev
    ```

---

## 📊 Project Structure
```text
Idea_06_Trial_Recovery_Engine/
├── dashboard/             # React/TS Frontend
├── src/
│   ├── models/           # Domain definitions
│   ├── integrations/     # Slack & Customer.io clients
│   ├── engine.py         # Classification logic
│   ├── playbooks.py      # Generation logic
│   ├── ab_tester.py      # Experimentation engine
│   └── main.py           # API Entry point
├── docs/                 # TRUTH.md, TASKS.md
└── tests/                # Verification scripts (test_*.py)
```

---
*Developed by Antigravity for 3KPRO.*
