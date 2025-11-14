# Feedback Tracking System Documentation

**Purpose**: Enable Phase 2 ML training by tracking actual content performance vs predicted viral scores
**Created**: November 3, 2025
**Status**: ✅ Complete and Ready to Use

---

## 🎯 Overview

The Feedback Tracking System collects real-world engagement data to enable Phase 2 ML training. It tracks:
- Predicted viral scores (from heuristic algorithm)
- Actual engagement metrics (from social media platforms)
- Prediction accuracy (how well predictions matched reality)
- Training data readiness (when you have enough data for ML)

---

## 📊 Two-Phase Strategy

### **Phase 1: Heuristic Algorithm** (Current)
- Rule-based viral scoring (Volume + Multi-source + Specificity + Freshness)
- Fast, explainable, no training data needed
- **Purpose**: Provide immediate value + collect data for Phase 2

### **Phase 2: ML-Powered** (Future - Month 2-3)
- RandomForest regression model trained on real user outcomes
- Requires 1,000+ examples of trends + actual engagement
- **Purpose**: Beat heuristic accuracy using learned patterns

**This system enables the transition from Phase 1 → Phase 2**

---

## 🗄️ Database Schema

### Table: `content_performance`

Stores all tracking data for ML training.

```sql
CREATE TABLE content_performance (
  -- Identifiers
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  campaign_id UUID REFERENCES campaigns(id),
  post_id UUID REFERENCES scheduled_posts(id),

  -- Predicted Data (Phase 1 Heuristic)
  trend_title TEXT NOT NULL,
  viral_score_predicted INTEGER (0-100),
  viral_potential_predicted TEXT ('high'|'medium'|'low'),
  predicted_factors JSONB, -- {volume, multiSource, specificity, freshness}

  -- Content Info
  content_text TEXT,
  content_type TEXT,
  platforms TEXT[],
  published_at TIMESTAMP,

  -- Actual Engagement (Collected 24-48 hours later)
  engagement_twitter JSONB,
  engagement_linkedin JSONB,
  engagement_facebook JSONB,
  engagement_instagram JSONB,
  engagement_tiktok JSONB,

  -- Calculated Metrics (Auto-computed by triggers)
  total_engagement INTEGER,
  viral_score_actual INTEGER (0-100),
  was_viral BOOLEAN, -- total_engagement >= 10000
  prediction_error INTEGER,
  prediction_accuracy DECIMAL,

  -- ML Training Metadata
  is_training_data BOOLEAN,
  training_data_quality TEXT ('high'|'medium'|'low'),

  -- Timestamps
  created_at TIMESTAMP,
  engagement_collected_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Auto-Calculation Triggers

The database automatically calculates:
- `total_engagement` - Sum of all interactions across platforms
- `viral_score_actual` - 0-100 score calculated from engagement
- `was_viral` - true if total_engagement >= 10,000
- `prediction_error` - abs(predicted - actual)
- `prediction_accuracy` - 100 - prediction_error
- `is_training_data` - true if ready for ML training
- `training_data_quality` - 'high' (100+ engagement), 'medium' (10-99), 'low' (<10)

---

## 🔌 API Endpoints

### 1. Record Performance (POST /api/feedback/record)

**When**: Called when content is published
**Purpose**: Create initial tracking record with predicted viral score

**Request**:
```typescript
POST /api/feedback/record

{
  "campaign_id": "uuid",
  "trend_title": "AI Content Tools for Creators",
  "viral_score_predicted": 85,
  "viral_potential_predicted": "high",
  "predicted_factors": {
    "volume": 40,
    "multiSource": 30,
    "specificity": 20,
    "freshness": 10
  },
  "content_text": "Check out these amazing AI tools...",
  "content_type": "twitter",
  "platforms": ["twitter", "linkedin"],
  "published_at": "2025-11-03T10:00:00Z"
}
```

**Response**:
```typescript
{
  "success": true,
  "data": {
    "id": "performance-uuid",
    "viral_score_predicted": 85,
    // ... full performance record
  }
}
```

---

### 2. Update Engagement (PUT /api/feedback/update)

**When**: Called 24-48 hours after publishing
**Purpose**: Add actual engagement metrics to calculate accuracy

**Request**:
```typescript
PUT /api/feedback/update

{
  "performance_id": "uuid",
  "twitter": {
    "likes": 1250,
    "retweets": 340,
    "replies": 89,
    "impressions": 45000
  },
  "linkedin": {
    "likes": 567,
    "comments": 123,
    "shares": 89,
    "impressions": 23000
  }
}
```

**Response**:
```typescript
{
  "success": true,
  "data": {
    "performance_id": "uuid",
    "total_engagement": 2458,
    "viral_score_actual": 62,
    "was_viral": false,
    "prediction_accuracy": 77 // (100 - abs(85 - 62))
  }
}
```

---

### 3. Get Analytics (GET /api/feedback/analytics)

**Purpose**: View prediction accuracy statistics

**Response**:
```typescript
{
  "success": true,
  "data": {
    "total_predictions": 150,
    "predictions_with_data": 120,
    "avg_prediction_error": 12.5,
    "avg_prediction_accuracy": 87.5,
    "predicted_high": 45,
    "predicted_medium": 60,
    "predicted_low": 45,
    "actual_viral": 12,
    "high_prediction_correct": 10,
    "training_data_ready": 105,
    "earliest_data": "2025-10-01T00:00:00Z",
    "latest_data": "2025-11-03T12:00:00Z"
  }
}
```

---

### 4. Export ML Data (GET /api/feedback/export-ml)

**Purpose**: Export training data for ML model training

**Query Parameters**:
- `format` - 'json' | 'csv' (default: 'json')
- `quality` - 'high' | 'medium' | 'all' (default: 'high')
- `limit` - number (default: 1000)

**Example**:
```bash
GET /api/feedback/export-ml?format=csv&quality=high&limit=1000
```

**Response** (CSV):
```csv
id,trend_title,viral_score_predicted,viral_score_actual,total_engagement,was_viral,prediction_accuracy,...
uuid1,"AI Tools",85,82,12500,true,97,...
uuid2,"Content Marketing",67,54,3200,false,87,...
```

**Response** (JSON):
```typescript
{
  "success": true,
  "data": {
    "records": [...],
    "metadata": {
      "total_records": 105,
      "high_quality": 78,
      "medium_quality": 27,
      "date_range": {
        "start": "2025-10-01T00:00:00Z",
        "end": "2025-11-03T12:00:00Z"
      },
      "avg_prediction_accuracy": 87.5
    }
  }
}
```

---

## 📝 Integration Guide

### Step 1: Record Performance When Publishing

In your publishing flow (e.g., `/api/social/post`), add:

```typescript
import type { RecordPerformanceRequest } from '@/types/feedback';

// After successfully publishing content
async function trackPerformance(
  campaignId: string,
  trend: TrendWithViralScore,
  content: string,
  platforms: string[]
) {
  const request: RecordPerformanceRequest = {
    campaign_id: campaignId,
    trend_title: trend.title,
    viral_score_predicted: trend.viralScore,
    viral_potential_predicted: trend.viralPotential,
    predicted_factors: trend.viralFactors,
    content_text: content,
    platforms,
    published_at: new Date().toISOString(),
  };

  const response = await fetch('/api/feedback/record', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  const result = await response.json();

  if (result.success) {
    console.log(`✓ Performance tracking enabled for: ${trend.title}`);
    return result.data.id; // Save this performance_id
  }
}
```

---

### Step 2: Collect Engagement Data (24-48 Hours Later)

You can collect engagement data in two ways:

#### **Option A: Manual Collection** (Recommended for MVP)

Create a dashboard where users manually input engagement metrics:

```typescript
async function submitEngagement(performanceId: string, engagement: any) {
  const response = await fetch('/api/feedback/update', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      performance_id: performanceId,
      twitter: engagement.twitter,
      linkedin: engagement.linkedin,
      // ... other platforms
    }),
  });

  return response.json();
}
```

#### **Option B: Automated Collection** (Future Enhancement)

Use platform APIs to automatically fetch engagement:

```typescript
// Scheduled job (runs daily)
async function collectEngagementData() {
  // Get performance records from 24-48 hours ago
  const records = await getRecentPerformance();

  for (const record of records) {
    // Fetch engagement from Twitter API
    const twitterData = await fetchTwitterEngagement(record.post_id);

    // Fetch engagement from LinkedIn API
    const linkedinData = await fetchLinkedInEngagement(record.post_id);

    // Update performance record
    await fetch('/api/feedback/update', {
      method: 'PUT',
      body: JSON.stringify({
        performance_id: record.id,
        twitter: twitterData,
        linkedin: linkedinData,
      }),
    });
  }
}
```

---

### Step 3: View Analytics

Add the analytics component to a dashboard page:

```typescript
// app/(portal)/analytics/page.tsx
import ViralScoreAnalytics from '@/components/ViralScoreAnalytics';

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-8">
      <ViralScoreAnalytics />
    </div>
  );
}
```

---

## 🤖 ML Training Guide (Phase 2)

When you have 100+ training records, you can train an ML model:

### Step 1: Export Training Data

```bash
curl http://localhost:3000/api/feedback/export-ml?format=csv&quality=high > training_data.csv
```

### Step 2: Train RandomForest Model

```python
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib

# Load data
df = pd.read_csv('training_data.csv')

# Features
features = ['volume_score', 'multi_source_score', 'specificity_score', 'freshness_score']
X = df[features]
y = df['viral_score_actual']

# Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Train
model = RandomForestRegressor(n_estimators=100)
model.fit(X_train, y_train)

# Evaluate
score = model.score(X_test, y_test)
print(f"R² Score: {score:.3f}")

# Save
joblib.dump(model, 'viral_score_model.pkl')
```

### Step 3: Deploy ML Model

See [VIRAL_SCORE_IMPLEMENTATION.md](VIRAL_SCORE_IMPLEMENTATION.md) for deployment options.

---

## 📈 Success Metrics

**Training Data Readiness**:
- 10 records: Can start experimenting
- 50 records: Baseline model possible
- 100 records: Good model training (recommended minimum)
- 500 records: High-quality model
- 1000+ records: Production-ready ML model

**Prediction Accuracy Targets**:
- 70%+ accuracy = Good (heuristic baseline)
- 80%+ accuracy = Very good
- 90%+ accuracy = Excellent (rare without ML)

**Viral Content Correlation**:
- High predictions → Viral outcomes: 60%+ success rate
- Medium predictions → Moderate outcomes: 50%+ success rate
- Low predictions → Low outcomes: 70%+ success rate

---

## 🔧 Utilities

### Client-Side Functions

```typescript
import {
  calculateTotalEngagement,
  calculateActualViralScore,
  calculatePredictionAccuracy,
  extractMLFeatures,
  convertToCSV,
  downloadCSV,
} from '@/lib/feedback-tracking';

// Calculate engagement
const total = calculateTotalEngagement(twitter, linkedin);

// Calculate viral score from engagement
const score = calculateActualViralScore(total);

// Check prediction accuracy
const accuracy = calculatePredictionAccuracy(predictedScore, actualScore);

// Export to CSV
const records = [...]; // Your performance records
const csv = convertToCSV(records);
downloadCSV(csv, 'my_training_data.csv');
```

---

## 🚨 Important Notes

### Privacy & Data Usage
- User engagement data is private (RLS enabled)
- Only aggregated, anonymized data should be used for ML training
- Users should consent to data collection

### Data Quality
- Exclude spam/bot engagement
- Exclude deleted/banned content
- Require minimum engagement threshold (10+ interactions)
- Flag outliers for manual review

### ML Best Practices
- Collect diverse data (high/medium/low predictions)
- Balance dataset (not just viral content)
- Track temporal trends (2023 ≠ 2025)
- Retrain model monthly with new data
- A/B test ML vs heuristic before full deployment

---

## 📞 Support

**Files Created**:
- `supabase/migrations/009_viral_score_feedback.sql` - Database schema
- `types/feedback.ts` - TypeScript types
- `lib/feedback-tracking.ts` - Utility functions
- `app/api/feedback/record/route.ts` - Record endpoint
- `app/api/feedback/update/route.ts` - Update endpoint
- `app/api/feedback/analytics/route.ts` - Analytics endpoint
- `app/api/feedback/export-ml/route.ts` - Export endpoint
- `components/ViralScoreAnalytics.tsx` - Analytics UI

**Next Steps**:
1. Run migration: `npx supabase db push`
2. Integrate tracking into publishing flow
3. Publish content and collect engagement data
4. View analytics dashboard
5. When you have 100+ records, export and train ML model

---

**Last Updated**: November 3, 2025
**Version**: 1.0.0
**Status**: ✅ Ready for Production
