import { createClient } from '@/lib/supabase/client'
import { nanoid } from 'nanoid'

export function generateState() {
  return nanoid()
}

export function verifyState(state: string | null) {
  // TODO: Implement state verification against stored state
  return state !== null
}

interface TokenResponse {
  access_token: string
  refresh_token?: string
  expires_in?: number
  scope?: string
  token_type?: string
}

export async function exchangeCodeForTokens(platform: string, code: string): Promise<TokenResponse> {
  const clientId = platform === 'tiktok' 
    ? process.env.TIKTOK_CLIENT_KEY 
    : process.env.TWITTER_CLIENT_ID

  const clientSecret = platform === 'tiktok'
    ? process.env.TIKTOK_CLIENT_SECRET
    : process.env.TWITTER_CLIENT_SECRET

  const tokenUrl = platform === 'tiktok'
    ? 'https://open-api.tiktok.com/oauth/access_token/'
    : 'https://api.twitter.com/2/oauth2/token'

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/${platform}`

  const body = new URLSearchParams({
    code,
    client_id: clientId!,
    client_secret: clientSecret!,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code'
  })

  const response = await fetch(tokenUrl, {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${await response.text()}`)
  }

  return response.json()
}

export async function storeTokens(platform: string, tokens: TokenResponse) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('No authenticated user')
  }

  const expiresAt = tokens.expires_in 
    ? new Date(Date.now() + tokens.expires_in * 1000)
    : null

  await supabase.from('social_accounts').upsert({
    user_id: user.id,
    platform,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    token_expires_at: expiresAt,
    is_active: true,
    updated_at: new Date().toISOString()
  }, {
    onConflict: 'user_id,platform'
  })
}