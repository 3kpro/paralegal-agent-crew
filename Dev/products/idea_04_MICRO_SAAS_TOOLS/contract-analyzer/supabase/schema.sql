-- ContractGuard AI Database Schema
-- Last Updated: 2026-01-11

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'monthly', 'lifetime')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  analyses_count INT DEFAULT 0,
  analyses_limit INT DEFAULT 1, -- Free tier: 1 analysis
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contract analyses table
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Document info
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'docx', 'txt')),
  file_size INT NOT NULL, -- in bytes

  -- Extracted content
  extracted_text TEXT NOT NULL,

  -- Analysis results (JSON format)
  risks JSONB DEFAULT '[]'::jsonb, -- Array of risk objects
  risk_summary JSONB, -- {critical: 2, medium: 5, low: 3}

  -- Status
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  error_message TEXT,

  -- Metadata
  analysis_duration INT, -- in milliseconds
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contract templates table
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('nda', 'sow', 'freelance', 'consulting', 'contractor', 'msa', 'work-for-hire', 'non-compete', 'confidentiality', 'other')),

  -- File info
  file_url TEXT NOT NULL, -- Supabase storage URL
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'docx')),

  -- Metadata
  is_featured BOOLEAN DEFAULT false,
  download_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stripe webhooks log (for debugging)
CREATE TABLE stripe_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  customer_id TEXT,
  subscription_id TEXT,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only view/update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Analyses: Users can only see their own analyses
CREATE POLICY "Users can view own analyses" ON analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses" ON analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses" ON analyses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses" ON analyses
  FOR DELETE USING (auth.uid() = user_id);

-- Templates: Public read access
CREATE POLICY "Templates are publicly readable" ON templates
  FOR SELECT USING (true);

-- Stripe events: Service role only
CREATE POLICY "Stripe events are service-only" ON stripe_events
  USING (false); -- No public access, only service role

-- Functions

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for analyses
CREATE TRIGGER update_analyses_updated_at
  BEFORE UPDATE ON analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_analyses_user_id ON analyses(user_id);
CREATE INDEX idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_stripe_events_event_id ON stripe_events(event_id);

-- Insert sample templates (optional)
INSERT INTO templates (name, description, category, file_url, file_type, is_featured) VALUES
  ('Mutual NDA Template', 'Standard mutual non-disclosure agreement for business discussions', 'nda', 'https://example.com/templates/mutual-nda.pdf', 'pdf', true),
  ('Freelance Service Agreement', 'Comprehensive freelance contract template with payment terms and IP clauses', 'freelance', 'https://example.com/templates/freelance.pdf', 'pdf', true),
  ('Statement of Work (SoW)', 'Project-based SoW template with deliverables and milestones', 'sow', 'https://example.com/templates/sow.pdf', 'pdf', true);

-- Grant permissions (for service role)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
