# Quick Integration Guide: Feedback Tracking

**How to integrate the feedback tracking system into your publishing flow**

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Run the Database Migration

```bash
npx supabase db push
```

This creates the `content_performance` table and all necessary functions.

---

### Step 2: Add Tracking to Publishing Flow

Find your publishing code (likely in `app/api/social/post/route.ts` or campaign publishing logic) and add:

```typescript
import type { RecordPerformanceRequest } from '@/types/feedback';

// After successfully publishing content to social media
async function publishAndTrack(
  userId: string,
  campaignId: string,
  trend: TrendWithViralScore,  // The trend with viral score
  content: string,
  platforms: string[]
) {
  // 1. Publish content (your existing code)
  const publishResults = await publishToSocialMedia(content, platforms);

  // 2. Track performance for ML training
  try {
    const trackingData: RecordPerformanceRequest = {
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
      body: JSON.stringify(trackingData),
    });

    const result = await response.json();

    if (result.success) {
      console.log(`[Feedback] ✓ Tracking enabled for: ${trend.title}`);
      // Optionally store performance_id in your campaign or post record
      // for later engagement updates
    }
  } catch (error) {
    // Don't fail publishing if tracking fails
    console.error('[Feedback] Failed to record performance:', error);
  }

  return publishResults;
}
```

---

### Step 3: Add Analytics Dashboard (Optional)

Create a new page to view prediction accuracy:

```typescript
// app/(portal)/analytics/page.tsx
import ViralScoreAnalytics from '@/components/ViralScoreAnalytics';

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ViralScoreAnalytics />
    </div>
  );
}
```

Add a link to your navigation:

```typescript
// components/Navigation.tsx or SidebarNav.tsx
<Link href="/analytics">
  <BarChart3 className="w-5 h-5" />
  Analytics
</Link>
```

---

## 📊 Collecting Engagement Data

### Option 1: Manual Entry (MVP - Easiest)

Create a simple form where users can manually input engagement after 24-48 hours:

```typescript
// components/EngagementForm.tsx
async function submitEngagement(performanceId: string, data: any) {
  const response = await fetch('/api/feedback/update', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      performance_id: performanceId,
      twitter: data.twitter ? {
        likes: parseInt(data.twitter.likes),
        retweets: parseInt(data.twitter.retweets),
        replies: parseInt(data.twitter.replies),
      } : undefined,
      linkedin: data.linkedin ? {
        likes: parseInt(data.linkedin.likes),
        comments: parseInt(data.linkedin.comments),
        shares: parseInt(data.linkedin.shares),
      } : undefined,
    }),
  });

  return response.json();
}
```

### Option 2: Automated Collection (Future)

Use platform APIs to automatically fetch engagement (requires OAuth tokens):

```typescript
// lib/engagement-collector.ts
import { createClient } from '@/lib/supabase/server';

export async function collectEngagementAutomatically() {
  const supabase = await createClient();

  // Get performance records from 24-48 hours ago that need engagement data
  const { data: records } = await supabase
    .from('content_performance')
    .select('*')
    .is('engagement_collected_at', null)
    .gte('published_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
    .lte('published_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  if (!records || records.length === 0) return;

  for (const record of records) {
    try {
      // Fetch engagement from each platform
      const twitter = record.platforms.includes('twitter')
        ? await fetchTwitterEngagement(record.post_id)
        : undefined;

      const linkedin = record.platforms.includes('linkedin')
        ? await fetchLinkedInEngagement(record.post_id)
        : undefined;

      // Update record
      await fetch('/api/feedback/update', {
        method: 'PUT',
        body: JSON.stringify({
          performance_id: record.id,
          twitter,
          linkedin,
        }),
      });

      console.log(`✓ Collected engagement for: ${record.trend_title}`);
    } catch (error) {
      console.error(`✗ Failed to collect engagement for: ${record.trend_title}`, error);
    }
  }
}
```

---

## 🎯 Integration Example: Complete Flow

Here's a complete example showing how it all fits together:

```typescript
// app/(portal)/campaigns/new/page.tsx

// When user clicks "Publish" button
async function handlePublish() {
  try {
    setPublishing(true);

    // 1. Generate content (existing code)
    const content = await generateContent(selectedTrends, targetPlatforms);

    // 2. Publish to social media (existing code)
    const publishResults = await publishToSocial(content, targetPlatforms);

    // 3. Track performance for ML training (NEW CODE)
    for (const trend of selectedTrends) {
      try {
        const trackingResponse = await fetch('/api/feedback/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaign_id: campaignId,
            trend_title: trend.title,
            viral_score_predicted: trend.viralScore,
            viral_potential_predicted: trend.viralPotential,
            predicted_factors: trend.viralFactors,
            content_text: content[targetPlatforms[0]], // First platform's content
            platforms: targetPlatforms,
            published_at: new Date().toISOString(),
          }),
        });

        const result = await trackingResponse.json();
        if (result.success) {
          console.log(`✓ Tracking enabled for trend: ${trend.title}`);
        }
      } catch (error) {
        // Don't fail publish if tracking fails
        console.error('Tracking failed:', error);
      }
    }

    // 4. Show success message
    toast.success('Published successfully! Engagement tracking enabled.');
  } catch (error) {
    toast.error('Failed to publish');
  } finally {
    setPublishing(false);
  }
}
```

---

## ✅ Testing Checklist

After integration, test that:

1. **Publishing works**: Content publishes to social media as before
2. **Tracking records created**: Check database for `content_performance` records
3. **Analytics loads**: Visit `/analytics` and see your data
4. **Engagement updates work**: Try updating a record with test engagement data
5. **Export works**: When you have 10+ records, try exporting CSV

---

## 🐛 Troubleshooting

**Tracking not working?**
- Check console logs for API errors
- Verify Supabase migration ran successfully
- Check RLS policies allow user to insert/update

**Analytics showing no data?**
- Wait 24-48 hours after publishing
- Add engagement data via `/api/feedback/update`
- Check that `is_training_data` is true

**Export failing?**
- Need at least 1 record with `is_training_data = true`
- Check `training_data_quality` is 'high' or 'medium'
- Verify user is authenticated

---

## 🚀 Next Steps

1. ✅ Run migration
2. ✅ Add tracking to publish flow
3. ✅ Publish some content
4. ⏳ Wait 24-48 hours
5. ✅ Add engagement data (manual or automated)
6. ✅ View analytics dashboard
7. ✅ When you have 100+ records, export and train ML model

---

**That's it!** You're now collecting data for Phase 2 ML training.

See [FEEDBACK_TRACKING_SYSTEM.md](FEEDBACK_TRACKING_SYSTEM.md) for full documentation.
