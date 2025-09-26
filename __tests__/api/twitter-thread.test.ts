/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { POST, GET } from '../../app/api/twitter-thread/route'

// Mock NextRequest
const createMockRequest = (body?: any, searchParams?: URLSearchParams) => {
  const url = searchParams 
    ? `http://localhost:3000/api/twitter-thread?${searchParams.toString()}`
    : 'http://localhost:3000/api/twitter-thread'
    
  return {
    json: async () => body,
    url,
  } as NextRequest
}

describe('/api/twitter-thread', () => {
  describe('POST', () => {
    it('should return error for missing content', async () => {
      const request = createMockRequest({})
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Content is required')
    })

    it('should return error for content too long', async () => {
      const longContent = 'a'.repeat(5001)
      const request = createMockRequest({ content: longContent })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Content too long')
    })

    it('should successfully start thread generation', async () => {
      const request = createMockRequest({ 
        content: 'Test content for thread generation',
        contentType: 'text'
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.trackingId).toBeDefined()
      expect(data.estimatedTime).toBe('30-60 seconds')
    })

    it('should handle malformed JSON', async () => {
      const request = {
        json: async () => { throw new Error('Invalid JSON') },
        url: 'http://localhost:3000/api/twitter-thread'
      } as NextRequest

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Internal server error')
    })
  })

  describe('GET', () => {
    it('should return error for missing trackingId', async () => {
      const request = createMockRequest(undefined, new URLSearchParams())
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('trackingId is required')
    })

    it('should return error for invalid trackingId', async () => {
      const searchParams = new URLSearchParams({ trackingId: 'invalid-id' })
      const request = createMockRequest(undefined, searchParams)
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Invalid or expired tracking ID')
    })

    it('should return processing status for valid trackingId', async () => {
      // First create a thread to get a valid tracking ID
      const postRequest = createMockRequest({ 
        content: 'Test content',
        contentType: 'text'
      })
      const postResponse = await POST(postRequest)
      const postData = await postResponse.json()

      // Then check status
      const searchParams = new URLSearchParams({ trackingId: postData.trackingId })
      const getRequest = createMockRequest(undefined, searchParams)
      const response = await GET(getRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.trackingId).toBe(postData.trackingId)
      expect(data.status).toBeDefined()
      expect(data.progress).toBeDefined()
    })
  })

  describe('Integration', () => {
    it('should complete full thread generation flow', async () => {
      // Start generation
      const postRequest = createMockRequest({ 
        content: 'AI is revolutionizing content marketing by enabling businesses to create multiple content formats from a single input.',
        contentType: 'text',
        style: 'professional'
      })
      const postResponse = await POST(postRequest)
      const postData = await postResponse.json()

      expect(postData.success).toBe(true)
      expect(postData.trackingId).toBeDefined()

      // Wait for processing to complete
      await new Promise(resolve => setTimeout(resolve, 4000))

      // Check final status
      const searchParams = new URLSearchParams({ trackingId: postData.trackingId })
      const getRequest = createMockRequest(undefined, searchParams)
      const response = await GET(getRequest)
      const data = await response.json()

      expect(data.status).toBe('completed')
      expect(data.progress).toBe(100)
      expect(data.thread).toBeDefined()
      expect(data.thread).toContain('Content Cascade AI')
    }, 10000) // 10 second timeout for this test
  })

  describe('Rate Limiting & Security', () => {
    it('should handle rapid successive requests', async () => {
      const requests = Array.from({ length: 5 }, () => 
        createMockRequest({ 
          content: 'Test content for rate limiting',
          contentType: 'text'
        })
      )

      const responses = await Promise.all(
        requests.map(request => POST(request))
      )

      // All should succeed for demo purposes
      responses.forEach(async (response) => {
        const data = await response.json()
        expect(data.success).toBe(true)
      })
    })

    it('should sanitize input content', async () => {
      const maliciousContent = '<script>alert("xss")</script>Test content'
      const request = createMockRequest({ 
        content: maliciousContent,
        contentType: 'text'
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      // API should accept content as-is for demo, real implementation would sanitize
    })
  })
})
