import { POST } from '@/app/api/generate/route'
import { createClient } from '@/lib/supabase/server'
import { redis, withCache } from '@/lib/redis'

// Mock external dependencies
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn()
}))

jest.mock('@/lib/redis', () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn()
  },
  withCache: jest.fn(),
  cacheKeys: {
    generate: 'generate'
  }
}))

jest.mock('@/lib/encryption', () => ({
  decryptAPIKey: jest.fn((key) => 'decrypted-api-key')
}))

describe('Content Generation API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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
    // Mock Redis withCache function
    const mockContent = {
      success: true,
      content: {
        twitter: {
          content: 'Test tweet #AI',
          hashtags: ['#AI'],
          platform: 'twitter'
        }
      },
      metadata: {
        provider: 'OpenAI',
        tokensUsed: 100,
        estimatedCost: 0.002,
        cached: false
      }
    }

    // Set up Redis cache mock
    ;(withCache as jest.Mock).mockImplementation(async (key, ttl, fn) => mockContent)

    // Mock Supabase auth and queries
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        insert: jest.fn().mockResolvedValue({ data: null, error: null }),
        update: jest.fn().mockResolvedValue({ data: null, error: null })
      })
    }
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

    // Test Request
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
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.content.twitter).toBeDefined()
    expect(data.metadata.cached).toBe(true)
  })

  test('should handle invalid request data', async () => {
    // Mock Supabase auth
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
      }
    }
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

    // Test Request without required fields
    const request = new Request('http://localhost:3000/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: 'AI in Healthcare'
        // Missing formats
      })
    })

    const response = await POST(request)
    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.error).toBe('Topic and formats are required')
  })

  test('should handle unauthorized requests', async () => {
    // Mock Supabase auth error
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: new Error('Unauthorized') })
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

  test('should handle missing AI tools configuration', async () => {
    // Mock Supabase auth and empty tools query
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        insert: jest.fn().mockResolvedValue({ data: [], error: null })
      })
    }
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

    // Mock cache to pass through to generation logic
    ;(withCache as jest.Mock).mockImplementation(async (key, ttl, fn) => {
      return await fn()
    })

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
    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.error).toContain('No AI tools configured')
    expect(data.requiresSetup).toBe(true)
  })

  test('should handle generation errors', async () => {
    // Mock Supabase auth and queries
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        insert: jest.fn().mockResolvedValue({ data: mockUserTools, error: null })
      })
    }
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

    // Mock cache to throw an error
    ;(withCache as jest.Mock).mockImplementation(async (key, ttl, fn) => {
      throw new Error('Generation failed')
    })

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
    expect(response.status).toBe(500)

    const data = await response.json()
    expect(data.error).toContain('Generation failed')
  })
})