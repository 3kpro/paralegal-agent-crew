import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's tier to filter available tools
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, ai_tools_limit')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // Get all active AI providers
    const { data: providers, error: providersError } = await supabase
      .from('ai_providers')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (providersError) {
      return NextResponse.json({ error: providersError.message }, { status: 500 })
    }

    // Get user's configured tools
    const { data: userTools } = await supabase
      .from('user_ai_tools')
      .select('provider_id, configuration, is_active, test_status, last_tested_at')
      .eq('user_id', user.id)

    // Map user tools for quick lookup
    const userToolsMap = new Map(userTools?.map(t => [t.provider_id, t]) || [])

    // Tier hierarchy for access control
    const tierHierarchy: Record<string, number> = { free: 0, pro: 1, premium: 2 }
    const userTierLevel = tierHierarchy[profile?.subscription_tier || 'free']

    // Filter and enhance providers based on tier
    const enhancedProviders = providers?.map(provider => {
      const requiredTierLevel = tierHierarchy[provider.required_tier || 'free']
      const isLocked = requiredTierLevel > userTierLevel
      const userTool = userToolsMap.get(provider.id)

      return {
        id: provider.id,
        name: provider.name,
        provider_key: provider.provider_key,
        category: provider.category,
        description: provider.description,
        logo_url: provider.logo_url,
        setup_url: provider.setup_url,
        setup_instructions: provider.setup_instructions,
        required_tier: provider.required_tier,
        config_schema: provider.config_schema,
        isConfigured: !!userTool?.is_active,
        isLocked,
        testStatus: userTool?.test_status || 'pending',
        lastTested: userTool?.last_tested_at,
        hasApiKey: !!userTool
        // Never send encrypted API key to frontend
      }
    }) || []

    return NextResponse.json({
      success: true,
      providers: enhancedProviders,
      userLimits: {
        current: userTools?.filter(t => t.is_active).length || 0,
        max: profile?.ai_tools_limit || 1,
        tier: profile?.subscription_tier || 'free'
      }
    })
  } catch (error: any) {
    console.error('AI tools list error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
