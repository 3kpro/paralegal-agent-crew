import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter, useSearchParams } from 'next/navigation'
import OnboardingPage from '@/app/(portal)/onboarding/page'
import ConnectPlatformPage from '@/app/connect/[platform]/page'
import { createClient } from '@/lib/supabase/client'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  useParams: jest.fn(),
}))

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}))

const mockPush = jest.fn()
const mockRouter = {
  push: mockPush,
  refresh: jest.fn(),
}

const mockSearchParams = {
  get: jest.fn(),
}

const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(() => ({
    update: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve()),
    })),
  })),
}

beforeEach(() => {
  jest.clearAllMocks()
  ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  ;(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)
  ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
})

describe('Onboarding Social Connections E2E', () => {
  describe('Onboarding Page - Step 2 Social Connections', () => {
    beforeEach(() => {
      // Mock user authentication
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      })
    })

    test('renders social connection step with all platform buttons', async () => {
      render(<OnboardingPage />)

      // Navigate to step 2
      const nextButton = screen.getByRole('button', { name: /next: connect socials/i })
      fireEvent.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText('Connect Social Accounts')).toBeInTheDocument()
        expect(screen.getByText('Connect platforms to publish your content (you can skip this for now)')).toBeInTheDocument()
      })

      // Verify all social media buttons are present
      expect(screen.getByRole('button', { name: /twitter/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /linkedin/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /facebook/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /instagram/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /tiktok/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /reddit/i })).toBeInTheDocument()

      // Verify completion buttons
      expect(screen.getByRole('button', { name: /complete setup/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /skip for now/i })).toBeInTheDocument()
    })

    test('social media buttons redirect to correct connection URLs', async () => {
      render(<OnboardingPage />)

      // Navigate to step 2
      const nextButton = screen.getByRole('button', { name: /next: connect socials/i })
      fireEvent.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText('Connect Social Accounts')).toBeInTheDocument()
      })

      // Test Twitter button
      const twitterButton = screen.getByRole('button', { name: /twitter/i })
      fireEvent.click(twitterButton)
      expect(mockPush).toHaveBeenCalledWith('/api/auth/connect/twitter')

      // Test LinkedIn button
      const linkedinButton = screen.getByRole('button', { name: /linkedin/i })
      fireEvent.click(linkedinButton)
      expect(mockPush).toHaveBeenCalledWith('/api/auth/connect/linkedin')

      // Test Facebook button
      const facebookButton = screen.getByRole('button', { name: /facebook/i })
      fireEvent.click(facebookButton)
      expect(mockPush).toHaveBeenCalledWith('/api/auth/connect/facebook')

      // Test Instagram button
      const instagramButton = screen.getByRole('button', { name: /instagram/i })
      fireEvent.click(instagramButton)
      expect(mockPush).toHaveBeenCalledWith('/api/auth/connect/instagram')

      // Test TikTok button
      const tiktokButton = screen.getByRole('button', { name: /tiktok/i })
      fireEvent.click(tiktokButton)
      expect(mockPush).toHaveBeenCalledWith('/api/auth/connect/tiktok')

      // Test Reddit button
      const redditButton = screen.getByRole('button', { name: /reddit/i })
      fireEvent.click(redditButton)
      expect(mockPush).toHaveBeenCalledWith('/api/auth/connect/reddit')
    })

    test('complete setup button completes onboarding', async () => {
      render(<OnboardingPage />)

      // Navigate to step 2
      const nextButton = screen.getByRole('button', { name: /next: connect socials/i })
      fireEvent.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText('Connect Social Accounts')).toBeInTheDocument()
      })

      const completeButton = screen.getByRole('button', { name: /complete setup/i })
      fireEvent.click(completeButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })

      // Verify onboarding progress was updated
      expect(mockSupabase.from).toHaveBeenCalledWith('onboarding_progress')
    })

    test('skip for now button completes onboarding', async () => {
      render(<OnboardingPage />)

      // Navigate to step 2
      const nextButton = screen.getByRole('button', { name: /next: connect socials/i })
      fireEvent.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText('Connect Social Accounts')).toBeInTheDocument()
      })

      const skipButton = screen.getByRole('button', { name: /skip for now/i })
      fireEvent.click(skipButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })

      // Verify onboarding progress was updated
      expect(mockSupabase.from).toHaveBeenCalledWith('onboarding_progress')
    })

    test('handles loading states during completion', async () => {
      // Mock a delayed response
      let resolvePromise: (value: any) => void
      const delayedPromise = new Promise<void>((resolve) => {
        resolvePromise = resolve
      })

      mockSupabase.from.mockReturnValue({
        update: jest.fn(() => ({
          eq: jest.fn(async () => {
            const result = await delayedPromise;
            return result;
          }),
        })),
      })

      render(<OnboardingPage />)

      // Navigate to step 2
      const nextButton = screen.getByRole('button', { name: /next: connect socials/i })
      fireEvent.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText('Connect Social Accounts')).toBeInTheDocument()
      })

      const completeButton = screen.getByRole('button', { name: /complete setup/i })
      fireEvent.click(completeButton)

      // Check loading state
      await waitFor(() => {
        expect(screen.getByText('Completing...')).toBeInTheDocument()
        expect(completeButton).toBeDisabled()
      })

      // Resolve the promise
      resolvePromise!({})

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })
  })

  describe('Connection Pages', () => {
    const platforms = [
      { platform: 'twitter', name: 'Twitter', icon: '🐦' },
      { platform: 'linkedin', name: 'LinkedIn', icon: '💼' },
      { platform: 'facebook', name: 'Facebook', icon: '📘' },
      { platform: 'instagram', name: 'Instagram', icon: '📸' },
      { platform: 'tiktok', name: 'TikTok', icon: '🎵' },
      { platform: 'reddit', name: 'Reddit', icon: '🤖' },
    ]

    platforms.forEach(({ platform, name, icon }) => {
      describe(`${name} Connection Page`, () => {
        beforeEach(() => {
          ;(require('next/navigation').useParams as jest.Mock).mockReturnValue({
            platform,
          })
          mockSearchParams.get.mockReturnValue('onboarding')
        })

        test(`renders ${name} connection page correctly`, () => {
          render(<ConnectPlatformPage />)

          // Validate platform name before using in RegExp
          const safeName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          expect(screen.getByRole('heading', { name: new RegExp(`Connect ${safeName}`, 'i') })).toBeInTheDocument()
          expect(screen.getByText(new RegExp(`Connect your ${safeName} account to publish content`), { exact: false })).toBeInTheDocument()
          expect(screen.getAllByText(icon)).toHaveLength(2) // Icon appears twice: in the circle and in the button
          expect(screen.getByRole('button', { name: new RegExp(`Connect ${safeName}`, 'i') })).toBeInTheDocument()
          expect(screen.getByRole('button', { name: /skip for now/i })).toBeInTheDocument()
        })

        test(`${name} connect button simulates connection flow`, async () => {
          render(<ConnectPlatformPage />)

          const connectButton = screen.getByRole('button', { name: new RegExp(`Connect ${name}`, 'i') })
          fireEvent.click(connectButton)

          // Check loading state
          await waitFor(() => {
            expect(screen.getByText('Connecting...')).toBeInTheDocument()
            expect(connectButton).toBeDisabled()
          })

          // Check success state
          await waitFor(() => {
            expect(screen.getByText(`${name} Connected!`)).toBeInTheDocument()
            expect(screen.getByText(`Successfully connected your ${name} account.`)).toBeInTheDocument()
          }, { timeout: 3000 })

          // Check redirect after success
          await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/onboarding')
          }, { timeout: 3000 })
        })

        test(`${name} skip button redirects to onboarding`, () => {
          render(<ConnectPlatformPage />)

          const skipButton = screen.getByRole('button', { name: /skip for now/i })
          fireEvent.click(skipButton)

          expect(mockPush).toHaveBeenCalledWith('/onboarding')
        })

        test(`${name} connection from settings redirects correctly`, () => {
          mockSearchParams.get.mockReturnValue('settings')

          render(<ConnectPlatformPage />)

          const skipButton = screen.getByRole('button', { name: /skip for now/i })
          fireEvent.click(skipButton)

          expect(mockPush).toHaveBeenCalledWith('/settings')
        })
      })
    })

    test('handles invalid platform gracefully', () => {
      ;(require('next/navigation').useParams as jest.Mock).mockReturnValue({
        platform: 'invalid-platform',
      })

      render(<ConnectPlatformPage />)
      expect(screen.getByText('Platform not found')).toBeInTheDocument()
    })
  })

  describe('Progress and Navigation Flow', () => {
    test('complete user flow from step 1 through social connections', async () => {
      render(<OnboardingPage />)

      // Start at step 1
      expect(screen.getByText('Step 1 of 2')).toBeInTheDocument()
      expect(screen.getByText('Complete Your Profile')).toBeInTheDocument()

      // Fill profile info (optional)
      const companyInput = screen.getByPlaceholderText('Acme Inc.')
      fireEvent.change(companyInput, { target: { value: 'Test Company' } })

      const industrySelect = screen.getByDisplayValue('Select industry...')
      fireEvent.change(industrySelect, { target: { value: 'technology' } })

      // Navigate to step 2
      const nextButton = screen.getByRole('button', { name: /next: connect socials/i })
      fireEvent.click(nextButton)

      // Verify step 2
      await waitFor(() => {
        expect(screen.getByText('Step 2 of 2')).toBeInTheDocument()
        expect(screen.getByText('Connect Social Accounts')).toBeInTheDocument()
      })

      // Complete onboarding
      const completeButton = screen.getByRole('button', { name: /complete setup/i })
      fireEvent.click(completeButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })

      // Verify profile was updated with company name
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
    })

    test('progress bar updates correctly between steps', async () => {
      render(<OnboardingPage />)

      // Check step 1 progress
      const progressBar = document.querySelector('.bg-indigo-600')
      expect(progressBar).toHaveStyle('width: 50%')

      // Navigate to step 2
      const nextButton = screen.getByRole('button', { name: /next: connect socials/i })
      fireEvent.click(nextButton)

      // Check step 2 progress
      await waitFor(() => {
        const updatedProgressBar = document.querySelector('.bg-indigo-600')
        expect(updatedProgressBar).toHaveStyle('width: 100%')
      })
    })
  })
})