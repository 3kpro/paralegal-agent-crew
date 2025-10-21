-- Waitlist table for premium tier signups
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('pro', 'premium')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT, -- Where they signed up from (e.g., 'settings_upgrade_button')
  notified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_user_id ON public.waitlist(user_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_tier ON public.waitlist(tier);

-- RLS Policies
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Users can insert their own waitlist entries
CREATE POLICY "Users can join waitlist"
  ON public.waitlist
  FOR INSERT
  WITH CHECK (true); -- Allow anyone to join waitlist

-- Users can view their own waitlist entries
CREATE POLICY "Users can view own waitlist entries"
  ON public.waitlist
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_waitlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER waitlist_updated_at
  BEFORE UPDATE ON public.waitlist
  FOR EACH ROW
  EXECUTE FUNCTION public.update_waitlist_updated_at();
