import { NextRequest, NextResponse } from 'next/server'
import { GET } from '@/app/api/auth/connect/[platform]/route'

// Mock Supabase server client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

// Mock NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: jest.fn(() => Promise.resolve(data)),
      status: init?.status || 200,
      headers: new Map(),
    })),
    redirect: jest.fn((url) => ({
      status: 302,
      headers: new Map([['location', url]]),
    })),
  },
}))

const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
}

beforeEach(() => {
  jest.clearAllMocks()
  ;(require('@/lib/supabase/server').createClient as jest.Mock).mockReturnValue(mockSupabase)
})

describe('/api/auth/connect/[platform] API Route', () => {
  const mockRequest = (url: string, headers: Record<string, string> = {}) => {
    return {
      url,
      headers: {
        get: jest.fn((header: string) => headers[header] || null),
      },
    } as unknown as NextRequest
  }

  describe('GET /api/auth/connect/[platform]', () => {
    test('redirects to connection page for valid platform with authenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      })

      const request = mockRequest(
        'http://localhost:3000/api/auth/connect/twitter?from=onboarding',
        { origin: 'http://localhost:3000' }
      )

      const response = await GET(request, { params: { platform: 'twitter' } })

      expect(response.status).toBe(302)
      expect(response.headers.get('location')).toBe('http://localhost:3000/connect/twitter?from=onboarding')
    })

    test('handles all valid social media platforms', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      })

      const validPlatforms = ['twitter', 'linkedin', 'facebook', 'instagram', 'tiktok', 'reddit']

      for (const platform of validPlatforms) {
        const request = mockRequest(
          `http://localhost:3000/api/auth/connect/${platform}`,
          { origin: 'http://localhost:3000' }
        )

        const response = await GET(request, { params: { platform } })

        expect(response.status).toBe(302)
        expect(response.headers.get('location')).toBe(`http://localhost:3000/connect/${platform}?from=onboarding`)
      }
    })

    test('returns 400 for invalid platform', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      })

      const request = mockRequest(
        'http://localhost:3000/api/auth/connect/invalid-platform',
        { origin: 'http://localhost:3000' }
      )

      const response = await GET(request, { params: { platform: 'invalid-platform' } })

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data).toEqual({ error: 'Invalid platform' })
    })

    test('redirects to login for unauthenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      })

      const request = mockRequest(
        'http://localhost:3000/api/auth/connect/twitter',
        { origin: 'http://localhost:3000' }
      )

      const response = await GET(request, { params: { platform: 'twitter' } })

      expect(response.status).toBe(302)
      expect(response.headers.get('location')).toBe('http://localhost:3000/login')
    })

    test('uses default origin when header not present', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      })

      const request = mockRequest('http://localhost:3000/api/auth/connect/twitter')

      const response = await GET(request, { params: { platform: 'twitter' } })

      expect(response.status).toBe(302)
      expect(response.headers.get('location')).toBe('http://localhost:3000/connect/twitter?from=onboarding')
    })

    test('handles authentication errors gracefully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Database connection failed'),
      })

      const request = mockRequest(
        'http://localhost:3000/api/auth/connect/twitter',
        { origin: 'http://localhost:3000' }
      )

      const response = await GET(request, { params: { platform: 'twitter' } })

      expect(response.status).toBe(302)
      expect(response.headers.get('location')).toBe('http://localhost:3000/login')
    })

    test('handles unexpected errors', async () => {
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Unexpected error'))

      const request = mockRequest(
        'http://localhost:3000/api/auth/connect/twitter',
        { origin: 'http://localhost:3000' }
      )

      const response = await GET(request, { params: { platform: 'twitter' } })

      expect(response.status).toBe(500)

      const data = await response.json()
      expect(data).toEqual({ error: 'Connection failed' })
    })

    test('preserves query parameters in redirect', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      })

      const request = mockRequest(
        'http://localhost:3000/api/auth/connect/linkedin?from=settings&source=profile',
        { origin: 'http://localhost:3000' }
      )

      const response = await GET(request, { params: { platform: 'linkedin' } })

      expect(response.status).toBe(302)
      expect(response.headers.get('location')).toBe('http://localhost:3000/connect/linkedin?from=onboarding')
    })

    test('case-sensitive platform validation', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      })

      // Test uppercase platform name (should fail)
      const request = mockRequest(
        'http://localhost:3000/api/auth/connect/TWITTER',
        { origin: 'http://localhost:3000' }
      )

      const response = await GET(request, { params: { platform: 'TWITTER' } })

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data).toEqual({ error: 'Invalid platform' })
    })

    test('handles edge case platform names', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      })

      const invalidPlatforms = ['', ' ', 'twitter-x', 'face book', 'linked-in', 'tik-tok']

      for (const platform of invalidPlatforms) {
        const request = mockRequest(
          `http://localhost:3000/api/auth/connect/${encodeURIComponent(platform)}`,
          { origin: 'http://localhost:3000' }
        )

        const response = await GET(request, { params: { platform } })

        expect(response.status).toBe(400)

        const data = await response.json()
        expect(data).toEqual({ error: 'Invalid platform' })
      }
    })
  })
})