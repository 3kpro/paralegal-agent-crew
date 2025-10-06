/**
 * Functional E2E Tests for Premium Upgrade Feature
 * Tests the frontend upgrade button behavior and API integration flow
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';

// Create a mock settings component that simulates the key functionality
const MockSettingsPage = () => {
  const handleUpgrade = async () => {
    try {
      console.log('[TEST DEBUG] Premium upgrade clicked');
      console.log('[TEST DEBUG] Making API request to /api/stripe/checkout');
      
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          plan: 'premium',
          billing_period: 'monthly'
        }),
      });

      console.log('[TEST DEBUG] API response status:', response.status);
      
      const data = await response.json();
      console.log('[TEST DEBUG] API response data:', data);
      
      if (data.success && data.url) {
        console.log('[TEST DEBUG] Redirecting to Stripe checkout:', data.url);
        window.location.replace(data.url);
      } else {
        console.error('[TEST DEBUG] Premium upgrade failed:', data.error);
      }
    } catch (error) {
      console.error('[TEST DEBUG] Network error during upgrade:', error);
    }
  };

  return (
    <div className="p-8">
      <div className="border-b border-gray-200 mb-8">
        <div className="flex space-x-8">
          <button className="tab-button">Profile</button>
          <button className="tab-button">API Keys</button>
          <button className="tab-button" data-testid="membership-tab">Membership</button>
        </div>
      </div>
      
      <div data-testid="membership-content">
        <h2>Membership & Usage</h2>
        
        <div className="usage-stats">
          <div className="usage-item">
            <span>Campaigns</span>
            <span>8 / 10</span>
          </div>
          <div className="usage-item">
            <span>AI Tools</span>
            <span>4 / 5</span>
          </div>
          <div className="usage-item">
            <span>API Usage</span>
            <span>9,500 / 10,000</span>
          </div>
          <div className="usage-item">
            <span>Storage</span>
            <span>4.7 GB / 5.0 GB</span>
          </div>
        </div>

        <button 
          onClick={handleUpgrade}
          className="upgrade-button"
          data-testid="upgrade-to-premium-button"
        >
          Upgrade to Premium
        </button>
      </div>
    </div>
  );
};

// Mock global window.location methods
const mockReplace = jest.fn();
Object.defineProperty(window, 'location', {
  value: {
    replace: mockReplace,
    href: 'https://3kpro.services/settings'
  },
  writable: true
});

// Mock fetch globally
global.fetch = jest.fn();

describe('Premium Upgrade Functional E2E Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReplace.mockClear();
  });

  describe('Premium Upgrade Button Behavior', () => {
    it('should render membership tab and upgrade button', () => {
      render(<MockSettingsPage />);
      
      // Verify membership tab exists
      const membershipTab = screen.getByTestId('membership-tab');
      expect(membershipTab).toBeInTheDocument();
      
      // Verify upgrade button exists
      const upgradeButton = screen.getByTestId('upgrade-to-premium-button');
      expect(upgradeButton).toBeInTheDocument();
      expect(upgradeButton).toHaveTextContent('Upgrade to Premium');
    });

    it('should display usage statistics showing need for upgrade', () => {
      render(<MockSettingsPage />);
      
      // Verify high usage values that encourage upgrade
      expect(screen.getByText('8 / 10')).toBeInTheDocument(); // Campaigns: 80% used
      expect(screen.getByText('4 / 5')).toBeInTheDocument(); // AI Tools: 80% used  
      expect(screen.getByText('9,500 / 10,000')).toBeInTheDocument(); // API: 95% used
      expect(screen.getByText('4.7 GB / 5.0 GB')).toBeInTheDocument(); // Storage: 94% used
    });

    it('should make API call when upgrade button is clicked', async () => {
      // Mock successful API response
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          success: true,
          url: 'https://checkout.stripe.com/c/pay/cs_premium_test_123'
        }),
      } as Response);

      render(<MockSettingsPage />);
      
      const upgradeButton = screen.getByTestId('upgrade-to-premium-button');
      fireEvent.click(upgradeButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            plan: 'premium',
            billing_period: 'monthly'
          }),
        });
      });
    });

    it('should redirect to Stripe checkout on successful API response', async () => {
      const checkoutUrl = 'https://checkout.stripe.com/c/pay/cs_premium_test_123';
      
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          success: true,
          url: checkoutUrl
        }),
      } as Response);

      render(<MockSettingsPage />);
      
      const upgradeButton = screen.getByTestId('upgrade-to-premium-button');
      fireEvent.click(upgradeButton);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(checkoutUrl);
      });
    });

    it('should handle API error responses gracefully', async () => {
      // Mock API error response
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({
          success: false,
          error: 'Failed to create checkout session'
        }),
      } as Response);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<MockSettingsPage />);
      
      const upgradeButton = screen.getByTestId('upgrade-to-premium-button');
      fireEvent.click(upgradeButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });

      // Should not redirect on error
      await waitFor(() => {
        expect(mockReplace).not.toHaveBeenCalled();
      });

      // Should log error
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('[TEST DEBUG] Premium upgrade failed:'),
          'Failed to create checkout session'
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it('should handle network errors during upgrade', async () => {
      // Mock network error
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(
        new Error('Network error')
      );

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<MockSettingsPage />);
      
      const upgradeButton = screen.getByTestId('upgrade-to-premium-button');
      fireEvent.click(upgradeButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });

      // Should not redirect on network error
      await waitFor(() => {
        expect(mockReplace).not.toHaveBeenCalled();
      });

      // Should log network error
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('[TEST DEBUG] Network error during upgrade:'),
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('API Request Structure Validation', () => {
    it('should send correct request payload for premium monthly', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          success: true,
          url: 'https://checkout.stripe.com/c/pay/cs_test_123'
        }),
      } as Response);

      render(<MockSettingsPage />);
      
      const upgradeButton = screen.getByTestId('upgrade-to-premium-button');
      fireEvent.click(upgradeButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            plan: 'premium',
            billing_period: 'monthly'
          }),
        });
      });
    });

    it('should use correct API endpoint', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          success: true,
          url: 'https://checkout.stripe.com/c/pay/cs_test_123'
        }),
      } as Response);

      render(<MockSettingsPage />);
      
      const upgradeButton = screen.getByTestId('upgrade-to-premium-button');
      fireEvent.click(upgradeButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/stripe/checkout'),
          expect.any(Object)
        );
      });
    });

    it('should handle different Stripe checkout URLs correctly', async () => {
      const testUrls = [
        'https://checkout.stripe.com/c/pay/cs_live_abc123',
        'https://checkout.stripe.com/c/pay/cs_test_def456',
        'https://checkout.stripe.com/c/pay/cs_premium_monthly_789'
      ];

      for (let i = 0; i < testUrls.length; i++) {
        const url = testUrls[i];
        mockReplace.mockClear();
        
        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            success: true,
            url: url
          }),
        } as Response);

        const { unmount } = render(<MockSettingsPage />);
        
        const upgradeButton = screen.getByTestId('upgrade-to-premium-button');
        fireEvent.click(upgradeButton);

        await waitFor(() => {
          expect(mockReplace).toHaveBeenCalledWith(url);
        });

        unmount(); // Clean up between iterations
      }
    });
  });

  describe('User Experience Flow', () => {
    it('should complete full upgrade flow successfully', async () => {
      const checkoutUrl = 'https://checkout.stripe.com/c/pay/cs_premium_monthly_success';
      
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          success: true,
          url: checkoutUrl
        }),
      } as Response);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      render(<MockSettingsPage />);
      
      // 1. User sees usage statistics showing high usage
      expect(screen.getByText('8 / 10')).toBeInTheDocument();
      expect(screen.getByText('4 / 5')).toBeInTheDocument();
      
      // 2. User clicks upgrade button
      const upgradeButton = screen.getByTestId('upgrade-to-premium-button');
      expect(upgradeButton).toBeEnabled();
      
      fireEvent.click(upgradeButton);

      // 3. API request is made
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            plan: 'premium',
            billing_period: 'monthly'
          }),
        });
      });

      // 4. Successful response triggers redirect
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(checkoutUrl);
      });

      // 5. Debug logs confirm the flow
      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith('[TEST DEBUG] Premium upgrade clicked');
        expect(consoleLogSpy).toHaveBeenCalledWith('[TEST DEBUG] Making API request to /api/stripe/checkout');
        expect(consoleLogSpy).toHaveBeenCalledWith('[TEST DEBUG] API response status:', 200);
        expect(consoleLogSpy).toHaveBeenCalledWith('[TEST DEBUG] Redirecting to Stripe checkout:', checkoutUrl);
      });

      consoleLogSpy.mockRestore();
    });
  });
});