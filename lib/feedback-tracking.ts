/**
 * Feedback Tracking Utility Functions
 *
 * Purpose: Helper functions for collecting and processing content performance data
 * for ML training in Phase 2.
 *
 * Created: November 3, 2025
 */

import type {
  ContentPerformance,
  TwitterEngagement,
  LinkedInEngagement,
  FacebookEngagement,
  InstagramEngagement,
  TikTokEngagement,
  PlatformEngagement,
  EngagementSummary,
} from '@/types/feedback';

// =====================================================
// Engagement Calculation Functions
// =====================================================

/**
 * Calculate total engagement across all platforms
 * Mirrors the database function for client-side use
 */
export function calculateTotalEngagement(
  twitter?: TwitterEngagement,
  linkedin?: LinkedInEngagement,
  facebook?: FacebookEngagement,
  instagram?: InstagramEngagement,
  tiktok?: TikTokEngagement
): number {
  let total = 0;

  // Twitter: likes + retweets + replies
  if (twitter) {
    total += (twitter.likes || 0) + (twitter.retweets || 0) + (twitter.replies || 0);
  }

  // LinkedIn: likes + comments + shares
  if (linkedin) {
    total += (linkedin.likes || 0) + (linkedin.comments || 0) + (linkedin.shares || 0);
  }

  // Facebook: likes + comments + shares
  if (facebook) {
    total += (facebook.likes || 0) + (facebook.comments || 0) + (facebook.shares || 0);
  }

  // Instagram: likes + comments + shares (+ saves for extra engagement)
  if (instagram) {
    total += (instagram.likes || 0) + (instagram.comments || 0) + (instagram.shares || 0) + (instagram.saves || 0);
  }

  // TikTok: likes + comments + shares
  if (tiktok) {
    total += (tiktok.likes || 0) + (tiktok.comments || 0) + (tiktok.shares || 0);
  }

  return total;
}

/**
 * Calculate actual viral score from engagement metrics
 * Maps engagement to 0-100 scale using logarithmic scaling
 *
 * Scaling:
 * - 0-100 engagement = 0-20 score
 * - 100-1K engagement = 20-40 score
 * - 1K-10K engagement = 40-70 score
 * - 10K+ engagement = 70-100 score
 */
export function calculateActualViralScore(totalEngagement: number): number {
  let score: number;

  if (totalEngagement >= 50000) {
    score = 100;
  } else if (totalEngagement >= 10000) {
    score = 70 + Math.round(((totalEngagement - 10000) / 40000) * 30);
  } else if (totalEngagement >= 1000) {
    score = 40 + Math.round(((totalEngagement - 1000) / 9000) * 30);
  } else if (totalEngagement >= 100) {
    score = 20 + Math.round(((totalEngagement - 100) / 900) * 20);
  } else {
    score = Math.round((totalEngagement / 100) * 20);
  }

  return Math.min(score, 100);
}

/**
 * Calculate engagement rate (percentage)
 */
export function calculateEngagementRate(
  totalEngagement: number,
  totalImpressions: number
): number {
  if (totalImpressions === 0) return 0;
  return (totalEngagement / totalImpressions) * 100;
}

/**
 * Calculate total impressions across all platforms
 */
export function calculateTotalImpressions(
  twitter?: TwitterEngagement,
  linkedin?: LinkedInEngagement,
  facebook?: FacebookEngagement,
  instagram?: InstagramEngagement,
  tiktok?: TikTokEngagement
): number {
  let total = 0;

  if (twitter?.impressions) total += twitter.impressions;
  if (linkedin?.impressions) total += linkedin.impressions;
  if (facebook?.reach) total += facebook.reach;
  if (instagram?.reach) total += instagram.reach;
  if (tiktok?.views) total += tiktok.views;

  return total;
}

// =====================================================
// Performance Analysis Functions
// =====================================================

/**
 * Calculate prediction error
 */
export function calculatePredictionError(
  predictedScore: number,
  actualScore: number
): number {
  return Math.abs(predictedScore - actualScore);
}

/**
 * Calculate prediction accuracy (percentage)
 */
export function calculatePredictionAccuracy(
  predictedScore: number,
  actualScore: number
): number {
  const error = calculatePredictionError(predictedScore, actualScore);
  return 100 - error;
}

/**
 * Determine if content was viral (10K+ engagement threshold)
 */
export function wasViral(totalEngagement: number): boolean {
  return totalEngagement >= 10000;
}

/**
 * Determine training data quality based on engagement
 */
export function determineTrainingDataQuality(
  totalEngagement: number
): 'high' | 'medium' | 'low' | 'excluded' {
  if (totalEngagement >= 100) return 'high';
  if (totalEngagement >= 10) return 'medium';
  if (totalEngagement > 0) return 'low';
  return 'excluded';
}

// =====================================================
// Engagement Summary Functions
// =====================================================

/**
 * Get engagement summary for each platform
 */
export function getEngagementSummaries(
  performance: ContentPerformance
): EngagementSummary[] {
  const summaries: EngagementSummary[] = [];

  if (performance.engagement_twitter) {
    const twitter = performance.engagement_twitter;
    summaries.push({
      platform: 'twitter',
      total_interactions: (twitter.likes || 0) + (twitter.retweets || 0) + (twitter.replies || 0),
      engagement: twitter,
    });
  }

  if (performance.engagement_linkedin) {
    const linkedin = performance.engagement_linkedin;
    summaries.push({
      platform: 'linkedin',
      total_interactions: (linkedin.likes || 0) + (linkedin.comments || 0) + (linkedin.shares || 0),
      engagement: linkedin,
    });
  }

  if (performance.engagement_facebook) {
    const facebook = performance.engagement_facebook;
    summaries.push({
      platform: 'facebook',
      total_interactions: (facebook.likes || 0) + (facebook.comments || 0) + (facebook.shares || 0),
      engagement: facebook,
    });
  }

  if (performance.engagement_instagram) {
    const instagram = performance.engagement_instagram;
    summaries.push({
      platform: 'instagram',
      total_interactions:
        (instagram.likes || 0) + (instagram.comments || 0) + (instagram.shares || 0) + (instagram.saves || 0),
      engagement: instagram,
    });
  }

  if (performance.engagement_tiktok) {
    const tiktok = performance.engagement_tiktok;
    summaries.push({
      platform: 'tiktok',
      total_interactions: (tiktok.likes || 0) + (tiktok.comments || 0) + (tiktok.shares || 0),
      engagement: tiktok,
    });
  }

  return summaries.sort((a, b) => b.total_interactions - a.total_interactions);
}

/**
 * Get best performing platform
 */
export function getBestPerformingPlatform(
  performance: ContentPerformance
): { platform: string; engagement: number } | null {
  const summaries = getEngagementSummaries(performance);
  if (summaries.length === 0) return null;

  const best = summaries[0];
  return {
    platform: best.platform,
    engagement: best.total_interactions,
  };
}

// =====================================================
// Data Validation Functions
// =====================================================

/**
 * Validate that performance data is ready for ML training
 */
export function isReadyForTraining(performance: ContentPerformance): boolean {
  return !!(
    performance.viral_score_actual !== undefined &&
    performance.total_engagement !== undefined &&
    performance.total_engagement >= 10 &&
    performance.engagement_collected_at &&
    performance.is_training_data === true
  );
}

/**
 * Validate engagement data completeness
 */
export function hasCompleteEngagementData(performance: ContentPerformance): boolean {
  const hasPlatformData =
    performance.engagement_twitter ||
    performance.engagement_linkedin ||
    performance.engagement_facebook ||
    performance.engagement_instagram ||
    performance.engagement_tiktok;

  const hasMetrics = performance.total_engagement !== undefined && performance.viral_score_actual !== undefined;

  return !!(hasPlatformData && hasMetrics);
}

// =====================================================
// Formatting Functions
// =====================================================

/**
 * Format engagement number with K/M suffix
 */
export function formatEngagement(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

/**
 * Format accuracy percentage
 */
export function formatAccuracy(accuracy: number): string {
  return `${accuracy.toFixed(1)}%`;
}

/**
 * Format prediction error
 */
export function formatPredictionError(error: number): string {
  return `±${error}`;
}

// =====================================================
// ML Training Data Preparation
// =====================================================

/**
 * Extract features for ML training from performance record
 * These features will be used to train the ML model in Phase 2
 */
export function extractMLFeatures(performance: ContentPerformance): Record<string, any> {
  return {
    // Predicted features (from heuristic algorithm)
    viral_score_predicted: performance.viral_score_predicted,
    volume_score: performance.predicted_factors?.volume || 0,
    multi_source_score: performance.predicted_factors?.multiSource || 0,
    specificity_score: performance.predicted_factors?.specificity || 0,
    freshness_score: performance.predicted_factors?.freshness || 0,

    // Trend features
    trend_source: performance.trend_source,
    trend_word_count: performance.trend_title.split(/\s+/).length,

    // Content features
    content_type: performance.content_type,
    num_platforms: performance.platforms?.length || 0,

    // Temporal features (if published_at is available)
    hour_published: performance.published_at ? new Date(performance.published_at).getHours() : null,
    day_of_week: performance.published_at ? new Date(performance.published_at).getDay() : null,
    is_weekend:
      performance.published_at
        ? [0, 6].includes(new Date(performance.published_at).getDay())
        : null,

    // Target variable (what ML learns to predict)
    viral_score_actual: performance.viral_score_actual,
  };
}

/**
 * Convert performance records to CSV for ML training export
 */
export function convertToCSV(records: ContentPerformance[]): string {
  if (records.length === 0) return '';

  // Extract features from first record to get headers
  const firstFeatures = extractMLFeatures(records[0]);
  const headers = Object.keys(firstFeatures);

  // Create CSV header row
  const csvRows: string[] = [headers.join(',')];

  // Create CSV data rows
  for (const record of records) {
    const features = extractMLFeatures(record);
    const values = headers.map((header) => {
      const value = features[header];
      // Handle null/undefined
      if (value === null || value === undefined) return '';
      // Quote strings that contain commas
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(csv: string, filename: string = 'ml_training_data.csv'): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
