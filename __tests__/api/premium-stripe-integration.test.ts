import { NextRequest } from 'next/server';

// Mock Stripe first
const mockStripeSessionCreate = jest.fn();
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: mockStripeSessionCreate,
      },
    },
  }));
});

// Mock Supabase client
const mockSupabaseAuth = {
  getUser: jest.fn(),
};

jest.mock('@/lib/supabase/server', () => ({
  createServerComponentClient: () => ({
    auth: mockSupabaseAuth,
  }),
}));

// Import the API route AFTER mocks are set up
import { POST } from '@/app/api/stripe/checkout/route';

// Mock environment variables
const originalEnv = process.env;

describe('Premium Stripe Integration API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up environment variables
    process.env = {
      ...originalEnv,
      STRIPE_SECRET_KEY: 'sk_test_mock_key',
      STRIPE_PREMIUM_MONTHLY_PRICE_ID: 'price_premium_monthly_test',
      STRIPE_PREMIUM_YEARLY_PRICE_ID: 'price_premium_yearly_test',
      NEXT_PUBLIC_APP_URL: 'https://3kpro.services',
    };

    // Setup default successful auth mock
    mockSupabaseAuth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'test-user-123',
          email: 'test@example.com',
        },
      },
      error: null,
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Premium Monthly Checkout', () => {
    it('should create Stripe checkout session for premium monthly plan', async () => {
      // Mock successful Stripe session creation
      mockStripeSessionCreate.mockResolvedValue({
        url: 'https://checkout.stripe.com/c/pay/cs_premium_monthly_123',
        id: 'cs_premium_monthly_123',
      });

      const request = new NextRequest('https://3kpro.services/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({
          plan: 'premium',
          billing_period: 'monthly',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.url).toBe('https://checkout.stripe.com/c/pay/cs_premium_monthly_123');

      expect(mockStripeSessionCreate).toHaveBeenCalledWith({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: 'price_premium_monthly_test',
            quantity: 1,
          },
        ],
        success_url: 'https://3kpro.services/settings?upgrade=success',
        cancel_url: 'https://3kpro.services/settings?upgrade=cancelled',
        metadata: {
          user_id: 'test-user-123',
          plan: 'premium',
          billing_period: 'monthly',
        },
      });
    });

    it('should create Stripe checkout session for premium yearly plan', async () => {
      mockStripeSessionCreate.mockResolvedValue({
        url: 'https://checkout.stripe.com/c/pay/cs_premium_yearly_123',
        id: 'cs_premium_yearly_123',
      });

      const request = new NextRequest('https://3kpro.services/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({
          plan: 'premium',
          billing_period: 'yearly',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.url).toBe('https://checkout.stripe.com/c/pay/cs_premium_yearly_123');

      expect(mockStripeSessionCreate).toHaveBeenCalledWith({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: 'price_premium_yearly_test',
            quantity: 1,
          },
        ],
        success_url: 'https://3kpro.services/settings?upgrade=success',
        cancel_url: 'https://3kpro.services/settings?upgrade=cancelled',
        metadata: {
          user_id: 'test-user-123',
          plan: 'premium',
          billing_period: 'yearly',
        },
      });
    });
  });

  describe('Authentication Requirements', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'User not authenticated' },
      });

      const request = new NextRequest('https://3kpro.services/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({
          plan: 'premium',
          billing_period: 'monthly',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Unauthorized');
      expect(mockStripeSessionCreate).not.toHaveBeenCalled();
    });
  });

  describe('Input Validation', () => {
    it('should return 400 for invalid plan', async () => {
      const request = new NextRequest('https://3kpro.services/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({
          plan: 'invalid-plan',
          billing_period: 'monthly',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Invalid');
      expect(mockStripeSessionCreate).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid billing period', async () => {
      const request = new NextRequest('https://3kpro.services/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({
          plan: 'premium',
          billing_period: 'invalid-period',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Invalid');
      expect(mockStripeSessionCreate).not.toHaveBeenCalled();
    });

    it('should return 400 for missing request body', async () => {
      const request = new NextRequest('https://3kpro.services/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('plan');
      expect(mockStripeSessionCreate).not.toHaveBeenCalled();
    });
  });

  describe('Environment Configuration', () => {
    it('should return 500 when Stripe secret key is missing', async () => {
      delete process.env.STRIPE_SECRET_KEY;

      const request = new NextRequest('https://3kpro.services/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({
          plan: 'premium',
          billing_period: 'monthly',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('configuration');
      expect(mockStripeSessionCreate).not.toHaveBeenCalled();
    });

    it('should return 500 when Premium price ID is missing', async () => {
      delete process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID;

      const request = new NextRequest('https://3kpro.services/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({
          plan: 'premium',
          billing_period: 'monthly',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('configuration');
      expect(mockStripeSessionCreate).not.toHaveBeenCalled();
    });
  });

  describe('Stripe API Error Handling', () => {
    it('should handle Stripe API errors gracefully', async () => {
      mockStripeSessionCreate.mockRejectedValue(new Error('Stripe API error: Invalid price ID'));

      const request = new NextRequest('https://3kpro.services/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({
          plan: 'premium',
          billing_period: 'monthly',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('checkout session');
    });

    it('should handle Stripe network errors', async () => {
      mockStripeSessionCreate.mockRejectedValue(new Error('Network error'));

      const request = new NextRequest('https://3kpro.services/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({
          plan: 'premium',
          billing_period: 'monthly',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('checkout session');
    });
  });

  describe('Success URL and Metadata', () => {
    it('should set correct success and cancel URLs', async () => {
      mockStripeSessionCreate.mockResolvedValue({
        url: 'https://checkout.stripe.com/c/pay/cs_test_123',
        id: 'cs_test_123',
      });

      const request = new NextRequest('https://3kpro.services/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({
          plan: 'premium',
          billing_period: 'monthly',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      await POST(request);

      expect(mockStripeSessionCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          success_url: 'https://3kpro.services/settings?upgrade=success',
          cancel_url: 'https://3kpro.services/settings?upgrade=cancelled',
        })
      );
    });

    it('should include user and plan metadata', async () => {
      mockStripeSessionCreate.mockResolvedValue({
        url: 'https://checkout.stripe.com/c/pay/cs_test_123',
        id: 'cs_test_123',
      });

      const request = new NextRequest('https://3kpro.services/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({
          plan: 'premium',
          billing_period: 'yearly',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      await POST(request);

      expect(mockStripeSessionCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: {
            user_id: 'test-user-123',
            plan: 'premium',
            billing_period: 'yearly',
          },
        })
      );
    });
  });
});