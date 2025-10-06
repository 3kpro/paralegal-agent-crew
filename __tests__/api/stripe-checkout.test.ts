import { jest } from '@jest/globals';

// Mock environment variables
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
process.env.STRIPE_PRO_PRICE_ID = 'price_test_pro_123';
process.env.STRIPE_PREMIUM_PRICE_ID = 'price_test_premium_123';
process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';

// Mock Stripe SDK
const mockStripeCheckoutSessionsCreate = jest.fn();
const mockStripeCustomersCreate = jest.fn();
const mockStripeCustomersList = jest.fn();

jest.mock('stripe', () => {
  return jest.fn(() => ({
    checkout: {
      sessions: {
        create: mockStripeCheckoutSessionsCreate,
      },
    },
    customers: {
      create: mockStripeCustomersCreate,
      list: mockStripeCustomersList,
    },
  }));
});

// Mock Supabase client
const mockSupabaseAuth = {
  getUser: jest.fn(),
};

const mockSupabaseClient = {
  auth: mockSupabaseAuth,
};

jest.mock('@/lib/supabase/server', () => ({
  createServerComponentClient: () => mockSupabaseClient,
}));

// Mock Next.js headers and cookies
jest.mock('next/headers', () => ({
  cookies: () => ({
    getAll: () => [],
  }),
  headers: () => ({
    get: () => null,
  }),
}));

// Import the API route handler
import { POST } from '@/app/api/stripe/checkout/route';
import { NextRequest } from 'next/server';

describe('Stripe Checkout API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mocks
    mockSupabaseAuth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
        },
      },
      error: null,
    });

    mockStripeCustomersList.mockResolvedValue({
      data: [],
    });

    mockStripeCustomersCreate.mockResolvedValue({
      id: 'cus_test_customer_123',
    });

    mockStripeCheckoutSessionsCreate.mockResolvedValue({
      id: 'cs_test_session_123',
      url: 'https://checkout.stripe.com/c/pay/cs_test_session_123',
    });
  });

  describe('Authentication', () => {
    it('should reject unauthenticated requests', async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({
          priceId: 'price_test_pro_123',
          successUrl: 'http://localhost:3000/settings?upgrade=success',
          cancelUrl: 'http://localhost:3000/settings?upgrade=canceled',
        }),
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle Supabase authentication errors', async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      });

      const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({
          priceId: 'price_test_pro_123',
          successUrl: 'http://localhost:3000/settings?upgrade=success',
          cancelUrl: 'http://localhost:3000/settings?upgrade=canceled',
        }),
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('Request Validation', () => {
    it('should validate required priceId field', async () => {
      const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({
          successUrl: 'http://localhost:3000/settings?upgrade=success',
          cancelUrl: 'http://localhost:3000/settings?upgrade=canceled',
        }),
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Missing required fields');
    });

    it('should validate required successUrl field', async () => {
      const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({
          priceId: 'price_test_pro_123',
          cancelUrl: 'http://localhost:3000/settings?upgrade=canceled',
        }),
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Missing required fields');
    });

    it('should validate required cancelUrl field', async () => {
      const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({
          priceId: 'price_test_pro_123',
          successUrl: 'http://localhost:3000/settings?upgrade=success',
        }),
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Missing required fields');
    });

    it('should handle invalid JSON in request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid request body');
    });
  });

  describe('Stripe Customer Management', () => {
    it('should create new customer if none exists', async () => {
      const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({
          priceId: 'price_test_pro_123',
          successUrl: 'http://localhost:3000/settings?upgrade=success',
          cancelUrl: 'http://localhost:3000/settings?upgrade=canceled',
        }),
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.url).toBe('https://checkout.stripe.com/c/pay/cs_test_session_123');

      expect(mockStripeCustomersCreate).toHaveBeenCalledWith({
        email: 'test@example.com',
        metadata: {
          supabase_user_id: 'test-user-id',
        },
      });
    });

    it('should use existing customer if found', async () => {
      mockStripeCustomersList.mockResolvedValue({
        data: [
          {
            id: 'cus_existing_customer_123',
            email: 'test@example.com',
          },
        ],
      });

      const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({
          priceId: 'price_test_pro_123',
          successUrl: 'http://localhost:3000/settings?upgrade=success',
          cancelUrl: 'http://localhost:3000/settings?upgrade=canceled',
        }),
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockStripeCustomersCreate).not.toHaveBeenCalled();
    });
  });

  describe('Checkout Session Creation', () => {
    it('should create Pro checkout session successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({
          priceId: 'price_test_pro_123',
          successUrl: 'http://localhost:3000/settings?upgrade=success',
          cancelUrl: 'http://localhost:3000/settings?upgrade=canceled',
        }),
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.url).toBe('https://checkout.stripe.com/c/pay/cs_test_session_123');

      expect(mockStripeCheckoutSessionsCreate).toHaveBeenCalledWith({
        customer: 'cus_test_customer_123',
        line_items: [
          {
            price: 'price_test_pro_123',
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: 'http://localhost:3000/settings?upgrade=success',
        cancel_url: 'http://localhost:3000/settings?upgrade=canceled',
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        metadata: {
          supabase_user_id: 'test-user-id',
        },
      });
    });

    it('should create Premium checkout session successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({
          priceId: 'price_test_premium_123',
          successUrl: 'http://localhost:3000/settings?upgrade=success&plan=premium',
          cancelUrl: 'http://localhost:3000/settings?upgrade=canceled',
        }),
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.url).toBe('https://checkout.stripe.com/c/pay/cs_test_session_123');

      expect(mockStripeCheckoutSessionsCreate).toHaveBeenCalledWith({
        customer: 'cus_test_customer_123',
        line_items: [
          {
            price: 'price_test_premium_123',
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: 'http://localhost:3000/settings?upgrade=success&plan=premium',
        cancel_url: 'http://localhost:3000/settings?upgrade=canceled',
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        metadata: {
          supabase_user_id: 'test-user-id',
        },
      });
    });

    it('should handle Stripe customer creation errors', async () => {
      mockStripeCustomersCreate.mockRejectedValue(new Error('Stripe customer creation failed'));

      const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({
          priceId: 'price_test_pro_123',
          successUrl: 'http://localhost:3000/settings?upgrade=success',
          cancelUrl: 'http://localhost:3000/settings?upgrade=canceled',
        }),
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to create checkout session');
    });

    it('should handle Stripe checkout session creation errors', async () => {
      mockStripeCheckoutSessionsCreate.mockRejectedValue(new Error('Invalid price ID'));

      const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({
          priceId: 'price_invalid_123',
          successUrl: 'http://localhost:3000/settings?upgrade=success',
          cancelUrl: 'http://localhost:3000/settings?upgrade=canceled',
        }),
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to create checkout session');
    });

    it('should handle missing checkout session URL', async () => {
      mockStripeCheckoutSessionsCreate.mockResolvedValue({
        id: 'cs_test_session_123',
        url: null, // No URL returned
      });

      const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({
          priceId: 'price_test_pro_123',
          successUrl: 'http://localhost:3000/settings?upgrade=success',
          cancelUrl: 'http://localhost:3000/settings?upgrade=canceled',
        }),
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to create checkout session');
    });
  });

  describe('Environment Configuration', () => {
    it('should handle missing Stripe secret key', async () => {
      const originalKey = process.env.STRIPE_SECRET_KEY;
      delete process.env.STRIPE_SECRET_KEY;

      const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({
          priceId: 'price_test_pro_123',
          successUrl: 'http://localhost:3000/settings?upgrade=success',
          cancelUrl: 'http://localhost:3000/settings?upgrade=canceled',
        }),
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Stripe configuration error');

      // Restore the environment variable
      process.env.STRIPE_SECRET_KEY = originalKey;
    });

    it('should handle missing price IDs in environment', async () => {
      const originalProPrice = process.env.STRIPE_PRO_PRICE_ID;
      delete process.env.STRIPE_PRO_PRICE_ID;

      const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({
          priceId: 'price_test_pro_123',
          successUrl: 'http://localhost:3000/settings?upgrade=success',
          cancelUrl: 'http://localhost:3000/settings?upgrade=canceled',
        }),
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Stripe configuration error');

      // Restore the environment variable
      process.env.STRIPE_PRO_PRICE_ID = originalProPrice;
    });
  });

  describe('Price ID Validation', () => {
    it('should validate Pro price ID format', async () => {
      const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({
          priceId: process.env.STRIPE_PRO_PRICE_ID,
          successUrl: 'http://localhost:3000/settings?upgrade=success',
          cancelUrl: 'http://localhost:3000/settings?upgrade=canceled',
        }),
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should validate Premium price ID format', async () => {
      const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({
          priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
          successUrl: 'http://localhost:3000/settings?upgrade=success',
          cancelUrl: 'http://localhost:3000/settings?upgrade=canceled',
        }),
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should reject invalid price ID formats', async () => {
      const request = new NextRequest('http://localhost:3000/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({
          priceId: 'invalid_price_format',
          successUrl: 'http://localhost:3000/settings?upgrade=success',
          cancelUrl: 'http://localhost:3000/settings?upgrade=canceled',
        }),
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid price ID');
    });
  });
});