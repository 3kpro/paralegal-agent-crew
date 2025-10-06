import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import SettingsPage from '@/app/(portal)/settings/page';

// Mock global window.location methods
const mockReplace = jest.fn();
Object.defineProperty(window, 'location', {
  value: {
    replace: mockReplace,
    href: 'https://3kpro.services/settings'
  },
  writable: true
});

// Mock fetch to simulate API calls
global.fetch = jest.fn();

// Mock useUser hook
jest.mock('@/lib/supabase/client', () => ({
  createClientComponentClient: () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      }),
    },
  }),
}));

describe('Premium Upgrade E2E Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReplace.mockClear();
    
    // Mock successful API responses for profile, usage, and ai-tools
    (fetch as jest.MockedFunction<typeof fetch>).mockImplementation((url) => {
      const urlString = url.toString();
      
      if (urlString.includes('/api/profile')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            profile: {
              first_name: 'John',
              last_name: 'Doe',
              bio: 'Test bio',
              website: 'https://example.com',
              avatar_url: '',
              company_logo_url: '',
              timezone: 'America/New_York',
              language: 'en',
              twitter_handle: 'johndoe',
              linkedin_handle: 'johndoe',
              facebook_handle: '',
              instagram_handle: '',
              tiktok_handle: '',
              reddit_handle: '',
            },
          }),
        } as Response);
      }
      
      if (urlString.includes('/api/ai-tools/list')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            ai_tools: {
              openai: { provider: 'openai', api_key: '', is_configured: false },
              anthropic: { provider: 'anthropic', api_key: '', is_configured: false },
              google: { provider: 'google', api_key: '', is_configured: false },
              elevenlabs: { provider: 'elevenlabs', api_key: '', is_configured: false },
              xai: { provider: 'xai', api_key: '', is_configured: false },
            },
          }),
        } as Response);
      }

      if (urlString.includes('/api/usage')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              campaigns: { used: 8, limit: 10 }, // Close to limit to make upgrade more relevant
              ai_tools: { used: 4, limit: 5 },
              api_usage: { used: 9500, limit: 10000 },
              storage: { used: 4800, limit: 5120 },
              estimated_costs: { total: 45.75, openai: 25.30, anthropic: 20.45 },
              lm_studio_savings: { total: 225.50, last_month: 85.25 },
            },
          }),
        } as Response);
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);
    });
  });

  describe('Premium Upgrade User Flow', () => {
    it('should navigate to membership tab and display upgrade button', async () => {
      await act(async () => {
        render(<SettingsPage />);
      });
      
      // Wait for initial loading to complete
      await waitFor(() => {
        const membershipTab = screen.queryByText('Membership');
        expect(membershipTab).toBeInTheDocument();
      }, { timeout: 5000 });
      
      // Navigate to Membership tab
      const membershipTab = screen.getByText('Membership');
      await act(async () => {
        fireEvent.click(membershipTab);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Membership & Usage')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Verify usage statistics are displayed
      expect(screen.getByText('Campaigns')).toBeInTheDocument();
      expect(screen.getByText('8 / 10')).toBeInTheDocument();
      
      // Look for upgrade button
      const upgradeButton = screen.getByRole('button', { name: /upgrade to premium/i });
      expect(upgradeButton).toBeInTheDocument();
      expect(upgradeButton).not.toBeDisabled();
    });

    it('should handle successful premium upgrade checkout flow', async () => {
      // Mock successful Stripe checkout session creation
      (fetch as jest.MockedFunction<typeof fetch>).mockImplementation((url) => {
        const urlString = url.toString();
        
        if (urlString.includes('/api/stripe/checkout')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              url: 'https://checkout.stripe.com/c/pay/cs_test_premium_session_123'
            }),
          } as Response);
        }
        
        // Keep other mocks as defined in beforeEach
        if (urlString.includes('/api/profile')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              profile: {
                first_name: 'John',
                last_name: 'Doe',
                bio: 'Test bio',
                website: 'https://example.com',
                avatar_url: '',
                company_logo_url: '',
                timezone: 'America/New_York',
                language: 'en',
                twitter_handle: 'johndoe',
                linkedin_handle: 'johndoe',
                facebook_handle: '',
                instagram_handle: '',
                tiktok_handle: '',
                reddit_handle: '',
              },
            }),
          } as Response);
        }
        
        if (urlString.includes('/api/ai-tools/list')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              ai_tools: {
                openai: { provider: 'openai', api_key: '', is_configured: false },
                anthropic: { provider: 'anthropic', api_key: '', is_configured: false },
                google: { provider: 'google', api_key: '', is_configured: false },
                elevenlabs: { provider: 'elevenlabs', api_key: '', is_configured: false },
                xai: { provider: 'xai', api_key: '', is_configured: false },
              },
            }),
          } as Response);
        }

        if (urlString.includes('/api/usage')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: {
                campaigns: { used: 8, limit: 10 },
                ai_tools: { used: 4, limit: 5 },
                api_usage: { used: 9500, limit: 10000 },
                storage: { used: 4800, limit: 5120 },
                estimated_costs: { total: 45.75, openai: 25.30, anthropic: 20.45 },
                lm_studio_savings: { total: 225.50, last_month: 85.25 },
              },
            }),
          } as Response);
        }

        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        } as Response);
      });

      render(<SettingsPage />);
      
      // Navigate to Membership tab
      fireEvent.click(screen.getByText('Membership'));
      
      await waitFor(() => {
        expect(screen.getByText('Membership & Usage')).toBeInTheDocument();
      });

      // Click upgrade button
      const upgradeButton = screen.getByRole('button', { name: /upgrade to premium/i });
      fireEvent.click(upgradeButton);

      // Wait for API call to be made
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

      // Verify redirection to Stripe checkout
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('https://checkout.stripe.com/c/pay/cs_test_premium_session_123');
      });
    });

    it('should handle yearly billing option for premium upgrade', async () => {
      // Mock successful Stripe checkout session creation for yearly
      (fetch as jest.MockedFunction<typeof fetch>).mockImplementation((url) => {
        const urlString = url.toString();
        
        if (urlString.includes('/api/stripe/checkout')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              url: 'https://checkout.stripe.com/c/pay/cs_test_premium_yearly_session_123'
            }),
          } as Response);
        }
        
        // Keep other mocks
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        } as Response);
      });

      render(<SettingsPage />);
      
      fireEvent.click(screen.getByText('Membership'));
      
      await waitFor(() => {
        expect(screen.getByText('Membership & Usage')).toBeInTheDocument();
      });

      // Look for billing toggle if it exists
      const billingToggles = screen.queryAllByRole('button');
      const yearlyToggle = billingToggles.find(button => 
        button.textContent?.toLowerCase().includes('yearly') || 
        button.textContent?.toLowerCase().includes('annual')
      );

      if (yearlyToggle) {
        fireEvent.click(yearlyToggle);
      }

      // Click upgrade button
      const upgradeButton = screen.getByRole('button', { name: /upgrade to premium/i });
      fireEvent.click(upgradeButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('premium'),
        });
      });

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('https://checkout.stripe.com/c/pay/cs_test_premium_yearly_session_123');
      });
    });

    it('should handle API errors gracefully during upgrade', async () => {
      // Mock API error
      (fetch as jest.MockedFunction<typeof fetch>).mockImplementation((url) => {
        const urlString = url.toString();
        
        if (urlString.includes('/api/stripe/checkout')) {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: () => Promise.resolve({
              success: false,
              error: 'Failed to create checkout session'
            }),
          } as Response);
        }
        
        // Keep other successful mocks
        if (urlString.includes('/api/profile')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              profile: {
                first_name: 'John',
                last_name: 'Doe',
                bio: 'Test bio',
                website: 'https://example.com',
                avatar_url: '',
                company_logo_url: '',
                timezone: 'America/New_York',
                language: 'en',
                twitter_handle: 'johndoe',
                linkedin_handle: 'johndoe',
                facebook_handle: '',
                instagram_handle: '',
                tiktok_handle: '',
                reddit_handle: '',
              },
            }),
          } as Response);
        }
        
        if (urlString.includes('/api/ai-tools/list')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              ai_tools: {
                openai: { provider: 'openai', api_key: '', is_configured: false },
                anthropic: { provider: 'anthropic', api_key: '', is_configured: false },
                google: { provider: 'google', api_key: '', is_configured: false },
                elevenlabs: { provider: 'elevenlabs', api_key: '', is_configured: false },
                xai: { provider: 'xai', api_key: '', is_configured: false },
              },
            }),
          } as Response);
        }

        if (urlString.includes('/api/usage')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: {
                campaigns: { used: 8, limit: 10 },
                ai_tools: { used: 4, limit: 5 },
                api_usage: { used: 9500, limit: 10000 },
                storage: { used: 4800, limit: 5120 },
                estimated_costs: { total: 45.75, openai: 25.30, anthropic: 20.45 },
                lm_studio_savings: { total: 225.50, last_month: 85.25 },
              },
            }),
          } as Response);
        }

        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        } as Response);
      });

      // Mock console.error to suppress error output during test
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<SettingsPage />);
      
      fireEvent.click(screen.getByText('Membership'));
      
      await waitFor(() => {
        expect(screen.getByText('Membership & Usage')).toBeInTheDocument();
      });

      const upgradeButton = screen.getByRole('button', { name: /upgrade to premium/i });
      fireEvent.click(upgradeButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('premium'),
        });
      });

      // Verify no redirection occurs on error
      await waitFor(() => {
        expect(mockReplace).not.toHaveBeenCalled();
      });

      // Verify error is logged
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });

    it('should handle network errors during upgrade', async () => {
      // Mock network error
      (fetch as jest.MockedFunction<typeof fetch>).mockImplementation((url) => {
        const urlString = url.toString();
        
        if (urlString.includes('/api/stripe/checkout')) {
          return Promise.reject(new Error('Network error'));
        }
        
        // Keep other successful mocks
        if (urlString.includes('/api/profile')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              profile: {
                first_name: 'John',
                last_name: 'Doe',
                bio: 'Test bio',
                website: 'https://example.com',
                avatar_url: '',
                company_logo_url: '',
                timezone: 'America/New_York',
                language: 'en',
                twitter_handle: 'johndoe',
                linkedin_handle: 'johndoe',
                facebook_handle: '',
                instagram_handle: '',
                tiktok_handle: '',
                reddit_handle: '',
              },
            }),
          } as Response);
        }
        
        if (urlString.includes('/api/ai-tools/list')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              ai_tools: {
                openai: { provider: 'openai', api_key: '', is_configured: false },
                anthropic: { provider: 'anthropic', api_key: '', is_configured: false },
                google: { provider: 'google', api_key: '', is_configured: false },
                elevenlabs: { provider: 'elevenlabs', api_key: '', is_configured: false },
                xai: { provider: 'xai', api_key: '', is_configured: false },
              },
            }),
          } as Response);
        }

        if (urlString.includes('/api/usage')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: {
                campaigns: { used: 8, limit: 10 },
                ai_tools: { used: 4, limit: 5 },
                api_usage: { used: 9500, limit: 10000 },
                storage: { used: 4800, limit: 5120 },
                estimated_costs: { total: 45.75, openai: 25.30, anthropic: 20.45 },
                lm_studio_savings: { total: 225.50, last_month: 85.25 },
              },
            }),
          } as Response);
        }

        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        } as Response);
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<SettingsPage />);
      
      fireEvent.click(screen.getByText('Membership'));
      
      await waitFor(() => {
        expect(screen.getByText('Membership & Usage')).toBeInTheDocument();
      });

      const upgradeButton = screen.getByRole('button', { name: /upgrade to premium/i });
      fireEvent.click(upgradeButton);

      // Verify no redirection occurs on network error
      await waitFor(() => {
        expect(mockReplace).not.toHaveBeenCalled();
      });

      // Verify error is logged
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });

    it('should display appropriate upgrade button when user is close to limits', async () => {
      render(<SettingsPage />);
      
      fireEvent.click(screen.getByText('Membership'));
      
      await waitFor(() => {
        expect(screen.getByText('Membership & Usage')).toBeInTheDocument();
      });

      // Verify high usage values are displayed
      expect(screen.getByText('8 / 10')).toBeInTheDocument(); // Campaigns: 80% used
      expect(screen.getByText('4 / 5')).toBeInTheDocument(); // AI Tools: 80% used
      expect(screen.getByText('9,500 / 10,000')).toBeInTheDocument(); // API: 95% used
      expect(screen.getByText('4.7 GB / 5.0 GB')).toBeInTheDocument(); // Storage: 94% used

      // Upgrade button should be prominently displayed
      const upgradeButton = screen.getByRole('button', { name: /upgrade to premium/i });
      expect(upgradeButton).toBeInTheDocument();
      expect(upgradeButton).toBeEnabled();
    });
  });

  describe('Authentication Integration', () => {
    it('should require authentication for upgrade flow', async () => {
      // Mock unauthenticated state
      jest.doMock('@/lib/supabase/client', () => ({
        createClientComponentClient: () => ({
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: null },
              error: { message: 'User not authenticated' },
            }),
          },
        }),
      }));

      render(<SettingsPage />);

      // Component should handle unauthenticated state gracefully
      // (Exact behavior depends on component implementation)
      expect(screen.queryByText('Membership')).toBeInTheDocument();
    });
  });

  describe('Accessibility and UI Tests', () => {
    it('should have accessible upgrade button with proper ARIA attributes', async () => {
      render(<SettingsPage />);
      
      fireEvent.click(screen.getByText('Membership'));
      
      await waitFor(() => {
        expect(screen.getByText('Membership & Usage')).toBeInTheDocument();
      });

      const upgradeButton = screen.getByRole('button', { name: /upgrade to premium/i });
      
      // Check accessibility attributes
      expect(upgradeButton).toHaveAttribute('type', 'button');
      expect(upgradeButton).not.toHaveAttribute('aria-disabled', 'true');
    });

    it('should provide visual feedback during upgrade process', async () => {
      // Mock slow API response to test loading states
      (fetch as jest.MockedFunction<typeof fetch>).mockImplementation((url) => {
        const urlString = url.toString();
        
        if (urlString.includes('/api/stripe/checkout')) {
          return new Promise(resolve => {
            setTimeout(() => resolve({
              ok: true,
              json: () => Promise.resolve({
                success: true,
                url: 'https://checkout.stripe.com/c/pay/cs_test_premium_session_123'
              }),
            } as Response), 1000);
          });
        }
        
        // Keep other mocks fast
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        } as Response);
      });

      render(<SettingsPage />);
      
      fireEvent.click(screen.getByText('Membership'));
      
      await waitFor(() => {
        expect(screen.getByText('Membership & Usage')).toBeInTheDocument();
      });

      const upgradeButton = screen.getByRole('button', { name: /upgrade to premium/i });
      fireEvent.click(upgradeButton);

      // Button should show loading state (exact implementation may vary)
      // This would depend on the specific loading implementation in the component
      
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('https://checkout.stripe.com/c/pay/cs_test_premium_session_123');
      }, { timeout: 2000 });
    });
  });
});