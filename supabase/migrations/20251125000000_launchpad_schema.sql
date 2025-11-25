-- Create launch_campaigns table
CREATE TABLE IF NOT EXISTS launch_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_url TEXT,
  product_description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create launch_targets table (The "Matrix")
CREATE TABLE IF NOT EXISTS launch_targets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES launch_campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('reddit', 'twitter', 'linkedin', 'facebook', 'instagram', 'tiktok', 'product_hunt', 'indie_hackers', 'other')),
  community_name TEXT NOT NULL, -- e.g. "r/SideProject", "Profile", "Indie Hackers"
  content JSONB DEFAULT '{}'::jsonb, -- Stores title, body, thread array, etc.
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'ready', 'posted')),
  posted_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_launch_campaigns_user_id ON launch_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_launch_targets_campaign_id ON launch_targets(campaign_id);
CREATE INDEX IF NOT EXISTS idx_launch_targets_user_id ON launch_targets(user_id);

-- Enable Row Level Security
ALTER TABLE launch_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_targets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for launch_campaigns
CREATE POLICY "Users can view their own campaigns"
  ON launch_campaigns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own campaigns"
  ON launch_campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns"
  ON launch_campaigns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns"
  ON launch_campaigns FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for launch_targets
CREATE POLICY "Users can view their own targets"
  ON launch_targets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own targets"
  ON launch_targets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own targets"
  ON launch_targets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own targets"
  ON launch_targets FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_launch_campaigns_updated_at
    BEFORE UPDATE ON launch_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_launch_targets_updated_at
    BEFORE UPDATE ON launch_targets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
