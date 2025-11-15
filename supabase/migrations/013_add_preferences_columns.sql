-- Add preferences columns to profiles table
-- These are used in the Preferences tab of settings

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS call_to_action TEXT,
ADD COLUMN IF NOT EXISTS tone TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.target_audience IS 'Content generation preference: general, entrepreneur, professional, gamer, hobbyist';
COMMENT ON COLUMN public.profiles.call_to_action IS 'Content generation preference: visit, learn, sign-up, follow';
COMMENT ON COLUMN public.profiles.tone IS 'Content generation preference: professional, casual, educational, promotional, humor';
