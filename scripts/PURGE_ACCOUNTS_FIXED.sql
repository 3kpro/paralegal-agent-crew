-- ============================================
-- PURGE ALL TEST ACCOUNTS (FIXED - handles foreign keys)
-- Keeps only: james.lawson@gmail.com
-- ============================================
--
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Copy this ENTIRE script
-- 3. Run it all at once
--
-- ============================================

-- STEP 1: Preview what will be deleted
SELECT
  u.id,
  u.email,
  u.created_at,
  CASE
    WHEN u.email = 'james.lawson@gmail.com' THEN '✅ KEEP'
    ELSE '🗑️ DELETE'
  END as action
FROM auth.users u
ORDER BY
  CASE WHEN u.email = 'james.lawson@gmail.com' THEN 0 ELSE 1 END,
  u.created_at DESC;

-- ============================================
-- STEP 2: DELETE (in correct order to handle foreign keys)
-- ============================================

-- Delete profiles first (to avoid foreign key constraint)
DELETE FROM public.profiles
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email != 'james.lawson@gmail.com'
);

-- Delete sessions
DELETE FROM auth.sessions
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email != 'james.lawson@gmail.com'
);

-- Now delete the users
DELETE FROM auth.users
WHERE email != 'james.lawson@gmail.com';

-- ============================================
-- STEP 3: Verify only james.lawson@gmail.com remains
-- ============================================

SELECT
  COUNT(*) as total_users,
  STRING_AGG(email, ', ') as remaining_emails
FROM auth.users;

-- Should return: total_users = 1, remaining_emails = 'james.lawson@gmail.com'
