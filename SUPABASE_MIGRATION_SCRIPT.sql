-- AI Studio Multi-Provider System Migration
-- Execute this entire script in Supabase SQL Editor
-- Date: October 22, 2025

-- =============================================================================
-- SECTION 1: CREATE TABLES
-- =============================================================================

-- AI Generation Sessions Table
CREATE TABLE ai_generation_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    provider_config JSONB NOT NULL DEFAULT '{}',
    status TEXT CHECK (status IN ('active', 'completed', 'archived')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Provider Configurations Table
CREATE TABLE ai_provider_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    provider_name TEXT NOT NULL,
    provider_type TEXT NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    is_enabled BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, provider_name)
);

-- Content Generation Requests Table
CREATE TABLE content_generation_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES ai_generation_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    prompt TEXT NOT NULL,
    content TEXT,
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
    error TEXT,
    tokens_used INTEGER DEFAULT 0,
    cost_estimate DECIMAL(10,6) DEFAULT 0,
    processing_time_ms INTEGER DEFAULT 0,
    max_tokens INTEGER DEFAULT 1000,
    temperature DECIMAL(3,2) DEFAULT 0.7,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Content Variations Table
CREATE TABLE content_variations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id UUID REFERENCES content_generation_requests(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    variation_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    quality_score DECIMAL(3,2) DEFAULT 0,
    performance_metrics JSONB DEFAULT '{}',
    is_selected BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Prompt Templates Table
CREATE TABLE ai_prompt_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    template TEXT NOT NULL,
    variables TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    average_quality DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Generation Analytics Table
CREATE TABLE content_generation_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id UUID REFERENCES content_generation_requests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    tokens_used INTEGER NOT NULL,
    cost DECIMAL(10,6) NOT NULL,
    processing_time_ms INTEGER NOT NULL,
    quality_score DECIMAL(3,2) DEFAULT 0,
    success BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- SECTION 2: ENABLE ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE ai_generation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_provider_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_generation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_generation_analytics ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- SECTION 3: CREATE RLS POLICIES
-- =============================================================================

-- AI Generation Sessions Policies
CREATE POLICY "Users can view their own sessions" ON ai_generation_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions" ON ai_generation_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON ai_generation_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" ON ai_generation_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- AI Provider Configs Policies
CREATE POLICY "Users can view their own provider configs" ON ai_provider_configs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own provider configs" ON ai_provider_configs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own provider configs" ON ai_provider_configs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own provider configs" ON ai_provider_configs
    FOR DELETE USING (auth.uid() = user_id);

-- Content Generation Requests Policies
CREATE POLICY "Users can view their own requests" ON content_generation_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own requests" ON content_generation_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own requests" ON content_generation_requests
    FOR UPDATE USING (auth.uid() = user_id);

-- Content Variations Policies
CREATE POLICY "Users can view their own variations" ON content_variations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own variations" ON content_variations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own variations" ON content_variations
    FOR UPDATE USING (auth.uid() = user_id);

-- AI Prompt Templates Policies
CREATE POLICY "Users can view their own templates and public templates" ON ai_prompt_templates
    FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own templates" ON ai_prompt_templates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" ON ai_prompt_templates
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" ON ai_prompt_templates
    FOR DELETE USING (auth.uid() = user_id);

-- Content Generation Analytics Policies
CREATE POLICY "Users can view their own analytics" ON content_generation_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics" ON content_generation_analytics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- SECTION 4: CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX idx_ai_generation_sessions_user_id ON ai_generation_sessions(user_id);
CREATE INDEX idx_ai_generation_sessions_status ON ai_generation_sessions(status);
CREATE INDEX idx_ai_provider_configs_user_id ON ai_provider_configs(user_id);
CREATE INDEX idx_content_generation_requests_user_id ON content_generation_requests(user_id);
CREATE INDEX idx_content_generation_requests_session_id ON content_generation_requests(session_id);
CREATE INDEX idx_content_generation_requests_status ON content_generation_requests(status);
CREATE INDEX idx_content_variations_request_id ON content_variations(request_id);
CREATE INDEX idx_content_variations_user_id ON content_variations(user_id);
CREATE INDEX idx_ai_prompt_templates_user_id ON ai_prompt_templates(user_id);
CREATE INDEX idx_ai_prompt_templates_category ON ai_prompt_templates(category);
CREATE INDEX idx_ai_prompt_templates_public ON ai_prompt_templates(is_public);
CREATE INDEX idx_content_generation_analytics_user_id ON content_generation_analytics(user_id);
CREATE INDEX idx_content_generation_analytics_provider ON content_generation_analytics(provider);

-- =============================================================================
-- SECTION 5: CREATE TRIGGERS FOR UPDATED_AT
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_generation_sessions_updated_at 
    BEFORE UPDATE ON ai_generation_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_provider_configs_updated_at 
    BEFORE UPDATE ON ai_provider_configs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_prompt_templates_updated_at 
    BEFORE UPDATE ON ai_prompt_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SECTION 6: INSERT SAMPLE DATA
-- =============================================================================

-- Insert public prompt templates
INSERT INTO ai_prompt_templates (user_id, name, category, description, template, variables, is_public, usage_count, average_quality) VALUES
(NULL, 'Blog Post Writer', 'Content Creation', 'Generate engaging blog posts on any topic', 'Write a comprehensive blog post about {topic}. The post should be {length} words long, targeting {audience}. Include an engaging introduction, well-structured body paragraphs, and a compelling conclusion. Use a {tone} tone throughout.', ARRAY['topic', 'length', 'audience', 'tone'], true, 156, 4.2),
(NULL, 'Social Media Post', 'Social Media', 'Create engaging social media content', 'Create a {platform} post about {topic}. Make it {tone} and include relevant hashtags. The post should be engaging and encourage {call_to_action}. Keep it within {character_limit} characters.', ARRAY['platform', 'topic', 'tone', 'call_to_action', 'character_limit'], true, 89, 4.0),
(NULL, 'Product Description', 'E-commerce', 'Write compelling product descriptions', 'Write a compelling product description for {product_name}. Highlight the key features: {features}. Target audience is {target_audience}. Use a {tone} tone and include a call-to-action. Focus on benefits over features.', ARRAY['product_name', 'features', 'target_audience', 'tone'], true, 234, 4.3),
(NULL, 'Email Newsletter', 'Email Marketing', 'Generate newsletter content', 'Create an engaging email newsletter about {topic}. Include a catchy subject line, personalized greeting, main content about {main_points}, and a clear call-to-action for {desired_action}. Keep the tone {tone}.', ARRAY['topic', 'main_points', 'desired_action', 'tone'], true, 67, 3.9),
(NULL, 'SEO Article', 'SEO Content', 'Create SEO-optimized articles', 'Write an SEO-optimized article about {keyword}. Target keyword density of 1-2%. Include H2 and H3 headings, meta description, and focus on providing value to readers interested in {user_intent}. Length: {word_count} words.', ARRAY['keyword', 'user_intent', 'word_count'], true, 145, 4.1);

-- Insert sample analytics data
INSERT INTO content_generation_analytics (user_id, provider, model, tokens_used, cost, processing_time_ms, quality_score, success, created_at) VALUES
(NULL, 'gemini', 'gemini-pro', 245, 0.0049, 1250, 4.2, true, NOW() - INTERVAL '1 day'),
(NULL, 'lm_studio', 'local-model', 189, 0.0000, 890, 3.8, true, NOW() - INTERVAL '2 days'),
(NULL, 'gemini', 'gemini-pro', 567, 0.0113, 2100, 4.5, true, NOW() - INTERVAL '3 days'),
(NULL, 'lm_studio', 'local-model', 334, 0.0000, 1560, 3.9, true, NOW() - INTERVAL '4 days'),
(NULL, 'gemini', 'gemini-pro', 123, 0.0025, 780, 4.0, true, NOW() - INTERVAL '5 days'),
(NULL, 'lm_studio', 'local-model', 445, 0.0000, 2200, 4.1, true, NOW() - INTERVAL '6 days'),
(NULL, 'gemini', 'gemini-pro', 678, 0.0136, 2890, 4.7, true, NOW() - INTERVAL '7 days'),
(NULL, 'lm_studio', 'local-model', 234, 0.0000, 1100, 3.7, true, NOW() - INTERVAL '8 days'),
(NULL, 'gemini', 'gemini-pro', 345, 0.0069, 1450, 4.3, true, NOW() - INTERVAL '9 days'),
(NULL, 'lm_studio', 'local-model', 567, 0.0000, 2500, 4.0, true, NOW() - INTERVAL '10 days');

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Verify tables were created
SELECT 'Migration completed successfully. Tables created:' AS status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE 'ai_%' OR table_name LIKE 'content_%')
ORDER BY table_name;