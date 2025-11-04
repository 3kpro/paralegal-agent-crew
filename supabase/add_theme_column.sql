-- Run this SQL in your Supabase SQL Editor to add the theme column
-- https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new

-- Add theme preference column to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system'));

-- Add comment for documentation
COMMENT ON COLUMN profiles.theme IS 'User theme preference: light, dark, or system';

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'theme';
