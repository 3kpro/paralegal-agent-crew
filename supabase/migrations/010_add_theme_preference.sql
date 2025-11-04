-- Add theme preference column to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system'));

-- Add comment
COMMENT ON COLUMN profiles.theme IS 'User theme preference: light, dark, or system';
