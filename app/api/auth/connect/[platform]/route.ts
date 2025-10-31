import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateState } from '@/lib/auth/oauth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    const { platform } = await params
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Validate platform
    const validPlatforms = ['twitter', 'tiktok']
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json({ error: 'Platform not supported' }, { status: 400 })
    }

    // Get current user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // Validate origin against allowed domains
    const allowedDomains = [
      'localhost:3000',
      process.env.NEXT_PUBLIC_APP_URL,
      'content-cascade-ai-landing.vercel.app'
    ].filter(Boolean);

    const isValidOrigin = allowedDomains.some(domain => 
      origin === `http://${domain}` || origin === `https://${domain}`
    );

    if (!isValidOrigin) {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
    }

    if (authError || !user) {
      return NextResponse.redirect(`${origin}/login`)
    }

    const state = generateState()

    // Platform-specific OAuth URLs
    const oauthURLs: Record<string, string> = {
      tiktok: `https://open-api.tiktok.com/platform/oauth/connect?` +
        `client_key=${process.env.TIKTOK_CLIENT_KEY}` +
        `&scope=user.info.basic,video.list,video.upload` +
        `&response_type=code` +
        `&redirect_uri=${origin}/api/auth/callback/tiktok` +
        `&state=${state}`,
      twitter: `https://twitter.com/i/oauth2/authorize?` +
        `client_id=${process.env.TWITTER_CLIENT_ID}` +
        `&scope=tweet.read tweet.write users.read` +
        `&response_type=code` +
        `&redirect_uri=${origin}/api/auth/callback/twitter` +
        `&state=${state}`
    }

    // Store state temporarily
    // TODO: Store state in Redis or similar for verification
    
    // Redirect to platform's OAuth page
    return NextResponse.redirect(oauthURLs[platform])

  } catch (error) {
    console.error('OAuth error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/error?message=Authentication failed`)
  }
}