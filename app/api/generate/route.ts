import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { decryptAPIKey } from '@/lib/encryption'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { topic, formats, preferredProvider } = await request.json()

    if (!topic || !formats || formats.length === 0) {
      return NextResponse.json({
        error: 'Topic and formats are required'
      }, { status: 400 })
    }

    // Get user's configured AI tools
    const { data: userTools } = await supabase
      .from('user_ai_tools')
      .select(`
        *,
        ai_providers (
          id,
          provider_key,
          name,
          category
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .eq('test_status', 'success')

    if (!userTools || userTools.length === 0) {
      return NextResponse.json({
        error: 'No AI tools configured. Please add an AI tool in Settings.',
        requiresSetup: true
      }, { status: 400 })
    }

    // Find preferred provider or use first available
    let selectedTool = userTools.find(t => (t.ai_providers as any).provider_key === preferredProvider)
    if (!selectedTool) {
      selectedTool = userTools[0] // Fallback to first available
    }

    const provider = selectedTool.ai_providers as any
    const apiKey = selectedTool.api_key_encrypted ? decryptAPIKey(selectedTool.api_key_encrypted) : null
    const config = selectedTool.configuration || {}

    // Generate content based on provider
    let content: any
    let tokensUsed = 0
    let estimatedCost = 0

    try {
      switch (provider.provider_key) {
        case 'openai':
          const openaiResult = await generateWithOpenAI(apiKey!, topic, formats, config)
          content = openaiResult.content
          tokensUsed = openaiResult.tokensUsed
          estimatedCost = openaiResult.estimatedCost
          break

        case 'anthropic':
          const claudeResult = await generateWithClaude(apiKey!, topic, formats, config)
          content = claudeResult.content
          tokensUsed = claudeResult.tokensUsed
          estimatedCost = claudeResult.estimatedCost
          break

        case 'google':
          const geminiResult = await generateWithGemini(apiKey!, topic, formats, config)
          content = geminiResult.content
          tokensUsed = geminiResult.tokensUsed
          estimatedCost = geminiResult.estimatedCost
          break

        case 'lmstudio':
          const lmResult = await generateWithLMStudio(topic, formats)
          content = lmResult.content
          tokensUsed = lmResult.tokensUsed
          estimatedCost = 0 // Local is free
          break

        default:
          throw new Error(`Content generation not yet implemented for ${provider.name}`)
      }

      // Track usage
      await supabase.from('ai_tool_usage').insert({
        user_id: user.id,
        provider_id: provider.id,
        tokens_used: tokensUsed,
        estimated_cost: estimatedCost
      })

      // Increment usage counter
      await supabase
        .from('user_ai_tools')
        .update({ usage_count: selectedTool.usage_count + 1 })
        .eq('id', selectedTool.id)

      return NextResponse.json({
        success: true,
        content,
        metadata: {
          provider: provider.name,
          tokensUsed,
          estimatedCost
        }
      })

    } catch (genError: any) {
      console.error('Generation error:', genError)
      return NextResponse.json({
        error: `Content generation failed: ${genError.message}`,
        provider: provider.name
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Generate API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// ============================================================================
// GENERATION FUNCTIONS
// ============================================================================

async function generateWithOpenAI(apiKey: string, topic: string, formats: string[], config: any) {
  const model = config.model || 'gpt-4-turbo'
  const temperature = config.temperature || 0.7
  const maxTokens = config.maxTokens || 2000

  const content: any = {}
  let totalTokens = 0

  for (const format of formats) {
    const prompt = getPromptForFormat(format, topic)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens: maxTokens
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'OpenAI API error')
    }

    const data = await response.json()
    const generatedText = data.choices[0].message.content

    content[format] = formatContent(format, generatedText, topic)
    totalTokens += data.usage.total_tokens
  }

  // Estimate cost (GPT-4-turbo: ~$0.01 input + $0.03 output per 1K tokens, avg $0.02)
  const estimatedCost = (totalTokens / 1000) * 0.02

  return { content, tokensUsed: totalTokens, estimatedCost }
}

async function generateWithClaude(apiKey: string, topic: string, formats: string[], config: any) {
  const model = config.model || 'claude-3-sonnet-20240229'
  const temperature = config.temperature || 0.7
  const maxTokens = config.maxTokens || 2000

  const content: any = {}
  let totalTokens = 0

  for (const format of formats) {
    const prompt = getPromptForFormat(format, topic)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens: maxTokens
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Claude API error')
    }

    const data = await response.json()
    const generatedText = data.content[0].text

    content[format] = formatContent(format, generatedText, topic)
    totalTokens += data.usage.input_tokens + data.usage.output_tokens
  }

  // Estimate cost (Claude Sonnet: ~$3 per million tokens input + $15 output, avg $9 per million)
  const estimatedCost = (totalTokens / 1000000) * 9

  return { content, tokensUsed: totalTokens, estimatedCost }
}

async function generateWithGemini(apiKey: string, topic: string, formats: string[], config: any) {
  const model = config.model || 'gemini-pro'
  const temperature = config.temperature || 0.7

  const content: any = {}
  let totalTokens = 0

  for (const format of formats) {
    const prompt = getPromptForFormat(format, topic)

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature,
            maxOutputTokens: 2000
          }
        })
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Gemini API error')
    }

    const data = await response.json()
    const generatedText = data.candidates[0].content.parts[0].text

    content[format] = formatContent(format, generatedText, topic)
    totalTokens += (prompt.length + generatedText.length) / 4 // Rough estimate
  }

  // Estimate cost (Gemini Pro: ~$0.5 per million chars, ~4 chars per token)
  const estimatedCost = (totalTokens * 4 / 1000000) * 0.5

  return { content, tokensUsed: totalTokens, estimatedCost }
}

async function generateWithLMStudio(topic: string, formats: string[]) {
  const endpoint = process.env.API_GATEWAY_URL
    ? `${process.env.API_GATEWAY_URL}/generate`
    : 'http://10.10.10.105:1234/v1/chat/completions'

  const content: any = {}
  let totalTokens = 0

  for (const format of formats) {
    const prompt = getPromptForFormat(format, topic)

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.API_GATEWAY_URL ? { 'ngrok-skip-browser-warning': 'true' } : {})
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      throw new Error('LM Studio connection failed')
    }

    const data = await response.json()
    const generatedText = data.choices[0].message.content

    content[format] = formatContent(format, generatedText, topic)
    totalTokens += data.usage?.total_tokens || 0
  }

  return { content, tokensUsed: totalTokens, estimatedCost: 0 }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getPromptForFormat(format: string, topic: string): string {
  const prompts: Record<string, string> = {
    twitter: `Create an engaging Twitter/X post about "${topic}". Requirements:
- Maximum 280 characters
- Include 2-3 relevant hashtags
- Be conversational and engaging
- Include a call-to-action or question
- Use emojis sparingly (1-2 max)

Return only the tweet text, nothing else.`,

    linkedin: `Create a professional LinkedIn post about "${topic}". Requirements:
- 150-300 words
- Professional tone but engaging
- Include relevant hashtags (3-5)
- Structure: Hook → Value → Call-to-Action
- Add paragraph breaks for readability

Return only the LinkedIn post text, nothing else.`,

    email: `Create an email about "${topic}". Requirements:
- Professional but friendly tone
- Subject line: Compelling and clear (50 chars max)
- Body: 100-200 words
- Clear call-to-action at the end
- Proper greeting and sign-off

Return in format:
SUBJECT: [subject line]
BODY: [email body]`,

    facebook: `Create a Facebook post about "${topic}". Requirements:
- Casual, friendly tone
- 100-200 words
- Include relevant hashtags (2-4)
- Engaging hook in first sentence
- Include a question or call-to-action

Return only the Facebook post text, nothing else.`,

    instagram: `Create an Instagram caption about "${topic}". Requirements:
- Engaging and visual
- 125-150 words
- Include relevant hashtags (5-10)
- First line must hook attention
- Include emojis naturally
- End with call-to-action or question

Return only the Instagram caption, nothing else.`
  }

  return prompts[format] || prompts.twitter
}

function formatContent(format: string, generatedText: string, topic: string): any {
  const cleaned = generatedText.trim()

  switch (format) {
    case 'twitter':
      const hashtags = extractHashtags(cleaned)
      return {
        content: cleaned,
        characterCount: cleaned.length,
        hashtags,
        platform: 'twitter'
      }

    case 'linkedin':
      return {
        content: cleaned,
        hashtags: extractHashtags(cleaned),
        platform: 'linkedin'
      }

    case 'email':
      const subjectMatch = cleaned.match(/SUBJECT:\s*(.+?)(?:\n|$)/i)
      const bodyMatch = cleaned.match(/BODY:\s*(.+)/is)
      return {
        subject: subjectMatch ? subjectMatch[1].trim() : `About ${topic}`,
        content: bodyMatch ? bodyMatch[1].trim() : cleaned,
        platform: 'email'
      }

    case 'facebook':
      return {
        content: cleaned,
        hashtags: extractHashtags(cleaned),
        platform: 'facebook'
      }

    case 'instagram':
      return {
        content: cleaned,
        hashtags: extractHashtags(cleaned),
        platform: 'instagram'
      }

    default:
      return {
        content: cleaned,
        platform: format
      }
  }
}

function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[\w]+/g
  const matches = text.match(hashtagRegex) || []
  return Array.from(new Set(matches))
}
