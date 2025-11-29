-- ============================================
-- PURGE ALL TEST ACCOUNTS
-- Keeps only: james.lawson@gmail.com
-- ============================================
--
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Paste this entire script
-- 3. Review the SELECT output first
-- 4. Uncomment the DELETE sections to execute
-- 5. Run the script
--
-- ============================================

-- STEP 1: See what will be deleted
SELECT
  id,
  email,
  created_at,
  CASE
    WHEN email = 'james.lawson@gmail.com' THEN '✅ KEEP'
    ELSE '🗑️ DELETE'
  END as action
FROM auth.users
ORDER BY
  CASE WHEN email = 'james.lawson@gmail.com' THEN 0 ELSE 1 END,
  created_at DESC;

-- ============================================
-- STEP 2: Uncomment below to DELETE
-- ============================================

-- Delete all users except james.lawson@gmail.com
-- DELETE FROM auth.users
-- WHERE email != 'james.lawson@gmail.com';

-- ============================================
-- STEP 3: Verify only james.lawson@gmail.com remains
-- ============================================

-- SELECT
--   COUNT(*) as total_users,
--   STRING_AGG(email, ', ') as remaining_emails
-- FROM auth.users;

-- ============================================
-- STEP 4: Clean up orphaned data (optional)
-- ============================================

-- Clean up profiles
-- DELETE FROM public.profiles
-- WHERE id NOT IN (SELECT id FROM auth.users);

-- Clean up sessions
-- DELETE FROM auth.sessions
-- WHERE user_id NOT IN (SELECT id FROM auth.users);
