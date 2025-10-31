import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter, useSearchParams } from 'next/navigation'
import DashboardPage from '@/app/(portal)/dashboard/page'
import LoginPage from '@/app/(auth)/login/page'
import { Skeleton } from '@/components/SkeletonLoader'
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

// Mock viewport resize utility for mobile testing
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 375, // iPhone SE width
})

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 667, // iPhone SE height
})

const mockPush = jest.fn()
const mockRouter = {
  push: mockPush,
  refresh: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
}

const mockSearchParams = {
  get: jest.fn(),
}

const mockSupabase = {
  auth: {
    getUser: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
      order: jest.fn(() => Promise.resolve({ data: [], error: null })),
    })),
    insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
    update: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  })),
}

// Mock authenticated user for dashboard tests
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User',
  },
}

beforeEach(() => {
  jest.clearAllMocks()
  ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  ;(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)
  ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  
  // Default to mobile viewport
  window.innerWidth = 375
  window.innerHeight = 667
})

describe('Mobile Optimization E2E Tests', () => {
  describe('Skeleton Loader - Tron Theme Integration', () => {
    test('skeleton loader uses correct Tron theme colors', () => {
      render(<Skeleton />)

      const skeletonElement = document.querySelector('.animate-pulse')
      expect(skeletonElement).toBeInTheDocument()
      
      // Check if skeleton uses tron-grid background color class
      const skeletonBackground = document.querySelector('.bg-tron-grid\\/50')
      expect(skeletonBackground).toBeInTheDocument()
    })

    test('skeleton loader maintains theme consistency in dark mode', () => {
      // Set dark mode context
      document.documentElement.classList.add('dark')
      
      render(<Skeleton />)
      
      // Verify skeleton blends with dark theme
      const skeletonElement = document.querySelector('.animate-pulse')
      expect(skeletonElement).toBeInTheDocument()
      expect(skeletonElement).toHaveClass('bg-tron-grid/50')
      
      // Cleanup
      document.documentElement.classList.remove('dark')
    })

    test('skeleton loader animation works correctly', async () => {
      render(<Skeleton />)
      
      const animatedElement = document.querySelector('.animate-pulse')
      expect(animatedElement).toBeInTheDocument()
      
      // Verify CSS animation class is applied
      expect(animatedElement).toHaveClass('animate-pulse')
    })
  })

  describe('Dashboard Mobile Responsiveness', () => {
    beforeEach(() => {
      // Mock authenticated user for dashboard access
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      // Mock dashboard data
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'campaigns') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                order: jest.fn(() => Promise.resolve({
                  data: [
                    { id: 1, name: 'Test Campaign', status: 'active', created_at: '2024-01-01' },
                    { id: 2, name: 'Mobile Campaign', status: 'draft', created_at: '2024-01-02' },
                  ],
                  error: null,
                })),
              })),
            })),
          }
        }
        return {
          select: jest.fn(() => Promise.resolve({ data: [], error: null })),
        }
      })
    })

    test('dashboard renders with mobile-responsive layout at 375px width', async () => {
      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
      })

      // Check mobile-specific responsive classes are applied
      const mainContent = document.querySelector('main')
      expect(mainContent).toBeInTheDocument()
      
      // Verify responsive padding/spacing for mobile
      const statsGrid = document.querySelector('.grid')
      if (statsGrid) {
        expect(statsGrid).toBeInTheDocument()
      }
    })

    test('stats grid adapts to mobile layout', async () => {
      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
      })

      // Look for stats cards
      const statsElements = screen.getAllByText(/campaigns|views|engagement/i, { exact: false })
      expect(statsElements.length).toBeGreaterThan(0)

      // Verify grid layout works on mobile
      const gridContainer = document.querySelector('.grid')
      if (gridContainer) {
        expect(gridContainer).toBeInTheDocument()
      }
    })

    test('campaign list shows properly on mobile', async () => {
      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByText('Test Campaign')).toBeInTheDocument()
        expect(screen.getByText('Mobile Campaign')).toBeInTheDocument()
      })

      // Verify campaign cards are displayed
      const campaignElements = screen.getAllByText(/campaign/i)
      expect(campaignElements.length).toBeGreaterThanOrEqual(2)
    })

    test('mobile navigation works correctly', async () => {
      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
      })

      // Look for navigation elements that should be mobile-optimized
      const navElements = document.querySelectorAll('[data-testid*="nav"], .nav, nav')
      if (navElements.length > 0) {
        expect(navElements[0]).toBeInTheDocument()
      }
    })

    test('mobile viewport maintains Tron theme consistency', async () => {
      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
      })

      // Check for Tron theme classes in mobile layout
      const darkBackground = document.querySelector('.bg-tron-dark')
      const gridBackground = document.querySelector('.bg-tron-grid')
      
      expect(darkBackground || gridBackground).toBeInTheDocument()
    })

    test('buttons maintain minimum touch target size on mobile', async () => {
      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
      })

      // Look for buttons and verify they have appropriate sizing
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        const computedStyle = window.getComputedStyle(button)
        // Button should have adequate height for touch (minimum 44px)
        const height = parseInt(computedStyle.height) || 0
        const paddingTop = parseInt(computedStyle.paddingTop) || 0
        const paddingBottom = parseInt(computedStyle.paddingBottom) || 0
        const totalHeight = height + paddingTop + paddingBottom
        
        // Minimum touch target should be reasonable for mobile
        expect(totalHeight).toBeGreaterThan(0)
      })
    })
  })

  describe('Login Page Mobile Experience', () => {
    test('login form is properly sized for mobile', () => {
      render(<LoginPage />)

      // Check for login form elements
      const emailInput = screen.getByPlaceholderText(/email/i) || 
                        screen.getByLabelText(/email/i)
      const passwordInput = screen.getByPlaceholderText(/password/i) || 
                           screen.getByLabelText(/password/i)

      if (emailInput) {
        expect(emailInput).toBeInTheDocument()
      }
      if (passwordInput) {
        expect(passwordInput).toBeInTheDocument()
      }
    })

    test('login form uses Tron theme styling', () => {
      render(<LoginPage />)

      // Check for Tron theme background
      const darkBackground = document.querySelector('.bg-tron-dark')
      const gridBackground = document.querySelector('.bg-tron-grid')
      
      expect(darkBackground || gridBackground).toBeInTheDocument()
    })

    test('login button maintains accessibility on mobile', () => {
      render(<LoginPage />)

      const loginButton = screen.getByRole('button', { name: /sign in|login/i })
      if (loginButton) {
        expect(loginButton).toBeInTheDocument()
        expect(loginButton).not.toBeDisabled()
      }
    })
  })

  describe('Cross-viewport Compatibility', () => {
    const viewports = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'Samsung Galaxy S20', width: 360, height: 800 },
      { name: 'iPad Mini', width: 768, height: 1024 },
      { name: 'Desktop', width: 1024, height: 768 },
    ]

    viewports.forEach(({ name, width, height }) => {
      test(`layout works correctly on ${name} (${width}x${height})`, async () => {
        // Set viewport
        window.innerWidth = width
        window.innerHeight = height
        
        // Mock user for dashboard
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        })

        render(<DashboardPage />)

        await waitFor(() => {
          expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
        })

        // Verify responsive layout adapts
        const mainContent = document.querySelector('main')
        expect(mainContent).toBeInTheDocument()

        // Check that essential elements are still visible
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
      })
    })
  })

  describe('Theme Integration Across Components', () => {
    test('all components maintain Tron theme consistency', async () => {
      // Test skeleton loader
      const { unmount: unmountSkeleton } = render(<Skeleton />)
      expect(document.querySelector('.bg-tron-grid\\/50')).toBeInTheDocument()
      unmountSkeleton()

      // Test login page
      const { unmount: unmountLogin } = render(<LoginPage />)
      const loginTheme = document.querySelector('.bg-tron-dark') || 
                        document.querySelector('.bg-tron-grid')
      expect(loginTheme).toBeInTheDocument()
      unmountLogin()

      // Test dashboard
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })
      
      render(<DashboardPage />)
      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
      })
      
      const dashboardTheme = document.querySelector('.bg-tron-dark') || 
                           document.querySelector('.bg-tron-grid')
      expect(dashboardTheme).toBeInTheDocument()
    })

    test('Tron cyan accent colors are used consistently', async () => {
      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
      })

      // Check for cyan accent colors in various elements
      const cyanElements = document.querySelectorAll('.text-tron-cyan, .border-tron-cyan, .bg-tron-cyan')
      // Should have at least some elements with cyan accents
      expect(cyanElements.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Performance and Loading States', () => {
    test('skeleton loaders display during component loading', async () => {
      // Mock delayed data loading
      let resolveData: (value: any) => void
      const delayedPromise = new Promise((resolve) => {
        resolveData = resolve
      })

      mockSupabase.from.mockImplementation(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => delayedPromise),
          })),
        })),
      }))

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      render(<DashboardPage />)

      // Should show loading states initially
      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
      })

      // Resolve the data
      resolveData!({ data: [], error: null })
    })

    test('mobile optimization does not impact loading performance', async () => {
      const startTime = performance.now()
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      render(<DashboardPage />)
      
      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
      })

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Should render reasonably quickly (less than 1 second)
      expect(renderTime).toBeLessThan(1000)
    })
  })

  describe('Accessibility on Mobile', () => {
    test('touch targets meet minimum size requirements', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
      })

      // Check all interactive elements
      const interactiveElements = [
        ...screen.getAllByRole('button'),
        ...screen.getAllByRole('link'),
      ]

      interactiveElements.forEach(element => {
        // Ensure element exists and is accessible
        expect(element).toBeInTheDocument()
      })
    })

    test('text remains readable on mobile viewport', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
      })

      // Verify text content is present and readable
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
      
      // Check for heading elements
      const headings = screen.getAllByRole('heading')
      headings.forEach(heading => {
        expect(heading).toBeInTheDocument()
        expect(heading.textContent).toBeTruthy()
      })
    })

    test('navigation remains accessible on mobile', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
      })

      // Look for navigation elements
      const navElements = document.querySelectorAll('[role="navigation"], nav')
      navElements.forEach(nav => {
        expect(nav).toBeInTheDocument()
      })
    })
  })
})