// Additional test setup if needed
import '@testing-library/jest-dom'
import { jest } from '@jest/globals'
import { TextDecoder, TextEncoder } from 'util'

// Setup global Text Decoder/Encoder for Node.js environment  
global.TextDecoder = TextDecoder
global.TextEncoder = TextEncoder

// Mock global fetch for Stripe and other API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    status: 200,
    statusText: 'OK',
  } as Response)
)

// Mock Next.js server components
global.Request = class Request {
  constructor(public url: string, public init?: RequestInit) {}
  
  json() {
    const body = this.init?.body
    if (typeof body === 'string') {
      return Promise.resolve(JSON.parse(body))
    }
    return Promise.resolve({})
  }
  
  text() {
    const body = this.init?.body
    if (typeof body === 'string') {
      return Promise.resolve(body)
    }
    return Promise.resolve('')
  }
}

global.Response = class Response {
  constructor(public body?: any, public init?: ResponseInit) {}
  
  json() {
    return Promise.resolve(this.body)
  }
  
  text() {
    return Promise.resolve(typeof this.body === 'string' ? this.body : JSON.stringify(this.body))
  }
  
  get status() {
    return this.init?.status || 200
  }
}

// Mock NextResponse and NextRequest
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    constructor(public url: string, public init?: RequestInit) {}
    
    async json() {
      const body = this.init?.body
      if (typeof body === 'string') {
        try {
          return JSON.parse(body)
        } catch {
          throw new Error('Invalid JSON')
        }
      }
      return {}
    }
    
    async text() {
      const body = this.init?.body
      if (typeof body === 'string') {
        return body
      }
      return ''
    }
    
    get method() {
      return this.init?.method || 'GET'
    }
    
    get headers() {
      return new Map(Object.entries(this.init?.headers || {}))
    }
  },
  NextResponse: {
    json: (data: any, init?: ResponseInit) => {
      return {
        json: () => Promise.resolve(data),
        status: init?.status || 200
      }
    }
  }
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock environment variables
process.env.NEXT_PUBLIC_CONTACT_WEBHOOK_URL = 'https://test-webhook.com'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test_key'
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key'
process.env.STRIPE_PRO_MONTHLY_PRICE_ID = 'price_test_pro_monthly_123'
process.env.STRIPE_PRO_YEARLY_PRICE_ID = 'price_test_pro_yearly_123'
process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID = 'price_test_premium_monthly_123'
process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID = 'price_test_premium_yearly_123'

// Mock Next.js headers and cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    getAll: () => [],
    get: () => null,
    set: jest.fn(),
    delete: jest.fn(),
  })),
  headers: jest.fn(() => ({
    get: () => null,
    getSetCookie: () => [],
  })),
}))