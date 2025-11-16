# Grok Prompts: Viral Score API Scaffolding

**Context:** Building Flask API to serve ML model from GCS for Cloud Run deployment.

---

## Prompt 1: Flask API

```
Create a Flask API for serving TensorFlow predictions on Google Cloud Run.

Requirements:
- Load TensorFlow SavedModel from GCS bucket: gs://viral-score-models/v1/
- Expose POST endpoint /predict that accepts JSON: {title, traffic, sources, freshnessHours}
- Return JSON: {viralScore: number, confidence: number}
- Include health check endpoint /health
- Use google-cloud-storage for GCS access
- Handle errors gracefully with 500 responses
- Port: 8080 (Cloud Run default)

File: services/viral-score-api/app.py
```

---

## Prompt 2: Dockerfile

```
Create Dockerfile for Flask + TensorFlow app on Cloud Run.

Requirements:
- Base image: python:3.11-slim
- Install dependencies: flask, tensorflow, google-cloud-storage
- Copy app.py to /app
- Expose port 8080
- CMD: gunicorn app:app --bind :8080 --workers 1 --threads 8 --timeout 0

File: services/viral-score-api/Dockerfile
```

---

## Prompt 3: requirements.txt

```
Create requirements.txt for Flask ML API.

Dependencies:
- flask==3.0.0
- tensorflow==2.15.0
- google-cloud-storage==2.14.0
- gunicorn==21.2.0

File: services/viral-score-api/requirements.txt
```

---

## Prompt 4: Next.js ML Integration

```
Add ML prediction function to lib/viral-score.ts in Next.js TypeScript project.

Requirements:
- New async function: predictViralScoreML(trend: {title, formattedTraffic, sources?, firstSeenAt?})
- Calls process.env.VIRAL_SCORE_API_URL via fetch POST
- Maps formattedTraffic to numeric volume (e.g., "150K searches" → 150000)
- Maps sources array to comma-separated string
- Calculates freshnessHours from firstSeenAt
- Returns TrendWithViralScore type (existing interface)
- Feature flag: if USE_ML_VIRAL_SCORE !== 'true', use existing calculateViralScore()
- Add error handling with fallback to heuristic

Update existing calculateViralScore to be wrapped by feature flag check.
```

---

## Prompt 5: Deployment Script

```
Create bash script to deploy Flask API to Google Cloud Run.

Requirements:
- Build container from services/viral-score-api/
- Deploy to region us-central1
- Service name: viral-score-api
- Allow unauthenticated requests
- Set memory to 512Mi
- Set min instances to 0 (scale to zero)
- Set max instances to 10
- Output deployed URL

File: scripts/deploy-viral-score-api.sh
```

---

## Usage Instructions

1. Copy prompts 1-5 to Grok one at a time
2. Save generated files to specified paths
3. Test locally: `cd services/viral-score-api && python app.py`
4. Deploy: `bash scripts/deploy-viral-score-api.sh`
5. Call Claude if errors occur

---

## Expected GCS Bucket Structure (from Gemini)

```
gs://viral-score-models/v1/
├── saved_model.pb
├── variables/
│   ├── variables.data-00000-of-00001
│   └── variables.index
└── assets/
```

---

## Environment Variables Needed

```bash
# .env.local (development - after Grok scaffolds)
VIRAL_SCORE_API_URL=https://viral-score-api-xxxxx.run.app/predict
USE_ML_VIRAL_SCORE=true

# .env.production (Vercel - after deployment)
VIRAL_SCORE_API_URL=https://viral-score-api-xxxxx.run.app/predict
USE_ML_VIRAL_SCORE=true
```
