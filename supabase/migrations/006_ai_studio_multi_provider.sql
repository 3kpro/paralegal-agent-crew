-- AI Studio Multi-Provider Database Schema
-- This migration adds tables for advanced content generation with multiple AI providers

-- AI Generation Sessions table
CREATE TABLE IF NOT EXISTS ai_generation_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_name TEXT NOT NULL,
  project_type TEXT NOT NULL DEFAULT 'content_generation', -- content_generation, bulk_creation, optimization
  status TEXT NOT NULL DEFAULT 'active', -- active, completed, archived
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- AI Provider Configurations table
CREATE TABLE IF NOT EXISTS ai_provider_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL, -- gemini, lm_studio, claude, openai
  provider_type TEXT NOT NULL DEFAULT 'text_generation', -- text_generation, image_generation, analysis
  config_data JSONB NOT NULL DEFAULT '{}'::jsonb, -- API keys, model settings, etc.
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 1, -- Lower number = higher priority
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Generation Requests table
CREATE TABLE IF NOT EXISTS content_generation_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES ai_generation_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  model_name TEXT NOT NULL,
  prompt_template TEXT NOT NULL,
  input_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_content TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  processing_time_ms INTEGER,
  error_message TEXT,
  quality_score DECIMAL(3,2), -- 0.00 to 5.00
  tokens_used INTEGER DEFAULT 0,
  cost_estimate DECIMAL(10,4) DEFAULT 0.0000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Content Variations table (for A/B testing)
CREATE TABLE IF NOT EXISTS content_variations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  generation_request_id UUID NOT NULL REFERENCES content_generation_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  variation_type TEXT NOT NULL DEFAULT 'tone', -- tone, length, style, audience
  original_content TEXT NOT NULL,
  varied_content TEXT NOT NULL,
  variation_params JSONB NOT NULL DEFAULT '{}'::jsonb,
  performance_metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Prompt Templates table
CREATE TABLE IF NOT EXISTS ai_prompt_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general', -- social_media, marketing, blog, email, etc.
  prompt_template TEXT NOT NULL,
  variables JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of variable names
  provider_compatibility TEXT[] NOT NULL DEFAULT ARRAY['gemini', 'lm_studio'], -- Compatible providers
  usage_count INTEGER NOT NULL DEFAULT 0,
  average_quality DECIMAL(3,2) DEFAULT 0.00,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Generation Analytics table
CREATE TABLE IF NOT EXISTS content_generation_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  provider_name TEXT NOT NULL,
  total_requests INTEGER NOT NULL DEFAULT 0,
  successful_requests INTEGER NOT NULL DEFAULT 0,
  failed_requests INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  total_cost DECIMAL(10,4) NOT NULL DEFAULT 0.0000,
  average_quality DECIMAL(3,2) DEFAULT 0.00,
  average_processing_time_ms INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_sessions_user_id ON ai_generation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_status ON ai_generation_sessions(status);
CREATE INDEX IF NOT EXISTS idx_provider_configs_user_id ON ai_provider_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_configs_enabled ON ai_provider_configs(is_enabled);
CREATE INDEX IF NOT EXISTS idx_content_requests_session_id ON content_generation_requests(session_id);
CREATE INDEX IF NOT EXISTS idx_content_requests_user_id ON content_generation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_content_requests_status ON content_generation_requests(status);
CREATE INDEX IF NOT EXISTS idx_content_requests_provider ON content_generation_requests(provider_name);
CREATE INDEX IF NOT EXISTS idx_variations_request_id ON content_variations(generation_request_id);
CREATE INDEX IF NOT EXISTS idx_variations_user_id ON content_variations(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_user_id ON ai_prompt_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_category ON ai_prompt_templates(category);
CREATE INDEX IF NOT EXISTS idx_analytics_user_date ON content_generation_analytics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_analytics_provider ON content_generation_analytics(provider_name);

-- Enable Row Level Security
ALTER TABLE ai_generation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_provider_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_generation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_generation_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can manage their own AI sessions" ON ai_generation_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own provider configs" ON ai_provider_configs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own content requests" ON content_generation_requests
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own content variations" ON content_variations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own prompt templates" ON ai_prompt_templates
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public prompt templates" ON ai_prompt_templates
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own analytics" ON content_generation_analytics
  FOR ALL USING (auth.uid() = user_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_sessions_updated_at BEFORE UPDATE ON ai_generation_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_configs_updated_at BEFORE UPDATE ON ai_provider_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompt_templates_updated_at BEFORE UPDATE ON ai_prompt_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default prompt templates
INSERT INTO ai_prompt_templates (
  user_id, 
  template_name, 
  category, 
  prompt_template, 
  variables, 
  provider_compatibility, 
  is_public
) VALUES 
(
  '00000000-0000-0000-0000-000000000000', -- System user for public templates
  'Social Media Post Generator',
  'social_media',
  'Create an engaging social media post about {topic} for {platform}. The tone should be {tone} and target audience is {audience}. Include relevant hashtags and call-to-action.',
  '["topic", "platform", "tone", "audience"]'::jsonb,
  ARRAY['gemini', 'lm_studio'],
  true
),
(
  '00000000-0000-0000-0000-000000000000',
  'Marketing Email Subject Lines',
  'marketing',
  'Generate 5 compelling email subject lines for {product_type} targeting {target_demographic}. The campaign goal is {campaign_goal}. Make them {tone} and avoid spam words.',
  '["product_type", "target_demographic", "campaign_goal", "tone"]'::jsonb,
  ARRAY['gemini', 'lm_studio'],
  true
),
(
  '00000000-0000-0000-0000-000000000000',
  'Blog Post Outline',
  'blog',
  'Create a detailed blog post outline for "{blog_title}". Target audience: {audience}. Include introduction, 3-5 main sections with subpoints, and conclusion. Tone: {tone}.',
  '["blog_title", "audience", "tone"]'::jsonb,
  ARRAY['gemini', 'lm_studio'],
  true
),
(
  '00000000-0000-0000-0000-000000000000',
  'Product Description',
  'marketing',
  'Write a compelling product description for {product_name}. Key features: {features}. Target customer: {target_customer}. Highlight benefits and include a strong call-to-action.',
  '["product_name", "features", "target_customer"]'::jsonb,
  ARRAY['gemini', 'lm_studio'],
  true
),
(
  '00000000-0000-0000-0000-000000000000',
  'Content Variation Generator',
  'optimization',
  'Take this content: "{original_content}" and create 3 variations with different {variation_type}. Maintain the core message but adjust for {target_change}.',
  '["original_content", "variation_type", "target_change"]'::jsonb,
  ARRAY['gemini', 'lm_studio'],
  true
);

-- Insert default analytics for demonstration
INSERT INTO content_generation_analytics (
  user_id,
  date,
  provider_name,
  total_requests,
  successful_requests,
  failed_requests,
  total_tokens,
  total_cost,
  average_quality,
  average_processing_time_ms
) VALUES 
(
  '00000000-0000-0000-0000-000000000000',
  CURRENT_DATE - INTERVAL '1 day',
  'gemini',
  45,
  42,
  3,
  15420,
  2.1500,
  4.2,
  1850
),
(
  '00000000-0000-0000-0000-000000000000',
  CURRENT_DATE - INTERVAL '1 day',
  'lm_studio',
  12,
  11,
  1,
  8940,
  0.0000,
  3.8,
  3200
);

COMMENT ON TABLE ai_generation_sessions IS 'AI content generation sessions for organizing multiple related requests';
COMMENT ON TABLE ai_provider_configs IS 'User configurations for different AI providers';
COMMENT ON TABLE content_generation_requests IS 'Individual content generation requests with results';
COMMENT ON TABLE content_variations IS 'Content variations for A/B testing and optimization';
COMMENT ON TABLE ai_prompt_templates IS 'Reusable prompt templates for different content types';
COMMENT ON TABLE content_generation_analytics IS 'Analytics and usage statistics for AI content generation';