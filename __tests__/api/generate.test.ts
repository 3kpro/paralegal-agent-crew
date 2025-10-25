import { describe, expect, test, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/generate/route'
import { createClient } from '@/lib/supabase/server'
import { redis } from '@/lib/redis'

// Mock external dependencies
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn()
}))

vi.mock('@/lib/redis', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn()
  },
  withCache: vi.fn(),
  cacheKeys: {
    generate: 'generate'
  }
}))

vi.mock('@/lib/encryption', () => ({
  decryptAPIKey: vi.fn((key) => 'decrypted-api-key')
}))

describe('Content Generation API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockUserTools = [{
    id: 1,
    user_id: 'test-user',
    api_key_encrypted: 'encrypted-key',
    configuration: {
      model: 'gpt-4-turbo',
      temperature: 0.7
    },
    usage_count: 0,
    ai_providers: {
      id: 1,
      provider_key: 'openai',
      name: 'OpenAI',
      category: 'ai'
    }
  }]

  const mockUser = {
    id: 'test-user',
    email: 'test@example.com'
  }

  test('should generate and cache content successfully', async () => {
    // Mock Supabase auth and queries
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
        update: vi.fn().mockResolvedValue({ data: null, error: null })
      })
    }
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

    // Mock Redis cache miss then hit
    let cacheHit = false
    ;(redis.get as jest.Mock).mockImplementation(async (key) => {
      if (cacheHit) {
        return JSON.stringify({
          success: true,
          content: {
            twitter: {
              content: 'Cached tweet about AI',
              hashtags: ['#AI', '#Healthcare'],
              platform: 'twitter'
            }
          },
          metadata: {
            provider: 'OpenAI',
            tokensUsed: 100,
            estimatedCost: 0.002,
            cached: true
          }
        })
      }
      return null
    })

    // Test first request (cache miss)
    const request = new Request('http://localhost:3000/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: 'AI in Healthcare',
        formats: ['twitter'],
        preferredProvider: 'openai'
      })
    })

    const response1 = await POST(request)
    const data1 = await response1.json()

    expect(response1.status).toBe(200)
    expect(data1.success).toBe(true)
    expect(data1.metadata.cached).toBe(false)

    // Test second request (cache hit)
    cacheHit = true
    const response2 = await POST(request)
    const data2 = await response2.json()

    expect(response2.status).toBe(200)
    expect(data2.success).toBe(true)
    expect(data2.metadata.cached).toBe(true)
  })

  test('should handle errors gracefully', async () => {
    // Mock Supabase auth error
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: new Error('Unauthorized') })
      }
    }
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

    const request = new Request('http://localhost:3000/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: 'AI in Healthcare',
        formats: ['twitter'],
        preferredProvider: 'openai'
      })
    })

    const response = await POST(request)
    expect(response.status).toBe(401)

    const data = await response.json()
    expect(data.error).toBe('Unauthorized')
  })
})