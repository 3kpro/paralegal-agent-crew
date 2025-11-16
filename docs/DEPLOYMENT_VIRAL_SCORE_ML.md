# Viral Score ML Deployment Guide

## Prerequisites

1. **Google Cloud CLI installed**
   ```powershell
   # Check if installed:
   gcloud --version

   # If not, install from: https://cloud.google.com/sdk/docs/install
   ```

2. **Authenticate with Google Cloud**
   ```powershell
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

---

## Step 1: Deploy to Cloud Run

**Navigate to project root:**
```powershell
cd C:\DEV\3K-Pro-Services\landing-page
```

**Run deployment script:**
```powershell
gcloud run deploy viral-score-api `
  --source services/viral-score-api `
  --region us-central1 `
  --allow-unauthenticated `
  --memory 512Mi `
  --min-instances 0 `
  --max-instances 10
```

**Expected output:**
```
Building image...
Deploying to Cloud Run...
Service URL: https://viral-score-api-xxxxx-uc.a.run.app
```

**Copy the Service URL** - you'll need it next.

---

## Step 2: Add Environment Variables to Vercel

**Go to Vercel Dashboard:**
1. Open https://vercel.com/dashboard
2. Select your project: `3kpro-services` or `landing-page`
3. Click **Settings** → **Environment Variables**

**Add these variables:**

| Name | Value | Environment |
|------|-------|-------------|
| `VIRAL_SCORE_API_URL` | `https://viral-score-api-xxxxx-uc.a.run.app/predict` | Production |
| `USE_ML_VIRAL_SCORE` | `true` | Production |

**Click "Save"**

---

## Step 3: Redeploy Vercel App

**Trigger redeploy:**
```powershell
# Option A: Via CLI
vercel --prod

# Option B: Via Dashboard
# Go to Vercel → Deployments → Click "Redeploy"
```

---

## Step 4: Test ML Integration

**Visit your production app:**
```
https://yourdomain.com/trend-gen
```

**Create a campaign:**
1. Enter campaign name
2. Select trending topic
3. Generate content
4. Check console logs for ML API calls

---

## Troubleshooting

### Error: "gcloud: command not found"
- Install Google Cloud CLI: https://cloud.google.com/sdk/docs/install

### Error: "Permission denied" during deployment
```powershell
# Grant Cloud Run permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID `
  --member="user:YOUR_EMAIL" `
  --role="roles/run.admin"
```

### Error: Model not loading from GCS
- Verify bucket exists: `gsutil ls gs://viral-score-models/v1/`
- Check service account permissions in Cloud Run

### ML predictions returning heuristic scores
- Verify `USE_ML_VIRAL_SCORE=true` in Vercel env vars
- Check `VIRAL_SCORE_API_URL` is set correctly
- Redeploy Vercel app after adding env vars

---

## Rollback to Heuristic (if needed)

**In Vercel env vars:**
- Set `USE_ML_VIRAL_SCORE=false`
- Redeploy

App will use original heuristic algorithm.

---

## Cost Monitoring

**Cloud Run pricing:**
- First 2 million requests/month: FREE
- After that: ~$0.40 per million requests
- Scale to zero when idle: $0/month base cost

**Check costs:**
```powershell
gcloud billing projects describe YOUR_PROJECT_ID
```

---

## Next Steps (Future)

1. **Monitor performance** - Track ML vs heuristic accuracy
2. **Collect real data** - Save viral outcomes for v2 model training
3. **ONNX conversion** - Bundle model for Gumroad ($149 edition)
