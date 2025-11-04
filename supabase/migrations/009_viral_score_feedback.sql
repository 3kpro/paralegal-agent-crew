-- Migration: Viral Score Feedback Tracking System
-- Purpose: Enable Phase 2 ML training by tracking actual content performance vs predicted viral scores
-- Created: November 3, 2025

-- =====================================================
-- Table: content_performance
-- Tracks actual engagement metrics for ML training
-- =====================================================

CREATE TABLE IF NOT EXISTS content_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- References
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  post_id UUID REFERENCES scheduled_posts(id) ON DELETE SET NULL,

  -- Trend Information (what was predicted)
  trend_title TEXT NOT NULL,
  trend_source TEXT, -- 'google', 'twitter', 'reddit', 'gemini-ai', 'mixed'
  viral_score_predicted INTEGER NOT NULL CHECK (viral_score_predicted >= 0 AND viral_score_predicted <= 100),
  viral_potential_predicted TEXT NOT NULL CHECK (viral_potential_predicted IN ('high', 'medium', 'low')),

  -- Predicted breakdown (for analysis)
  predicted_factors JSONB DEFAULT '{}'::jsonb, -- {volume: 40, multiSource: 30, specificity: 20, freshness: 10}

  -- Content Information
  content_text TEXT,
  content_type TEXT, -- 'twitter', 'linkedin', 'facebook', 'instagram', 'tiktok'
  platforms TEXT[] DEFAULT '{}', -- Array of platforms where published
  published_at TIMESTAMP WITH TIME ZONE,

  -- Actual Engagement Metrics (collected 24-48 hours after publishing)
  engagement_twitter JSONB, -- {likes: 150, retweets: 45, replies: 12, impressions: 5000}
  engagement_linkedin JSONB, -- {likes: 89, comments: 23, shares: 15, impressions: 3200}
  engagement_facebook JSONB, -- {likes: 200, comments: 45, shares: 67}
  engagement_instagram JSONB, -- {likes: 450, comments: 89, shares: 34}
  engagement_tiktok JSONB, -- {likes: 1200, comments: 234, shares: 89, views: 15000}

  -- Calculated Metrics
  total_engagement INTEGER DEFAULT 0, -- Sum of all interactions
  engagement_rate DECIMAL(5,2), -- (total_engagement / total_impressions) * 100
  viral_score_actual INTEGER CHECK (viral_score_actual >= 0 AND viral_score_actual <= 100), -- Calculated from actual engagement
  was_viral BOOLEAN, -- total_engagement > threshold (10000)

  -- Performance Comparison
  prediction_error INTEGER, -- abs(viral_score_predicted - viral_score_actual)
  prediction_accuracy DECIMAL(5,2), -- 100 - (prediction_error)

  -- ML Training Metadata
  is_training_data BOOLEAN DEFAULT false, -- Ready to use for ML training
  training_data_quality TEXT CHECK (training_data_quality IN ('high', 'medium', 'low', 'excluded')),
  excluded_reason TEXT, -- Why excluded from training (if applicable)

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  engagement_collected_at TIMESTAMP WITH TIME ZONE, -- When engagement data was collected
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

CREATE INDEX idx_content_performance_user_id ON content_performance(user_id);
CREATE INDEX idx_content_performance_campaign_id ON content_performance(campaign_id);
CREATE INDEX idx_content_performance_published_at ON content_performance(published_at);
CREATE INDEX idx_content_performance_is_training_data ON content_performance(is_training_data) WHERE is_training_data = true;
CREATE INDEX idx_content_performance_viral_predicted ON content_performance(viral_score_predicted);
CREATE INDEX idx_content_performance_viral_actual ON content_performance(viral_score_actual) WHERE viral_score_actual IS NOT NULL;
CREATE INDEX idx_content_performance_trend_title ON content_performance(trend_title);

-- GIN index for JSONB queries
CREATE INDEX idx_content_performance_predicted_factors ON content_performance USING GIN (predicted_factors);

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

ALTER TABLE content_performance ENABLE ROW LEVEL SECURITY;

-- Users can view their own performance data
CREATE POLICY "Users can view own content performance"
  ON content_performance
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own performance data
CREATE POLICY "Users can insert own content performance"
  ON content_performance
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own performance data
CREATE POLICY "Users can update own content performance"
  ON content_performance
  FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- Functions for Engagement Scoring
-- =====================================================

-- Calculate total engagement from all platforms
CREATE OR REPLACE FUNCTION calculate_total_engagement(
  p_twitter JSONB,
  p_linkedin JSONB,
  p_facebook JSONB,
  p_instagram JSONB,
  p_tiktok JSONB
) RETURNS INTEGER AS $$
DECLARE
  total INTEGER := 0;
BEGIN
  -- Twitter: likes + retweets + replies
  IF p_twitter IS NOT NULL THEN
    total := total +
      COALESCE((p_twitter->>'likes')::INTEGER, 0) +
      COALESCE((p_twitter->>'retweets')::INTEGER, 0) +
      COALESCE((p_twitter->>'replies')::INTEGER, 0);
  END IF;

  -- LinkedIn: likes + comments + shares
  IF p_linkedin IS NOT NULL THEN
    total := total +
      COALESCE((p_linkedin->>'likes')::INTEGER, 0) +
      COALESCE((p_linkedin->>'comments')::INTEGER, 0) +
      COALESCE((p_linkedin->>'shares')::INTEGER, 0);
  END IF;

  -- Facebook: likes + comments + shares
  IF p_facebook IS NOT NULL THEN
    total := total +
      COALESCE((p_facebook->>'likes')::INTEGER, 0) +
      COALESCE((p_facebook->>'comments')::INTEGER, 0) +
      COALESCE((p_facebook->>'shares')::INTEGER, 0);
  END IF;

  -- Instagram: likes + comments + shares
  IF p_instagram IS NOT NULL THEN
    total := total +
      COALESCE((p_instagram->>'likes')::INTEGER, 0) +
      COALESCE((p_instagram->>'comments')::INTEGER, 0) +
      COALESCE((p_instagram->>'shares')::INTEGER, 0);
  END IF;

  -- TikTok: likes + comments + shares
  IF p_tiktok IS NOT NULL THEN
    total := total +
      COALESCE((p_tiktok->>'likes')::INTEGER, 0) +
      COALESCE((p_tiktok->>'comments')::INTEGER, 0) +
      COALESCE((p_tiktok->>'shares')::INTEGER, 0);
  END IF;

  RETURN total;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Calculate actual viral score from engagement metrics
-- Maps engagement to 0-100 scale using logarithmic scaling
CREATE OR REPLACE FUNCTION calculate_actual_viral_score(
  p_total_engagement INTEGER
) RETURNS INTEGER AS $$
DECLARE
  score INTEGER;
BEGIN
  -- Logarithmic scaling:
  -- 0-100 engagement = 0-20 score
  -- 100-1K engagement = 20-40 score
  -- 1K-10K engagement = 40-70 score
  -- 10K+ engagement = 70-100 score

  IF p_total_engagement >= 50000 THEN
    score := 100;
  ELSIF p_total_engagement >= 10000 THEN
    score := 70 + ((p_total_engagement - 10000) / 40000.0 * 30)::INTEGER;
  ELSIF p_total_engagement >= 1000 THEN
    score := 40 + ((p_total_engagement - 1000) / 9000.0 * 30)::INTEGER;
  ELSIF p_total_engagement >= 100 THEN
    score := 20 + ((p_total_engagement - 100) / 900.0 * 20)::INTEGER;
  ELSE
    score := (p_total_engagement / 100.0 * 20)::INTEGER;
  END IF;

  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- Trigger: Auto-calculate metrics on update
-- =====================================================

CREATE OR REPLACE FUNCTION update_content_performance_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate total engagement
  NEW.total_engagement := calculate_total_engagement(
    NEW.engagement_twitter,
    NEW.engagement_linkedin,
    NEW.engagement_facebook,
    NEW.engagement_instagram,
    NEW.engagement_tiktok
  );

  -- Calculate actual viral score
  IF NEW.total_engagement IS NOT NULL THEN
    NEW.viral_score_actual := calculate_actual_viral_score(NEW.total_engagement);
  END IF;

  -- Determine if viral (>10K engagement)
  NEW.was_viral := NEW.total_engagement >= 10000;

  -- Calculate prediction error and accuracy
  IF NEW.viral_score_actual IS NOT NULL THEN
    NEW.prediction_error := ABS(NEW.viral_score_predicted - NEW.viral_score_actual);
    NEW.prediction_accuracy := 100 - NEW.prediction_error;
  END IF;

  -- Mark as training data if engagement collected and quality is high
  IF NEW.engagement_collected_at IS NOT NULL AND NEW.total_engagement >= 10 THEN
    NEW.is_training_data := true;

    -- Determine training data quality
    IF NEW.total_engagement >= 100 THEN
      NEW.training_data_quality := 'high';
    ELSIF NEW.total_engagement >= 10 THEN
      NEW.training_data_quality := 'medium';
    ELSE
      NEW.training_data_quality := 'low';
    END IF;
  END IF;

  -- Update timestamp
  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_content_performance_metrics
  BEFORE INSERT OR UPDATE ON content_performance
  FOR EACH ROW
  EXECUTE FUNCTION update_content_performance_metrics();

-- =====================================================
-- View: ML Training Data Export
-- =====================================================

CREATE OR REPLACE VIEW ml_training_data AS
SELECT
  id,
  user_id,
  trend_title,
  trend_source,
  viral_score_predicted,
  viral_potential_predicted,
  predicted_factors,
  content_type,
  platforms,
  total_engagement,
  viral_score_actual,
  was_viral,
  prediction_error,
  prediction_accuracy,
  training_data_quality,
  published_at,
  engagement_collected_at
FROM content_performance
WHERE is_training_data = true
  AND training_data_quality IN ('high', 'medium')
  AND viral_score_actual IS NOT NULL
ORDER BY published_at DESC;

-- Grant access to authenticated users
GRANT SELECT ON ml_training_data TO authenticated;

-- =====================================================
-- View: Prediction Accuracy Analytics
-- =====================================================

CREATE OR REPLACE VIEW viral_score_analytics AS
SELECT
  COUNT(*) as total_predictions,
  COUNT(*) FILTER (WHERE viral_score_actual IS NOT NULL) as predictions_with_data,
  ROUND(AVG(prediction_error), 2) as avg_prediction_error,
  ROUND(AVG(prediction_accuracy), 2) as avg_prediction_accuracy,
  COUNT(*) FILTER (WHERE viral_potential_predicted = 'high') as predicted_high,
  COUNT(*) FILTER (WHERE viral_potential_predicted = 'medium') as predicted_medium,
  COUNT(*) FILTER (WHERE viral_potential_predicted = 'low') as predicted_low,
  COUNT(*) FILTER (WHERE was_viral = true) as actual_viral,
  COUNT(*) FILTER (WHERE viral_potential_predicted = 'high' AND was_viral = true) as high_prediction_correct,
  COUNT(*) FILTER (WHERE is_training_data = true) as training_data_ready,
  MIN(published_at) as earliest_data,
  MAX(published_at) as latest_data
FROM content_performance
WHERE user_id = auth.uid();

-- Grant access to authenticated users
GRANT SELECT ON viral_score_analytics TO authenticated;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE content_performance IS 'Tracks actual content performance vs predicted viral scores for ML training';
COMMENT ON COLUMN content_performance.viral_score_predicted IS 'Viral score predicted by heuristic algorithm (0-100)';
COMMENT ON COLUMN content_performance.viral_score_actual IS 'Viral score calculated from actual engagement (0-100)';
COMMENT ON COLUMN content_performance.is_training_data IS 'Whether this record is ready for ML training';
COMMENT ON COLUMN content_performance.training_data_quality IS 'Quality of training data: high (100+ engagement), medium (10-99), low (<10)';
COMMENT ON FUNCTION calculate_total_engagement IS 'Sums all engagement metrics across all platforms';
COMMENT ON FUNCTION calculate_actual_viral_score IS 'Maps total engagement to 0-100 viral score using logarithmic scaling';
COMMENT ON VIEW ml_training_data IS 'Filtered view of high-quality training data for ML model';
COMMENT ON VIEW viral_score_analytics IS 'Real-time analytics on viral score prediction accuracy';
