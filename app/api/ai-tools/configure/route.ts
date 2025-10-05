import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { encryptAPIKey } from '@/lib/encryption'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { providerId, apiKey, configuration } = body

    // Validate required fields
    if (!providerId) {
      return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 })
    }

    // Verify provider exists and check tier access
    const { data: provider, error: providerError } = await supabase
      .from('ai_providers')
      .select('required_tier, provider_key')
      .eq('id', providerId)
      .single()

    if (providerError || !provider) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 404 })
    }

    // Check user's tier access
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    const tierHierarchy: Record<string, number> = { free: 0, pro: 1, premium: 2 }
    const userTierLevel = tierHierarchy[profile?.subscription_tier || 'free']
    const requiredTierLevel = tierHierarchy[provider.required_tier || 'free']

    if (requiredTierLevel > userTierLevel) {
      return NextResponse.json({
        error: `This tool requires ${provider.required_tier} tier or higher. Please upgrade your plan.`
      }, { status: 403 })
    }

    // Encrypt API key if provided (some local tools don't need API keys)
    const encryptedKey = apiKey ? encryptAPIKey(apiKey) : null

    // Upsert user tool configuration
    const { data, error } = await supabase
      .from('user_ai_tools')
      .upsert({
        user_id: user.id,
        provider_id: providerId,
        api_key_encrypted: encryptedKey,
        configuration: configuration || {},
        is_active: true,
        test_status: encryptedKey ? 'pending' : 'success', // Local tools auto-success
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,provider_id'
      })
      .select()
      .single()

    if (error) {
      // Check if it's a limit error
      if (error.message.includes('AI tools limit exceeded')) {
        return NextResponse.json({
          error: error.message,
          upgradeRequired: true
        }, { status: 403 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'AI tool configured successfully',
      toolId: data.id,
      requiresTest: !!encryptedKey
    })
  } catch (error: any) {
    console.error('AI tools configure error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const toolId = searchParams.get('id')

    if (!toolId) {
      return NextResponse.json({ error: 'Tool ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('user_ai_tools')
      .delete()
      .eq('id', toolId)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'AI tool removed successfully'
    })
  } catch (error: any) {
    console.error('AI tools delete error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
