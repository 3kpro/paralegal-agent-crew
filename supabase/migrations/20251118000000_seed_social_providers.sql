-- ============================================================================
-- Seed Social Providers
-- ============================================================================
-- Inserts the 6 supported social media platforms into social_providers table
-- ============================================================================

-- Insert all 6 social platforms
INSERT INTO public.social_providers (
  provider_key,
  name,
  description,
  logo_url,
  auth_type,
  oauth_config,
  docs_url,
  setup_instructions,
  required_tier,
  is_active
) VALUES
  -- Instagram
  (
    'instagram',
    'Instagram',
    'Share photos, videos, and reels to your Instagram Business or Creator account',
    '/images/platforms/instagram.svg',
    'oauth',
    '{
      "authUrl": "https://www.facebook.com/v21.0/dialog/oauth",
      "tokenUrl": "https://graph.facebook.com/v21.0/oauth/access_token",
      "scopes": ["instagram_basic", "instagram_content_publish", "pages_read_engagement", "pages_show_list"]
    }'::jsonb,
    'https://developers.facebook.com/docs/instagram-api/getting-started',
    ARRAY[
      'You''ll be redirected to Facebook to authorize 3K Pro Services',
      'Sign in with your Facebook account that manages your Instagram',
      'Select the Instagram Business or Creator account you want to connect',
      'Grant the requested permissions to enable posting',
      'You''ll be redirected back to complete the setup'
    ],
    'free',
    true
  ),

  -- TikTok
  (
    'tiktok',
    'TikTok',
    'Upload videos to your TikTok account',
    '/images/platforms/tiktok.svg',
    'oauth',
    '{
      "authUrl": "https://www.tiktok.com/v2/auth/authorize",
      "tokenUrl": "https://open.tiktokapis.com/v2/oauth/token/",
      "scopes": ["user.info.basic", "video.upload", "video.publish"]
    }'::jsonb,
    'https://developers.tiktok.com/doc/content-posting-api-get-started',
    ARRAY[
      'You''ll be redirected to TikTok to authorize 3K Pro Services',
      'Sign in with your TikTok account',
      'Grant the requested permissions to enable video posting',
      'You''ll be redirected back to complete the setup'
    ],
    'free',
    true
  ),

  -- YouTube
  (
    'youtube',
    'YouTube',
    'Upload videos to your YouTube channel',
    '/images/platforms/youtube.svg',
    'oauth',
    '{
      "authUrl": "https://accounts.google.com/o/oauth2/v2/auth",
      "tokenUrl": "https://oauth2.googleapis.com/token",
      "scopes": ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube"]
    }'::jsonb,
    'https://developers.google.com/youtube/v3/getting-started',
    ARRAY[
      'You''ll be redirected to Google to authorize 3K Pro Services',
      'Select the Google account that manages your YouTube channel',
      'Grant the requested permissions to upload videos',
      'You''ll be redirected back to complete the setup'
    ],
    'free',
    true
  ),

  -- Facebook
  (
    'facebook',
    'Facebook',
    'Post to your Facebook Page or personal timeline',
    '/images/platforms/facebook.svg',
    'oauth',
    '{
      "authUrl": "https://www.facebook.com/v21.0/dialog/oauth",
      "tokenUrl": "https://graph.facebook.com/v21.0/oauth/access_token",
      "scopes": ["pages_manage_posts", "pages_read_engagement", "pages_show_list", "public_profile"]
    }'::jsonb,
    'https://developers.facebook.com/docs/pages-api/get-started',
    ARRAY[
      'You''ll be redirected to Facebook to authorize 3K Pro Services',
      'Sign in with your Facebook account',
      'Select the Facebook Page you want to manage',
      'Grant the requested permissions to enable posting',
      'You''ll be redirected back to complete the setup'
    ],
    'free',
    true
  ),

  -- LinkedIn
  (
    'linkedin',
    'LinkedIn',
    'Share posts on your LinkedIn profile or company page',
    '/images/platforms/linkedin.svg',
    'oauth',
    '{
      "authUrl": "https://www.linkedin.com/oauth/v2/authorization",
      "tokenUrl": "https://www.linkedin.com/oauth/v2/accessToken",
      "scopes": ["profile", "email", "w_member_social"]
    }'::jsonb,
    'https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin',
    ARRAY[
      'You''ll be redirected to LinkedIn to authorize 3K Pro Services',
      'Sign in with your LinkedIn account',
      'Grant the requested permissions to enable posting',
      'You''ll be redirected back to complete the setup'
    ],
    'free',
    true
  ),

  -- Twitter/X
  (
    'twitter',
    'Twitter / X',
    'Post tweets and media to your Twitter/X account',
    '/images/platforms/twitter.svg',
    'oauth',
    '{
      "authUrl": "https://twitter.com/i/oauth2/authorize",
      "tokenUrl": "https://api.twitter.com/2/oauth2/token",
      "scopes": ["tweet.read", "tweet.write", "users.read"]
    }'::jsonb,
    'https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/introduction',
    ARRAY[
      'You''ll be redirected to Twitter/X to authorize 3K Pro Services',
      'Sign in with your Twitter/X account',
      'Grant the requested permissions to enable posting',
      'You''ll be redirected back to complete the setup'
    ],
    'free',
    true
  )
ON CONFLICT (provider_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  logo_url = EXCLUDED.logo_url,
  auth_type = EXCLUDED.auth_type,
  oauth_config = EXCLUDED.oauth_config,
  docs_url = EXCLUDED.docs_url,
  setup_instructions = EXCLUDED.setup_instructions,
  required_tier = EXCLUDED.required_tier,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
