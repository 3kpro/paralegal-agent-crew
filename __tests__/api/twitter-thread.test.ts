/**
 * @jest-environment node
 */
import { POST, GET } from '@/app/api/twitter-thread/route'
import { NextRequest } from 'next/server'

// Mock fetchWithRetry
jest.mock('@/lib/fetch-with-retry', () => ({
  fetchWithRetry: jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ thread: 'Mock thread', status: 'completed' })
  })
}))

describe('Twitter Thread API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/twitter-thread', () => {
    it('should reject empty content', async () => {
      const req = new NextRequest('http://localhost:3000/api/twitter-thread', {
        method: 'POST',
        body: JSON.stringify({})
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Validation error')
    })

    it('should reject content that is too short', async () => {
      const req = new NextRequest('http://localhost:3000/api/twitter-thread', {
        method: 'POST',
        body: JSON.stringify({ content: 'hi' })
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.message).toContain('at least 10 characters')
    })

    it('should accept valid content', async () => {
      const req = new NextRequest('http://localhost:3000/api/twitter-thread', {
        method: 'POST',
        body: JSON.stringify({
          content: 'This is a valid test content for the Twitter thread API',
          style: 'professional'
        })
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.trackingId).toBeDefined()
    })
  })

  describe('GET /api/twitter-thread', () => {
    it('should reject request without trackingId', async () => {
      const req = new NextRequest('http://localhost:3000/api/twitter-thread')

      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('trackingId')
    })

    it('should return 404 for invalid trackingId', async () => {
      const req = new NextRequest('http://localhost:3000/api/twitter-thread?trackingId=invalid')

      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toContain('Invalid or expired')
    })
  })
})
