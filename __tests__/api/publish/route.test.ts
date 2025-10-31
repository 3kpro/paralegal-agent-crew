import { POST } from '@/app/api/publish/route'
import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

// Mock external dependencies
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn()
}))

// Mock fetch for Twitter/LinkedIn API calls
global.fetch = jest.fn()

describe('Publishing API - /api/publish', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  const mockUser = {
    id: 'test-user-123',
    email: 'test@example.com'
  }

  const mockScheduledPost = {
    id: 'post-123',
    user_id: 'test-user-123',
    campaign_id: 'campaign-123',
    title: 'Test Post',
    content: 'This is a test tweet about #AI and #Technology',
    platform: 'twitter',
    status: 'scheduled',
    scheduled_at: new Date(Date.now() + 3600000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const mockSocialAccount = {
    id: 'account-123',
    user_id: 'test-user-123',
    platform: 'twitter',
    platform_user_id: '1234567890',
    platform_username: 'testuser',
    account_handle: 'testuser',
    account_name: 'Test User',
    is_active: true,
    access_token: 'mock-twitter-access-token',
    connected_at: new Date().toISOString()
  }

  const createMockRequest = (body: any): NextRequest => {
    return new NextRequest('http://localhost:3000/api/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
  }

  describe('Authentication', () => {
    test('should reject unauthorized requests', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: new Error('Unauthorized') })
        }
      }
      ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

      const request = createMockRequest({ post_id: 'post-123' })
      const response = await POST(request)

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })
  })

  describe('Input Validation', () => {
    test('should reject request without post_id', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
        }
      }
      ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

      const request = createMockRequest({})
      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('post_id is required')
    })

    test('should reject request for non-existent post', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
        },
        from: jest.fn((table: string) => {
          if (table === 'scheduled_posts') {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: null, error: new Error('Not found') })
            }
          }
          return {}
        })
      }
      ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

      const request = createMockRequest({ post_id: 'non-existent-post' })
      const response = await POST(request)

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toBe('Post not found or access denied')
    })

    test('should reject already published post', async () => {
      const publishedPost = { ...mockScheduledPost, status: 'published' }

      let selectCalled = false
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
        },
        from: jest.fn((table: string) => {
          if (table === 'scheduled_posts') {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockImplementation(() => {
                if (!selectCalled) {
                  selectCalled = true
                  return Promise.resolve({ data: publishedPost, error: null })
                }
                return Promise.resolve({ data: null, error: null })
              })
            }
          }
          return {}
        })
      }
      ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

      const request = createMockRequest({ post_id: 'post-123' })
      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Post already published')
    })
  })

  describe('Social Account Validation', () => {
    test('should fail if no active social account found', async () => {
      let callCount = 0
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
        },
        from: jest.fn((table: string) => {
          if (table === 'scheduled_posts') {
            callCount++
            if (callCount === 1) {
              // First call: fetch the post
              return {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: mockScheduledPost, error: null })
              }
            } else {
              // Second call: update status to "publishing"
              return {
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({ data: null, error: null })
              }
            }
          }
          if (table === 'social_accounts') {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: null, error: new Error('No account found') })
            }
          }
          return {}
        })
      }
      ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

      const request = createMockRequest({ post_id: 'post-123' })
      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('No active twitter account found')
    })
  })

  describe('Twitter Publishing', () => {
    test('should successfully publish to Twitter', async () => {
      const mockTwitterResponse = {
        data: {
          id: '1234567890123456789',
          text: mockScheduledPost.content
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTwitterResponse
      })

      let callCount = 0
      let updateCallCount = 0
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
        },
        from: jest.fn((table: string) => {
          if (table === 'scheduled_posts') {
            callCount++
            if (callCount === 1) {
              // First call: fetch the post
              return {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: mockScheduledPost, error: null })
              }
            } else {
              // Subsequent calls: update status
              updateCallCount++
              return {
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({ data: null, error: null })
              }
            }
          }
          if (table === 'social_accounts') {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: mockSocialAccount, error: null })
            }
          }
          return {}
        })
      }
      ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

      const request = createMockRequest({ post_id: 'post-123' })
      const response = await POST(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.message).toBe('Post published successfully')
      expect(data.platform_post_id).toBe('1234567890123456789')
      expect(data.platform_url).toBe('https://twitter.com/i/web/status/1234567890123456789')

      // Verify Twitter API was called correctly
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.twitter.com/2/tweets',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockSocialAccount.access_token}`,
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({ text: mockScheduledPost.content })
        })
      )
    })

    test('should handle Twitter API errors', async () => {
      const mockTwitterError = {
        detail: 'You are not allowed to create a Tweet with duplicate content.'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => mockTwitterError
      })

      let callCount = 0
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
        },
        from: jest.fn((table: string) => {
          if (table === 'scheduled_posts') {
            callCount++
            if (callCount === 1) {
              return {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: mockScheduledPost, error: null })
              }
            } else {
              return {
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({ data: null, error: null })
              }
            }
          }
          if (table === 'social_accounts') {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: mockSocialAccount, error: null })
            }
          }
          return {}
        })
      }
      ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

      const request = createMockRequest({ post_id: 'post-123' })
      const response = await POST(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toContain('Failed to publish')
      expect(data.error).toContain('duplicate content')
    })

    test('should handle expired access token', async () => {
      const mockTwitterError = {
        title: 'Unauthorized',
        detail: 'When authenticating requests, you must use keys and tokens from the same App.'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => mockTwitterError
      })

      let callCount = 0
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
        },
        from: jest.fn((table: string) => {
          if (table === 'scheduled_posts') {
            callCount++
            if (callCount === 1) {
              return {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: mockScheduledPost, error: null })
              }
            } else {
              return {
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({ data: null, error: null })
              }
            }
          }
          if (table === 'social_accounts') {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: mockSocialAccount, error: null })
            }
          }
          return {}
        })
      }
      ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

      const request = createMockRequest({ post_id: 'post-123' })
      const response = await POST(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toContain('Failed to publish')
    })
  })

  describe('LinkedIn Publishing', () => {
    test('should successfully publish to LinkedIn', async () => {
      const linkedInPost = {
        ...mockScheduledPost,
        platform: 'linkedin',
        content: 'This is a professional LinkedIn post about #AI'
      }

      const mockLinkedInAccount = {
        ...mockSocialAccount,
        platform: 'linkedin',
        access_token: 'mock-linkedin-access-token'
      }

      // Mock LinkedIn profile response
      const mockLinkedInProfile = {
        id: 'abcd1234'
      }

      // Mock LinkedIn post creation response
      const mockLinkedInPostResponse = {
        id: 'urn:li:share:6789012345'
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockLinkedInProfile
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockLinkedInPostResponse
        })

      let callCount = 0
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
        },
        from: jest.fn((table: string) => {
          if (table === 'scheduled_posts') {
            callCount++
            if (callCount === 1) {
              return {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: linkedInPost, error: null })
              }
            } else {
              return {
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({ data: null, error: null })
              }
            }
          }
          if (table === 'social_accounts') {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: mockLinkedInAccount, error: null })
            }
          }
          return {}
        })
      }
      ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

      const request = createMockRequest({ post_id: 'post-123' })
      const response = await POST(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.platform_post_id).toBe('urn:li:share:6789012345')
      expect(data.platform_url).toBe('https://www.linkedin.com/feed/update/urn:li:share:6789012345')

      // Verify LinkedIn API calls
      expect(global.fetch).toHaveBeenCalledTimes(2)
      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        'https://api.linkedin.com/v2/me',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockLinkedInAccount.access_token}`
          })
        })
      )
    })
  })

  describe('Unsupported Platforms', () => {
    test('should reject unsupported platform', async () => {
      const unsupportedPost = {
        ...mockScheduledPost,
        platform: 'instagram'
      }

      let callCount = 0
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
        },
        from: jest.fn((table: string) => {
          if (table === 'scheduled_posts') {
            callCount++
            if (callCount === 1) {
              return {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: unsupportedPost, error: null })
              }
            } else {
              return {
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({ data: null, error: null })
              }
            }
          }
          if (table === 'social_accounts') {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: { ...mockSocialAccount, platform: 'instagram' }, error: null })
            }
          }
          return {}
        })
      }
      ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

      const request = createMockRequest({ post_id: 'post-123' })
      const response = await POST(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toContain('Failed to publish')
      expect(data.error).toContain('not yet supported')
    })
  })

  describe('Status Updates', () => {
    test('should update post status to "publishing" before attempting publish', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: '123456789' } })
      })

      let updateCalls: any[] = []
      let callCount = 0
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
        },
        from: jest.fn((table: string) => {
          if (table === 'scheduled_posts') {
            callCount++
            if (callCount === 1) {
              return {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: mockScheduledPost, error: null })
              }
            } else {
              return {
                update: jest.fn((data: any) => {
                  updateCalls.push(data)
                  return {
                    eq: jest.fn().mockResolvedValue({ data: null, error: null })
                  }
                })
              }
            }
          }
          if (table === 'social_accounts') {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: mockSocialAccount, error: null })
            }
          }
          return {}
        })
      }
      ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

      const request = createMockRequest({ post_id: 'post-123' })
      await POST(request)

      // Check that status was updated to "publishing" first, then "published"
      expect(updateCalls.length).toBeGreaterThanOrEqual(2)
      expect(updateCalls[0]).toEqual({ status: 'publishing' })
      expect(updateCalls[1]).toMatchObject({
        status: 'published',
        platform_post_id: expect.any(String)
      })
    })
  })
})
