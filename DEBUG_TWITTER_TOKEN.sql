-- Run this in Supabase SQL Editor to check your Twitter token status
-- Replace 'james.lawson@gmail.com' with your actual email

-- 1. Check user_social_connections for Twitter
SELECT
  id,
  connection_name,
  account_username,
  account_id,
  is_active,
  test_status,
  test_error,
  last_tested_at,
  created_at,
  updated_at,
  token_expires_at,
  -- Check if tokens exist (not their values, just if they're there)
  access_token_encrypted IS NOT NULL as has_access_token,
  refresh_token_encrypted IS NOT NULL as has_refresh_token,
  LENGTH(access_token_encrypted) as token_length
FROM user_social_connections
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'james.lawson@gmail.com')
AND provider_id = (SELECT id FROM social_providers WHERE provider_key = 'twitter')
ORDER BY created_at DESC;

-- 2. Check if token is expired
SELECT
  connection_name,
  token_expires_at,
  token_expires_at < NOW() as is_expired,
  EXTRACT(EPOCH FROM (token_expires_at - NOW()))/60 as minutes_until_expiry
FROM user_social_connections
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'james.lawson@gmail.com')
AND provider_id = (SELECT id FROM social_providers WHERE provider_key = 'twitter');

-- 3. Check OLD social_accounts table (should be empty)
SELECT
  platform,
  platform_username,
  is_active,
  token_expires_at,
  created_at
FROM social_accounts
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'james.lawson@gmail.com')
AND platform = 'twitter';
