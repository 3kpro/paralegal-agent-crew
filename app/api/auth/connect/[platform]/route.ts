import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: { platform: string } }
) {
  try {
    const { platform } = params
    const { searchParams } = new URL(request.url)
    const origin = request.headers.get('origin') || 'http://localhost:3000'

    // Validate platform
    const validPlatforms = ['twitter', 'linkedin', 'facebook', 'instagram', 'tiktok', 'reddit']
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })
    }

    // Get current user
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.redirect(`${origin}/login`)
    }

    // For now, redirect to a connection page
    // In a real implementation, this would initiate OAuth flow
    return NextResponse.redirect(`${origin}/connect/${platform}?from=onboarding`)
    
  } catch (error) {
    console.error('Social connection error:', error)
    return NextResponse.json({ error: 'Connection failed' }, { status: 500 })
  }
}