-- Run this in Supabase SQL Editor to check your Twitter connection status

-- 1. Check if you have any social connections at all
SELECT
  usc.id,
  usc.connection_name,
  usc.account_username,
  usc.is_active,
  usc.test_status,
  sp.provider_key,
  sp.name,
  usc.access_token_encrypted IS NOT NULL as has_access_token,
  usc.refresh_token_encrypted IS NOT NULL as has_refresh_token,
  usc.created_at
FROM user_social_connections usc
JOIN social_providers sp ON usc.provider_id = sp.id
WHERE usc.user_id = (
  SELECT id FROM auth.users WHERE email = 'james.lawson@gmail.com'
)
ORDER BY usc.created_at DESC;

-- 2. Check if Twitter provider exists
SELECT * FROM social_providers WHERE provider_key = 'twitter';

-- 3. Check for any connections in the OLD table (shouldn't have any for Twitter)
SELECT * FROM social_accounts WHERE platform = 'twitter';
