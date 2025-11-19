import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const platforms = [
  {
    provider_key: 'instagram',
    name: 'Instagram',
    description: 'Share photos, videos, and reels to your Instagram Business or Creator account',
    logo_url: '/images/platforms/instagram.svg',
    auth_type: 'oauth',
    oauth_config: {
      authUrl: 'https://www.facebook.com/v21.0/dialog/oauth',
      tokenUrl: 'https://graph.facebook.com/v21.0/oauth/access_token',
      scopes: ['instagram_basic', 'instagram_content_publish', 'pages_read_engagement', 'pages_show_list']
    },
    docs_url: 'https://developers.facebook.com/docs/instagram-api/getting-started',
    setup_instructions: [
      'You\'ll be redirected to Facebook to authorize 3K Pro Services',
      'Sign in with your Facebook account that manages your Instagram',
      'Select the Instagram Business or Creator account you want to connect',
      'Grant the requested permissions to enable posting',
      'You\'ll be redirected back to complete the setup'
    ],
    required_tier: 'free',
    is_active: true
  },
  {
    provider_key: 'tiktok',
    name: 'TikTok',
    description: 'Upload videos to your TikTok account',
    logo_url: '/images/platforms/tiktok.svg',
    auth_type: 'oauth',
    oauth_config: {
      authUrl: 'https://www.tiktok.com/v2/auth/authorize',
      tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token/',
      scopes: ['user.info.basic', 'video.upload', 'video.publish']
    },
    docs_url: 'https://developers.tiktok.com/doc/content-posting-api-get-started',
    setup_instructions: [
      'You\'ll be redirected to TikTok to authorize 3K Pro Services',
      'Sign in with your TikTok account',
      'Grant the requested permissions to enable video posting',
      'You\'ll be redirected back to complete the setup'
    ],
    required_tier: 'free',
    is_active: true
  },
  {
    provider_key: 'youtube',
    name: 'YouTube',
    description: 'Upload videos to your YouTube channel',
    logo_url: '/images/platforms/youtube.svg',
    auth_type: 'oauth',
    oauth_config: {
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: ['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube']
    },
    docs_url: 'https://developers.google.com/youtube/v3/getting-started',
    setup_instructions: [
      'You\'ll be redirected to Google to authorize 3K Pro Services',
      'Select the Google account that manages your YouTube channel',
      'Grant the requested permissions to upload videos',
      'You\'ll be redirected back to complete the setup'
    ],
    required_tier: 'free',
    is_active: true
  },
  {
    provider_key: 'facebook',
    name: 'Facebook',
    description: 'Post to your Facebook Page or personal timeline',
    logo_url: '/images/platforms/facebook.svg',
    auth_type: 'oauth',
    oauth_config: {
      authUrl: 'https://www.facebook.com/v21.0/dialog/oauth',
      tokenUrl: 'https://graph.facebook.com/v21.0/oauth/access_token',
      scopes: ['pages_manage_posts', 'pages_read_engagement', 'pages_show_list', 'public_profile']
    },
    docs_url: 'https://developers.facebook.com/docs/pages-api/get-started',
    setup_instructions: [
      'You\'ll be redirected to Facebook to authorize 3K Pro Services',
      'Sign in with your Facebook account',
      'Select the Facebook Page you want to manage',
      'Grant the requested permissions to enable posting',
      'You\'ll be redirected back to complete the setup'
    ],
    required_tier: 'free',
    is_active: true
  },
  {
    provider_key: 'linkedin',
    name: 'LinkedIn',
    description: 'Share posts on your LinkedIn profile or company page',
    logo_url: '/images/platforms/linkedin.svg',
    auth_type: 'oauth',
    oauth_config: {
      authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
      tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
      scopes: ['profile', 'email', 'w_member_social']
    },
    docs_url: 'https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin',
    setup_instructions: [
      'You\'ll be redirected to LinkedIn to authorize 3K Pro Services',
      'Sign in with your LinkedIn account',
      'Grant the requested permissions to enable posting',
      'You\'ll be redirected back to complete the setup'
    ],
    required_tier: 'free',
    is_active: true
  },
  {
    provider_key: 'twitter',
    name: 'Twitter / X',
    description: 'Post tweets and media to your Twitter/X account',
    logo_url: '/images/platforms/twitter.svg',
    auth_type: 'oauth',
    oauth_config: {
      authUrl: 'https://twitter.com/i/oauth2/authorize',
      tokenUrl: 'https://api.twitter.com/2/oauth2/token',
      scopes: ['tweet.read', 'tweet.write', 'users.read']
    },
    docs_url: 'https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/introduction',
    setup_instructions: [
      'You\'ll be redirected to Twitter/X to authorize 3K Pro Services',
      'Sign in with your Twitter/X account',
      'Grant the requested permissions to enable posting',
      'You\'ll be redirected back to complete the setup'
    ],
    required_tier: 'free',
    is_active: true
  }
]

async function seedPlatforms() {
  console.log('🌱 Seeding social_providers table...')

  for (const platform of platforms) {
    const { data, error } = await supabase
      .from('social_providers')
      .upsert(platform, {
        onConflict: 'provider_key',
        ignoreDuplicates: false
      })

    if (error) {
      console.error(`❌ Error seeding ${platform.name}:`, error)
    } else {
      console.log(`✅ Seeded ${platform.name}`)
    }
  }

  console.log('✨ Done!')
}

seedPlatforms().catch(console.error)
