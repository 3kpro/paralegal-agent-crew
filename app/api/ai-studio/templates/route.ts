import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get prompt templates
    const { data: templates, error } = await supabase
      .from('ai_prompt_templates')
      .select('*')
      .eq('user_id', user.id)
      .order('usage_count', { ascending: false })

    if (error) {
      console.error('Failed to fetch templates:', error)
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
    }

    return NextResponse.json({ success: true, templates })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, category, template, variables, description } = body

    if (!name || !category || !template) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create new template
    const { data: newTemplate, error } = await supabase
      .from('ai_prompt_templates')
      .insert({
        user_id: user.id,
        name,
        category,
        template,
        variables: variables || [],
        description,
        is_public: false,
        usage_count: 0,
        average_quality: 4.0
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create template:', error)
      return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
    }

    return NextResponse.json({ success: true, template: newTemplate })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}