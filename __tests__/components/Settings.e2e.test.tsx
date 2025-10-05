import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import SettingsPage from '@/app/(portal)/settings/page';

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

describe('Settings Page E2E Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful API responses
    (fetch as jest.MockedFunction<typeof fetch>).mockImplementation((url) => {
      if (url.toString().includes('/api/profile')) {
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
      
      if (url.toString().includes('/api/ai-tools/list')) {
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

      if (url.toString().includes('/api/usage')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              campaigns: { used: 5, limit: 10 },
              ai_tools: { used: 3, limit: 5 },
              api_usage: { used: 1000, limit: 10000 },
              storage: { used: 2048, limit: 5120 },
              estimated_costs: { total: 25.50, openai: 15.30, anthropic: 10.20 },
              lm_studio_savings: { total: 125.75, last_month: 45.25 },
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

  describe('Profile Settings Tab', () => {
    it('should render profile form with all new fields', async () => {
      render(<SettingsPage />);
      
      // Wait for profile data to load
      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      });

      // Verify all new profile fields are present
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/bio/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/website/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/avatar url/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/company logo url/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/timezone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/language/i)).toBeInTheDocument();
      
      // Verify social media fields
      expect(screen.getByLabelText(/twitter handle/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/linkedin handle/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/facebook handle/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/instagram handle/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/tiktok handle/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/reddit handle/i)).toBeInTheDocument();
    });

    it('should update profile when form is submitted', async () => {
      render(<SettingsPage />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      });

      // Update bio field
      const bioField = screen.getByLabelText(/bio/i);
      fireEvent.change(bioField, { target: { value: 'Updated bio' } });

      // Submit form
      const saveButton = screen.getByRole('button', { name: /save profile/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"bio":"Updated bio"'),
        });
      });
    });
  });

  describe('API Keys Tab', () => {
    it('should render API keys form with instruction cards', async () => {
      render(<SettingsPage />);
      
      // Switch to API Keys tab
      fireEvent.click(screen.getByText('API Keys'));
      
      await waitFor(() => {
        expect(screen.getByText('AI Provider Configuration')).toBeInTheDocument();
      });

      // Verify all providers are shown
      expect(screen.getByText('OpenAI')).toBeInTheDocument();
      expect(screen.getByText('Anthropic (Claude)')).toBeInTheDocument();
      expect(screen.getByText('Google AI')).toBeInTheDocument();
      expect(screen.getByText('ElevenLabs')).toBeInTheDocument();
      expect(screen.getByText('xAI (Grok)')).toBeInTheDocument();

      // Verify instruction cards are expandable
      const openaiCard = screen.getByText('Setup Instructions').closest('button');
      expect(openaiCard).toBeInTheDocument();
    });

    it('should expand instruction cards on click', async () => {
      render(<SettingsPage />);
      
      fireEvent.click(screen.getByText('API Keys'));
      
      await waitFor(() => {
        expect(screen.getByText('OpenAI')).toBeInTheDocument();
      });

      // Find and click first "Setup Instructions" button
      const instructionButtons = screen.getAllByText('Setup Instructions');
      fireEvent.click(instructionButtons[0]);

      await waitFor(() => {
        // Should show expanded content
        expect(screen.getByText(/Visit the OpenAI platform/)).toBeInTheDocument();
      });
    });

    it('should test API connection when test button is clicked', async () => {
      render(<SettingsPage />);
      
      fireEvent.click(screen.getByText('API Keys'));
      
      await waitFor(() => {
        expect(screen.getByText('OpenAI')).toBeInTheDocument();
      });

      // Enter API key
      const openaiInput = screen.getByPlaceholderText(/sk-/);
      fireEvent.change(openaiInput, { target: { value: 'sk-test-key-123' } });

      // Mock successful test response
      (fetch as jest.MockedFunction<typeof fetch>).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        } as Response)
      );

      // Click test button
      const testButtons = screen.getAllByText('Test Connection');
      fireEvent.click(testButtons[0]);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/ai-tools/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: 'openai',
            api_key: 'sk-test-key-123',
          }),
        });
      });
    });

    it('should save API keys configuration', async () => {
      render(<SettingsPage />);
      
      fireEvent.click(screen.getByText('API Keys'));
      
      await waitFor(() => {
        expect(screen.getByText('OpenAI')).toBeInTheDocument();
      });

      // Enter API keys
      const openaiInput = screen.getByPlaceholderText(/sk-/);
      fireEvent.change(openaiInput, { target: { value: 'sk-test-key-123' } });

      // Save configuration
      const saveButton = screen.getByRole('button', { name: /save api keys/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/ai-tools/configure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"openai":"sk-test-key-123"'),
        });
      });
    });
  });

  describe('Membership Tab', () => {
    it('should render usage statistics with progress bars', async () => {
      render(<SettingsPage />);
      
      fireEvent.click(screen.getByText('Membership'));
      
      await waitFor(() => {
        expect(screen.getByText('Usage Overview')).toBeInTheDocument();
      });

      // Verify usage meters are displayed
      expect(screen.getByText('Campaigns')).toBeInTheDocument();
      expect(screen.getByText('5 / 10')).toBeInTheDocument();
      
      expect(screen.getByText('AI Tools')).toBeInTheDocument();
      expect(screen.getByText('3 / 5')).toBeInTheDocument();
      
      expect(screen.getByText('API Usage')).toBeInTheDocument();
      expect(screen.getByText('1,000 / 10,000')).toBeInTheDocument();
      
      expect(screen.getByText('Storage')).toBeInTheDocument();
      expect(screen.getByText('2.0 GB / 5.0 GB')).toBeInTheDocument();
    });

    it('should display cost tracking information', async () => {
      render(<SettingsPage />);
      
      fireEvent.click(screen.getByText('Membership'));
      
      await waitFor(() => {
        expect(screen.getByText('Cost Tracking')).toBeInTheDocument();
      });

      // Verify cost display
      expect(screen.getByText('$25.50')).toBeInTheDocument(); // Total costs
      expect(screen.getByText('$125.75')).toBeInTheDocument(); // LM Studio savings
    });

    it('should show progress bar colors based on usage percentage', async () => {
      render(<SettingsPage />);
      
      fireEvent.click(screen.getByText('Membership'));
      
      await waitFor(() => {
        expect(screen.getByText('Usage Overview')).toBeInTheDocument();
      });

      // Check that progress bars have appropriate styling
      const progressBars = screen.getAllByRole('progressbar');
      expect(progressBars.length).toBeGreaterThan(0);
      
      // Campaigns usage: 5/10 = 50% (should be green)
      const campaignsProgress = progressBars.find(bar => 
        bar.getAttribute('aria-label')?.includes('50%')
      );
      expect(campaignsProgress).toBeInTheDocument();
      
      // AI Tools usage: 3/5 = 60% (should be yellow/orange)
      const aiToolsProgress = progressBars.find(bar => 
        bar.getAttribute('aria-label')?.includes('60%')
      );
      expect(aiToolsProgress).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('should switch between tabs correctly', async () => {
      render(<SettingsPage />);
      
      // Start on Profile tab
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      
      // Switch to API Keys
      fireEvent.click(screen.getByText('API Keys'));
      await waitFor(() => {
        expect(screen.getByText('AI Provider Configuration')).toBeInTheDocument();
      });
      
      // Switch to Membership
      fireEvent.click(screen.getByText('Membership'));
      await waitFor(() => {
        expect(screen.getByText('Usage Overview')).toBeInTheDocument();
      });
      
      // Switch back to Profile
      fireEvent.click(screen.getByText('Profile'));
      await waitFor(() => {
        expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      // Mock failed API response
      (fetch as jest.MockedFunction<typeof fetch>).mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'API Error' }),
        } as Response)
      );

      render(<SettingsPage />);
      
      fireEvent.click(screen.getByText('API Keys'));
      
      await waitFor(() => {
        expect(screen.getByText('OpenAI')).toBeInTheDocument();
      });

      // Try to test connection with invalid response
      const testButtons = screen.getAllByText('Test Connection');
      fireEvent.click(testButtons[0]);

      // Should handle error without crashing
      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });
    });

    it('should validate required fields', async () => {
      render(<SettingsPage />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      });

      // Clear required field
      const firstNameField = screen.getByDisplayValue('John');
      fireEvent.change(firstNameField, { target: { value: '' } });

      // Try to submit
      const saveButton = screen.getByRole('button', { name: /save profile/i });
      fireEvent.click(saveButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      });
    });
  });
});