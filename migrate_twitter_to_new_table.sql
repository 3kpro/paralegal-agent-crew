-- ============================================================================
-- Migrate Twitter Connection from social_accounts → user_social_connections
-- ============================================================================
-- This migrates the existing Twitter connection for james.lawson@gmail.com
-- from the legacy social_accounts table to the new user_social_connections table
-- ============================================================================

-- STEP 1: Verify the Twitter provider exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM social_providers WHERE provider_key = 'twitter') THEN
    RAISE EXCEPTION 'Twitter provider not found in social_providers table. Run provider setup first.';
  END IF;
END $$;

-- STEP 2: Migrate Twitter connection
-- Note: This assumes access_token in social_accounts is already encrypted
-- If it's plaintext, you'll need to encrypt it first using your ENCRYPTION_KEY

INSERT INTO user_social_connections (
  user_id,
  provider_id,
  connection_name,
  account_username,
  account_id,
  access_token_encrypted,
  refresh_token_encrypted,
  token_expires_at,
  metadata,
  is_active,
  test_status,
  last_tested_at,
  created_at,
  updated_at
)
SELECT
  sa.user_id,
  (SELECT id FROM social_providers WHERE provider_key = 'twitter'),
  COALESCE(sa.account_name, 'Twitter (@' || sa.platform_username || ')'), -- connection_name
  sa.platform_username, -- account_username (e.g., "3kpro_services")
  sa.platform_user_id, -- account_id (e.g., "1971380765389705216")
  sa.access_token, -- access_token_encrypted (assuming already encrypted)
  sa.refresh_token, -- refresh_token_encrypted (assuming already encrypted)
  sa.token_expires_at,
  sa.metadata, -- Copy existing metadata
  sa.is_active,
  CASE WHEN sa.is_verified THEN 'success' ELSE 'pending' END, -- test_status
  sa.updated_at, -- last_tested_at
  sa.created_at,
  NOW() -- updated_at
FROM social_accounts sa
WHERE sa.platform = 'twitter'
  AND sa.user_id = (SELECT id FROM auth.users WHERE email = 'james.lawson@gmail.com')
ON CONFLICT (user_id, provider_id, connection_name)
DO UPDATE SET
  account_username = EXCLUDED.account_username,
  account_id = EXCLUDED.account_id,
  access_token_encrypted = EXCLUDED.access_token_encrypted,
  refresh_token_encrypted = EXCLUDED.refresh_token_encrypted,
  token_expires_at = EXCLUDED.token_expires_at,
  metadata = EXCLUDED.metadata,
  is_active = EXCLUDED.is_active,
  test_status = EXCLUDED.test_status,
  updated_at = NOW();

-- STEP 3: Verify migration succeeded
DO $$
DECLARE
  connection_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO connection_count
  FROM user_social_connections usc
  JOIN social_providers sp ON usc.provider_id = sp.id
  WHERE sp.provider_key = 'twitter'
    AND usc.user_id = (SELECT id FROM auth.users WHERE email = 'james.lawson@gmail.com');

  IF connection_count = 0 THEN
    RAISE EXCEPTION 'Migration failed - no Twitter connection found in user_social_connections';
  END IF;

  RAISE NOTICE 'SUCCESS: Twitter connection migrated to user_social_connections';
END $$;

-- STEP 4: Display the migrated connection
SELECT
  usc.id,
  usc.connection_name,
  usc.account_username,
  usc.account_id,
  usc.is_active,
  usc.test_status,
  sp.provider_key,
  sp.name,
  usc.access_token_encrypted IS NOT NULL as has_access_token,
  usc.refresh_token_encrypted IS NOT NULL as has_refresh_token,
  usc.created_at,
  usc.updated_at
FROM user_social_connections usc
JOIN social_providers sp ON usc.provider_id = sp.id
WHERE sp.provider_key = 'twitter'
  AND usc.user_id = (SELECT id FROM auth.users WHERE email = 'james.lawson@gmail.com');
