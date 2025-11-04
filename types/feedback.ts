/**
 * Feedback Tracking System Types
 *
 * Purpose: Enable Phase 2 ML training by tracking actual content performance
 * vs predicted viral scores from the heuristic algorithm.
 *
 * Created: November 3, 2025
 */

// =====================================================
// Platform Engagement Metrics
// =====================================================

export interface TwitterEngagement {
  likes: number;
  retweets: number;
  replies: number;
  impressions?: number;
  url_clicks?: number;
  profile_visits?: number;
}

export interface LinkedInEngagement {
  likes: number;
  comments: number;
  shares: number;
  impressions?: number;
  clicks?: number;
}

export interface FacebookEngagement {
  likes: number;
  comments: number;
  shares: number;
  reactions?: number;
  reach?: number;
}

export interface InstagramEngagement {
  likes: number;
  comments: number;
  shares?: number;
  saves?: number;
  reach?: number;
}

export interface TikTokEngagement {
  likes: number;
  comments: number;
  shares: number;
  views: number;
  watch_time?: number;
}

// =====================================================
// Content Performance Record
// =====================================================

export interface ContentPerformance {
  id: string;

  // References
  user_id: string;
  campaign_id?: string | null;
  post_id?: string | null;

  // Trend Information (what was predicted)
  trend_title: string;
  trend_source?: string;
  viral_score_predicted: number; // 0-100
  viral_potential_predicted: 'high' | 'medium' | 'low';

  // Predicted breakdown (for analysis)
  predicted_factors?: {
    volume: number;
    multiSource: number;
    specificity: number;
    freshness: number;
  };

  // Content Information
  content_text?: string;
  content_type?: string; // 'twitter', 'linkedin', etc.
  platforms?: string[];
  published_at?: string;

  // Actual Engagement Metrics
  engagement_twitter?: TwitterEngagement;
  engagement_linkedin?: LinkedInEngagement;
  engagement_facebook?: FacebookEngagement;
  engagement_instagram?: InstagramEngagement;
  engagement_tiktok?: TikTokEngagement;

  // Calculated Metrics (auto-computed by database)
  total_engagement?: number;
  engagement_rate?: number;
  viral_score_actual?: number; // 0-100, calculated from actual engagement
  was_viral?: boolean; // total_engagement > 10000

  // Performance Comparison
  prediction_error?: number;
  prediction_accuracy?: number;

  // ML Training Metadata
  is_training_data?: boolean;
  training_data_quality?: 'high' | 'medium' | 'low' | 'excluded';
  excluded_reason?: string;

  // Timestamps
  created_at?: string;
  engagement_collected_at?: string;
  updated_at?: string;
}

// =====================================================
// API Request/Response Types
// =====================================================

export interface RecordPerformanceRequest {
  campaign_id?: string;
  post_id?: string;
  trend_title: string;
  trend_source?: string;
  viral_score_predicted: number;
  viral_potential_predicted: 'high' | 'medium' | 'low';
  predicted_factors?: {
    volume: number;
    multiSource: number;
    specificity: number;
    freshness: number;
  };
  content_text?: string;
  content_type?: string;
  platforms?: string[];
  published_at?: string;
}

export interface UpdateEngagementRequest {
  performance_id: string;
  twitter?: TwitterEngagement;
  linkedin?: LinkedInEngagement;
  facebook?: FacebookEngagement;
  instagram?: InstagramEngagement;
  tiktok?: TikTokEngagement;
}

export interface PerformanceResponse {
  success: boolean;
  data?: ContentPerformance;
  error?: string;
}

export interface EngagementUpdateResponse {
  success: boolean;
  data?: {
    performance_id: string;
    total_engagement: number;
    viral_score_actual: number;
    was_viral: boolean;
    prediction_accuracy: number;
  };
  error?: string;
}

// =====================================================
// Analytics Types
// =====================================================

export interface ViralScoreAnalytics {
  total_predictions: number;
  predictions_with_data: number;
  avg_prediction_error: number;
  avg_prediction_accuracy: number;
  predicted_high: number;
  predicted_medium: number;
  predicted_low: number;
  actual_viral: number;
  high_prediction_correct: number;
  training_data_ready: number;
  earliest_data?: string;
  latest_data?: string;
}

export interface AnalyticsResponse {
  success: boolean;
  data?: ViralScoreAnalytics;
  error?: string;
}

// =====================================================
// ML Training Export Types
// =====================================================

export interface MLTrainingRecord {
  id: string;
  user_id: string;
  trend_title: string;
  trend_source?: string;
  viral_score_predicted: number;
  viral_potential_predicted: 'high' | 'medium' | 'low';
  predicted_factors?: {
    volume: number;
    multiSource: number;
    specificity: number;
    freshness: number;
  };
  content_type?: string;
  platforms?: string[];
  total_engagement: number;
  viral_score_actual: number;
  was_viral: boolean;
  prediction_error: number;
  prediction_accuracy: number;
  training_data_quality: 'high' | 'medium' | 'low';
  published_at: string;
  engagement_collected_at: string;
}

export interface MLTrainingDataset {
  records: MLTrainingRecord[];
  metadata: {
    total_records: number;
    high_quality: number;
    medium_quality: number;
    date_range: {
      start: string;
      end: string;
    };
    avg_prediction_accuracy: number;
  };
}

export interface ExportMLDataResponse {
  success: boolean;
  data?: MLTrainingDataset;
  download_url?: string;
  error?: string;
}

// =====================================================
// Engagement Collection Types
// =====================================================

export interface EngagementCollectionJob {
  performance_id: string;
  platforms: string[];
  post_ids: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    tiktok?: string;
  };
  scheduled_for: string; // When to collect (24-48 hours after publishing)
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

// =====================================================
// Utility Types
// =====================================================

export type Platform = 'twitter' | 'linkedin' | 'facebook' | 'instagram' | 'tiktok';

export type PlatformEngagement =
  | TwitterEngagement
  | LinkedInEngagement
  | FacebookEngagement
  | InstagramEngagement
  | TikTokEngagement;

export interface EngagementSummary {
  platform: Platform;
  total_interactions: number;
  engagement: PlatformEngagement;
}
