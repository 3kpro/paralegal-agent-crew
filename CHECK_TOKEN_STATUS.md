# Check Token Encryption Status

Before running the migration, you need to check if your Twitter tokens are encrypted or plaintext.

## Run this query in Supabase:

```sql
SELECT
  platform,
  platform_username,
  access_token,
  LENGTH(access_token) as token_length,
  SUBSTRING(access_token, 1, 20) as token_preview
FROM social_accounts
WHERE platform = 'twitter'
  AND user_id = (SELECT id FROM auth.users WHERE email = 'james.lawson@gmail.com');
```

## Interpret Results:

### If token_length is ~100-200 characters and looks random:
✅ **Token IS encrypted** - Safe to run `migrate_twitter_to_new_table.sql`

### If token_length is ~50-60 characters and starts with readable text:
❌ **Token is PLAINTEXT** - You need to:
1. Re-authenticate Twitter (go to Settings → Connections → Connect Twitter)
2. The new OAuth flow will save properly encrypted tokens to `user_social_connections`
3. Then you can delete the old `social_accounts` entry

## Why This Matters:

The new system (`user_social_connections`) requires **AES-256-GCM encrypted tokens** for security. The old system may have stored plaintext tokens. If we migrate plaintext tokens to a field expecting encryption, the decryption will fail and posting won't work.

## Recommended Action:

**Just re-authenticate Twitter from scratch** - This is the safest approach:

1. Go to https://trendpulse.3kpro.services/settings
2. Click "Connections" tab
3. Click "Connect Twitter"
4. Complete OAuth flow
5. Verify it saved to `user_social_connections` by running:
   ```sql
   SELECT * FROM user_social_connections
   WHERE user_id = (SELECT id FROM auth.users WHERE email = 'james.lawson@gmail.com');
   ```

This ensures you have properly encrypted tokens in the new table.
