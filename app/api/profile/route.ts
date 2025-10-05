import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, profile })
  } catch (error: any) {
    console.error('Profile GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updates = await request.json()

    // Fields that should NOT be updated directly via this endpoint
    const protectedFields = [
      'id',
      'email',
      'created_at',
      'stripe_customer_id',
      'stripe_subscription_id',
      'subscription_tier',
      'subscription_status',
      'subscription_current_period_end',
      'ai_tools_limit'
    ]

    // Remove protected fields from updates
    const allowedUpdates = Object.keys(updates)
      .filter(key => !protectedFields.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = updates[key]
        return obj
      }, {})

    // Validate URL fields if present
    if (allowedUpdates.website && !isValidURL(allowedUpdates.website)) {
      return NextResponse.json({
        error: 'Invalid website URL format'
      }, { status: 400 })
    }

    if (allowedUpdates.linkedin_url && !isValidURL(allowedUpdates.linkedin_url)) {
      return NextResponse.json({
        error: 'Invalid LinkedIn URL format'
      }, { status: 400 })
    }

    if (allowedUpdates.facebook_url && !isValidURL(allowedUpdates.facebook_url)) {
      return NextResponse.json({
        error: 'Invalid Facebook URL format'
      }, { status: 400 })
    }

    // Validate bio length
    if (allowedUpdates.bio && allowedUpdates.bio.length > 500) {
      return NextResponse.json({
        error: 'Bio must be 500 characters or less'
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(allowedUpdates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: data
    })
  } catch (error: any) {
    console.error('Profile PUT error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Helper function to validate URLs
function isValidURL(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    // Check if it's a relative URL (starts with /)
    if (url.startsWith('/')) return true
    // Check if it's a domain without protocol
    if (url.match(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}/)) return true
    return false
  }
}
