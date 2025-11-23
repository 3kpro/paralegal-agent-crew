# ML Viral Score™ Integration

## Overview

The ML Viral Score™ feature provides machine learning-powered predictions for viral content potential. When enabled, it replaces the heuristic algorithm with trained ML model predictions.

## Architecture

```
┌─────────────────┐
│   Trends API    │
│ (app/api/trends)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  calculateViral │  ← Feature flag check
│     Score()     │  ← lib/viral-score.ts
└────────┬────────┘
         │
    [ML Enabled?]
         │
    ┌────┴────┐
    │         │
   YES       NO
    │         │
    ▼         ▼
┌─────────┐ ┌──────────┐
│ ML API  │ │Heuristic │
│ Proxy   │ │Algorithm │
└─────────┘ └──────────┘
    │
    ▼
┌──────────────────┐
│ External ML API  │
│ (Your ML Service)│
└──────────────────┘
```

## Feature Flag

**Environment Variable**: `NEXT_PUBLIC_VIRAL_SCORE_ML_ENABLED`

- `true` - ML predictions enabled (requires ML API configuration)
- `false` or unset - Heuristic algorithm used (default)

**Why NEXT_PUBLIC_?**
- Allows client-side UI to show "ML-powered" badge
- Server-side code checks flag before making ML API calls
- No security risk (only enables feature, doesn't expose API keys)

## Setup Instructions

### 1. Configure Environment Variables

Add these to your `.env.local` (development) and Vercel (production):

```bash
# Feature Flag
NEXT_PUBLIC_VIRAL_SCORE_ML_ENABLED=true

# ML API Configuration (server-side only)
VIRAL_SCORE_ML_API_URL=https://your-ml-api.example.com/predict
VIRAL_SCORE_ML_API_KEY=your-secure-api-key-here
```

### 2. ML API Requirements

Your ML API must accept POST requests with this format:

**Request:**
```json
POST /predict
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "title": "Morning Routines for Busy Parents",
  "traffic": 150000,
  "sources": "google,twitter,reddit",
  "freshnessHours": 2.5
}
```

**Response:**
```json
{
  "viralScore": 78,
  "confidence": 0.92,
  "model": "viral-predictor-v1"
}
```

**Required Fields:**
- `viralScore` (number, 0-100): Predicted viral score
- `confidence` (number, 0-1): Optional confidence level
- `model` (string): Optional model identifier

### 3. Enable Feature Flag

**Local Development:**
```bash
echo "NEXT_PUBLIC_VIRAL_SCORE_ML_ENABLED=true" >> .env.local
npm run dev
```

**Production (Vercel):**
```bash
# Add feature flag
vercel env add NEXT_PUBLIC_VIRAL_SCORE_ML_ENABLED production
# Input: true

# Add ML API URL
vercel env add VIRAL_SCORE_ML_API_URL production
# Input: https://your-ml-api.example.com/predict

# Add ML API key
vercel env add VIRAL_SCORE_ML_API_KEY production
# Input: your-secure-api-key-here

# Deploy
vercel --prod
```

### 4. Verify Integration

**Check Health Endpoint:**
```bash
curl https://trendpulse.3kpro.services/api/viral-score-ml

# Expected response:
{
  "enabled": true,
  "configured": true,
  "status": "ready"
}
```

**Test Prediction:**
```bash
# Requires authentication token
curl -X POST https://trendpulse.3kpro.services/api/viral-score-ml \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_AUTH_COOKIE" \
  -d '{
    "title": "Test Trend",
    "traffic": 100000,
    "sources": "google",
    "freshnessHours": 1
  }'

# Expected response:
{
  "viralScore": 75,
  "confidence": 0.89,
  "model": "ml-v1",
  "timestamp": "2025-11-22T10:00:00.000Z"
}
```

## Graceful Fallback

The system automatically falls back to heuristic algorithm if:

1. **Feature flag is disabled** - Uses heuristic by default
2. **ML API is not configured** - Returns 503 error from proxy, triggers fallback
3. **ML API request fails** - Network error, timeout, or API error triggers fallback
4. **ML API returns invalid data** - JSON parse error or missing fields triggers fallback

**Fallback Behavior:**
```typescript
try {
  return await predictViralScoreML(trend); // Attempt ML prediction
} catch (error) {
  console.error('ML prediction failed, falling back to heuristic:', error);
  // Falls through to heuristic calculation
}
```

**User Experience:**
- No errors shown to user
- Seamless transition to heuristic algorithm
- Logs indicate fallback occurred (for debugging)

## Rate Limiting

**Proxy API Rate Limit:**
- 100 requests per 10 minutes per user
- Applied at `/api/viral-score-ml` endpoint
- Returns 429 if limit exceeded

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1732276800
```

## Security

### API Key Protection

✅ **Secure Implementation:**
- ML API key stored server-side only (`VIRAL_SCORE_ML_API_KEY`)
- Client never receives API key
- Proxy route handles all external API calls
- Authentication required for proxy endpoint

❌ **Never Do This:**
```typescript
// BAD - Exposes API key to client
const response = await fetch(mlApiUrl, {
  headers: { 'Authorization': `Bearer ${process.env.ML_API_KEY}` }
});
```

### Authentication

All ML API requests require:
1. Valid Supabase session
2. Authenticated user ID
3. Rate limit check passed

**Unauthorized Request Response:**
```json
{
  "error": "Unauthorized - Please log in"
}
```

## Monitoring

### Server Logs

**ML Prediction Request:**
```
[ML Viral Score] Request: {
  title: "Morning Routines for Busy Parents",
  traffic: 150000,
  sources: "google,twitter,reddit",
  freshnessHours: 2.5,
  userId: "user-uuid"
}
```

**ML Prediction Response:**
```
[ML Viral Score] Response: {
  viralScore: 78,
  confidence: 0.92
}
```

**ML Prediction Failure:**
```
[Viral Score] ML prediction failed, falling back to heuristic: Error: ML API error: 503 Service Unavailable
```

### Error Scenarios

| Error | Cause | Resolution |
|-------|-------|------------|
| `ML API not configured` | `VIRAL_SCORE_ML_API_URL` not set | Add environment variable |
| `ML API error: 401` | Invalid API key | Update `VIRAL_SCORE_ML_API_KEY` |
| `ML API error: 429` | ML API rate limit | Wait or upgrade ML API plan |
| `ML API error: 503` | ML service down | Falls back to heuristic |
| `Rate limit exceeded` | User exceeded 100 req/10min | Wait for reset time |

## Testing

### Unit Tests

```typescript
import { calculateViralScore } from '@/lib/viral-score';

describe('ML Viral Score', () => {
  it('should use ML prediction when enabled', async () => {
    process.env.NEXT_PUBLIC_VIRAL_SCORE_ML_ENABLED = 'true';
    const result = await calculateViralScore({
      title: 'Test Trend',
      formattedTraffic: '100K searches',
      sources: ['google'],
      firstSeenAt: new Date(),
    });
    expect(result.viralScore).toBeGreaterThanOrEqual(0);
    expect(result.viralScore).toBeLessThanOrEqual(100);
  });

  it('should fallback to heuristic when ML fails', async () => {
    process.env.NEXT_PUBLIC_VIRAL_SCORE_ML_ENABLED = 'true';
    process.env.VIRAL_SCORE_ML_API_URL = 'https://invalid-url.example.com';
    const result = await calculateViralScore({
      title: 'Test Trend',
      formattedTraffic: '100K searches',
    });
    expect(result.viralScore).toBeDefined();
  });
});
```

### Integration Tests

**Local Development:**
```bash
# 1. Start local dev server
npm run dev

# 2. Test health endpoint
curl http://localhost:3000/api/viral-score-ml

# 3. Test with mock ML API (create simple Express server)
```

**Production:**
```bash
# Test via Vercel logs
vercel logs https://trendpulse.3kpro.services --follow
```

## ML Model Training (Future)

When you're ready to build your ML model:

### Training Data Collection

Collect these features for each trend:
- `title` (string) - Trend title
- `traffic` (number) - Search volume
- `sources` (string) - Comma-separated sources
- `freshnessHours` (number) - Age of trend
- `actualViralScore` (number) - Ground truth (engagement metrics)

### Model Training Pipeline

1. **Data Collection** - Export trends + engagement from database
2. **Feature Engineering** - Extract text features, normalize traffic
3. **Model Training** - Use scikit-learn, TensorFlow, or PyTorch
4. **Model Deployment** - Deploy to API endpoint
5. **A/B Testing** - Compare ML vs heuristic performance

### Recommended Tech Stack

- **Model**: XGBoost, Random Forest, or Neural Network
- **API**: FastAPI (Python) or Flask
- **Deployment**: AWS Lambda, Google Cloud Run, or Railway
- **Monitoring**: Weights & Biases, MLflow

## Troubleshooting

### ML Not Being Called

**Check:**
1. Feature flag enabled: `NEXT_PUBLIC_VIRAL_SCORE_ML_ENABLED=true`
2. API URL configured: `VIRAL_SCORE_ML_API_URL` set
3. Server logs show ML attempt: Search for `[Viral Score] Calling ML API proxy`
4. No fallback messages in logs

**Debug:**
```bash
# Check environment variables
vercel env ls

# Check health endpoint
curl https://trendpulse.3kpro.services/api/viral-score-ml

# Check recent logs
vercel logs --follow
```

### ML Always Falling Back to Heuristic

**Common Causes:**
1. ML API timeout (> 30 seconds)
2. ML API returns invalid JSON
3. ML API missing required fields (viralScore)
4. Network issues between Vercel and ML API

**Solution:**
- Check ML API logs for errors
- Verify ML API response format matches spec
- Add response validation to ML API
- Consider increasing timeout (Edge Functions: max 30s)

---

**Last Updated**: 2025-11-22
**Status**: Integration Complete
**Next Steps**: Deploy and test with real ML API endpoint
