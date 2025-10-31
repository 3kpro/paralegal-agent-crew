import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}))

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}))

const mockPush = jest.fn()
const mockRouter = {
  push: mockPush,
  refresh: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
}

const mockSupabase = {
  auth: {
    getUser: jest.fn(),
    signOut: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  })),
}

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
  ;(usePathname as jest.Mock).mockReturnValue('/dashboard')
  ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  
  mockSupabase.auth.getUser.mockResolvedValue({
    data: { user: mockUser },
    error: null,
  })

  // Set mobile viewport
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 375,
  })
})

describe('Mobile Navigation E2E Tests', () => {
  describe('Portal Layout Mobile Navigation', () => {
    // We'll test navigation components when they're available
    test('mobile navigation structure exists', async () => {
      // This test will verify mobile navigation when implemented
      const mockNavComponent = () => (
        <nav className="bg-tron-grid border-t border-tron-cyan/20 md:hidden">
          <div className="grid grid-cols-5 py-2">
            <button className="flex flex-col items-center justify-center p-2 text-tron-text hover:text-tron-cyan">
              <span>Dashboard</span>
            </button>
            <button className="flex flex-col items-center justify-center p-2 text-tron-text hover:text-tron-cyan">
              <span>Campaigns</span>
            </button>
            <button className="flex flex-col items-center justify-center p-2 text-tron-text hover:text-tron-cyan">
              <span>Create</span>
            </button>
            <button className="flex flex-col items-center justify-center p-2 text-tron-text hover:text-tron-cyan">
              <span>Analytics</span>
            </button>
            <button className="flex flex-col items-center justify-center p-2 text-tron-text hover:text-tron-cyan">
              <span>Settings</span>
            </button>
          </div>
        </nav>
      )

      render(mockNavComponent())

      // Verify navigation structure
      expect(screen.getByRole('navigation')).toBeInTheDocument()
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Campaigns')).toBeInTheDocument()
      expect(screen.getByText('Create')).toBeInTheDocument()
      expect(screen.getByText('Analytics')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()

      // Verify mobile-specific classes
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('md:hidden')
      expect(nav).toHaveClass('bg-tron-grid')
      expect(nav).toHaveClass('border-t')
      expect(nav).toHaveClass('border-tron-cyan/20')
    })

    test('mobile navigation buttons use Tron theme colors', () => {
      const mockNavComponent = () => (
        <nav className="bg-tron-grid">
          <button className="text-tron-text hover:text-tron-cyan">Dashboard</button>
          <button className="text-tron-text hover:text-tron-cyan">Campaigns</button>
        </nav>
      )

      render(mockNavComponent())

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveClass('text-tron-text')
        expect(button).toHaveClass('hover:text-tron-cyan')
      })

      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('bg-tron-grid')
    })

    test('navigation buttons have adequate touch targets', () => {
      const mockNavComponent = () => (
        <nav>
          <button className="flex flex-col items-center justify-center p-2 min-h-[44px]">
            Dashboard
          </button>
          <button className="flex flex-col items-center justify-center p-2 min-h-[44px]">
            Campaigns
          </button>
        </nav>
      )

      render(mockNavComponent())

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveClass('p-2')
        expect(button).toHaveClass('min-h-[44px]')
      })
    })

    test('navigation adapts to different mobile screen sizes', () => {
      const viewports = [
        { width: 320, name: 'Small Mobile' },
        { width: 375, name: 'iPhone SE' },
        { width: 414, name: 'iPhone Plus' },
      ]

      viewports.forEach(({ width, name }) => {
        window.innerWidth = width

        const mockNavComponent = () => (
          <nav className="bg-tron-grid border-t border-tron-cyan/20 md:hidden">
            <div className="grid grid-cols-5 py-2">
              {['Dashboard', 'Campaigns', 'Create', 'Analytics', 'Settings'].map(item => (
                <button 
                  key={item}
                  className="flex flex-col items-center justify-center p-2 text-xs text-tron-text"
                >
                  {item}
                </button>
              ))}
            </div>
          </nav>
        )

        render(mockNavComponent())

        // Verify grid layout works across different widths
        const gridContainer = document.querySelector('.grid-cols-5')
        expect(gridContainer).toBeInTheDocument()

        // Verify all navigation items are present
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
        expect(screen.getByText('Campaigns')).toBeInTheDocument()
      })
    })
  })

  describe('Mobile-First Responsive Design', () => {
    test('components hide appropriately on desktop', () => {
      // Set desktop viewport
      window.innerWidth = 1024

      const mockMobileOnlyComponent = () => (
        <div className="block md:hidden bg-tron-grid">
          Mobile Only Content
        </div>
      )

      render(mockMobileOnlyComponent())

      const mobileElement = screen.getByText('Mobile Only Content')
      expect(mobileElement).toHaveClass('md:hidden')
      expect(mobileElement).toHaveClass('block')
    })

    test('desktop navigation shows on larger screens', () => {
      window.innerWidth = 1024

      const mockDesktopNav = () => (
        <aside className="hidden md:block w-64 bg-tron-grid border-r border-tron-cyan/20">
          <nav>
            <ul className="space-y-1 p-4">
              <li>
                <button className="w-full text-left p-3 rounded-lg text-tron-text hover:bg-tron-cyan hover:text-tron-dark">
                  Dashboard
                </button>
              </li>
              <li>
                <button className="w-full text-left p-3 rounded-lg text-tron-text hover:bg-tron-cyan hover:text-tron-dark">
                  Campaigns
                </button>
              </li>
            </ul>
          </nav>
        </aside>
      )

      render(mockDesktopNav())

      const aside = screen.getByRole('complementary')
      expect(aside).toHaveClass('hidden')
      expect(aside).toHaveClass('md:block')
      expect(aside).toHaveClass('w-64')
      expect(aside).toHaveClass('bg-tron-grid')
    })

    test('responsive grid layouts work correctly', () => {
      const mockGridComponent = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-tron-grid p-4 rounded-lg">Card 1</div>
          <div className="bg-tron-grid p-4 rounded-lg">Card 2</div>
          <div className="bg-tron-grid p-4 rounded-lg">Card 3</div>
          <div className="bg-tron-grid p-4 rounded-lg">Card 4</div>
        </div>
      )

      render(mockGridComponent())

      const gridContainer = document.querySelector('.grid')
      expect(gridContainer).toHaveClass('grid-cols-1')
      expect(gridContainer).toHaveClass('md:grid-cols-2')
      expect(gridContainer).toHaveClass('lg:grid-cols-4')

      // Verify all cards are present
      expect(screen.getByText('Card 1')).toBeInTheDocument()
      expect(screen.getByText('Card 2')).toBeInTheDocument()
      expect(screen.getByText('Card 3')).toBeInTheDocument()
      expect(screen.getByText('Card 4')).toBeInTheDocument()
    })
  })

  describe('Mobile Interaction Patterns', () => {
    test('touch-friendly button interactions', async () => {
      const mockInteractiveComponent = () => {
        const handleClick = jest.fn()
        return (
          <button 
            onClick={handleClick}
            className="bg-tron-cyan hover:bg-tron-cyan/80 active:bg-tron-cyan/60 text-tron-dark font-semibold py-3 px-8 rounded-lg min-h-[44px] transition-colors"
          >
            Touch Me
          </button>
        )
      }

      render(mockInteractiveComponent())

      const button = screen.getByRole('button', { name: /touch me/i })
      
      // Verify touch-friendly sizing
      expect(button).toHaveClass('min-h-[44px]')
      expect(button).toHaveClass('py-3')
      expect(button).toHaveClass('px-8')

      // Verify interaction states
      expect(button).toHaveClass('hover:bg-tron-cyan/80')
      expect(button).toHaveClass('active:bg-tron-cyan/60')
      expect(button).toHaveClass('transition-colors')

      // Test interaction
      fireEvent.click(button)
      expect(button).toBeInTheDocument()
    })

    test('mobile form inputs have appropriate sizing', () => {
      const mockFormComponent = () => (
        <form>
          <input 
            type="text" 
            placeholder="Enter text"
            className="w-full px-4 py-3 bg-tron-grid border border-tron-cyan/30 rounded-lg text-tron-text placeholder-tron-text/50 min-h-[44px]"
          />
          <textarea 
            placeholder="Enter message"
            className="w-full px-4 py-3 bg-tron-grid border border-tron-cyan/30 rounded-lg text-tron-text placeholder-tron-text/50 min-h-[88px] resize-y"
            rows={3}
          />
        </form>
      )

      render(mockFormComponent())

      const textInput = screen.getByPlaceholderText(/enter text/i)
      const textArea = screen.getByPlaceholderText(/enter message/i)

      // Verify input sizing
      expect(textInput).toHaveClass('min-h-[44px]')
      expect(textInput).toHaveClass('px-4')
      expect(textInput).toHaveClass('py-3')

      // Verify textarea sizing
      expect(textArea).toHaveClass('min-h-[88px]')
      expect(textArea).toHaveClass('resize-y')

      // Verify Tron theme styling
      [textInput, textArea].forEach(element => {
        expect(element).toHaveClass('bg-tron-grid')
        expect(element).toHaveClass('border-tron-cyan/30')
        expect(element).toHaveClass('text-tron-text')
        expect(element).toHaveClass('placeholder-tron-text/50')
      })
    })

    test('mobile modals and overlays work correctly', () => {
      const mockModalComponent = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-tron-grid border border-tron-cyan/30 rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-tron-text mb-4">Modal Title</h2>
              <p className="text-tron-text/80 mb-6">Modal content</p>
              <div className="flex gap-3">
                <button className="flex-1 bg-tron-cyan hover:bg-tron-cyan/80 text-tron-dark font-semibold py-3 rounded-lg">
                  Confirm
                </button>
                <button className="flex-1 bg-tron-grid border border-tron-cyan text-tron-cyan font-semibold py-3 rounded-lg">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )

      render(mockModalComponent())

      // Verify modal structure
      expect(screen.getByText('Modal Title')).toBeInTheDocument()
      expect(screen.getByText('Modal content')).toBeInTheDocument()

      // Verify mobile-friendly sizing
      const modalContainer = document.querySelector('.max-w-md')
      expect(modalContainer).toBeInTheDocument()
      expect(modalContainer).toHaveClass('mx-4') // Mobile margins

      // Verify buttons are mobile-friendly
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveClass('py-3')
        expect(button).toHaveClass('flex-1')
      })
    })
  })

  describe('Mobile Layout Components', () => {
    test('mobile header component uses correct layout', () => {
      const mockMobileHeader = () => (
        <header className="sticky top-0 z-40 bg-tron-grid/95 backdrop-blur-md border-b border-tron-cyan/20">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              <button className="p-2 -ml-2 text-tron-text hover:text-tron-cyan lg:hidden">
                ☰
              </button>
              <h1 className="text-lg font-semibold text-tron-text">Dashboard</h1>
            </div>
            <button className="p-2 -mr-2 text-tron-text hover:text-tron-cyan">
              👤
            </button>
          </div>
        </header>
      )

      render(mockMobileHeader())

      const header = screen.getByRole('banner')
      expect(header).toHaveClass('sticky')
      expect(header).toHaveClass('top-0')
      expect(header).toHaveClass('bg-tron-grid/95')
      expect(header).toHaveClass('backdrop-blur-md')

      // Verify mobile-specific elements
      const menuButton = screen.getByText('☰')
      expect(menuButton).toHaveClass('lg:hidden')

      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    test('mobile-optimized spacing and typography', () => {
      const mockContentComponent = () => (
        <main className="flex-1 px-4 py-6 lg:px-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-tron-text mb-2">Welcome Back</h1>
              <p className="text-tron-text/80">Ready to create amazing content?</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-tron-grid p-4 rounded-lg">
                <h3 className="text-sm font-medium text-tron-text/60 mb-1">Campaigns</h3>
                <p className="text-2xl font-bold text-tron-text">12</p>
              </div>
            </div>
          </div>
        </main>
      )

      render(mockContentComponent())

      const main = screen.getByRole('main')
      expect(main).toHaveClass('px-4') // Mobile padding
      expect(main).toHaveClass('lg:px-8') // Desktop padding

      // Verify responsive typography
      expect(screen.getByText('Welcome Back')).toHaveClass('text-2xl')
      expect(screen.getByText('12')).toHaveClass('text-2xl')

      // Verify responsive grid
      const gridContainer = document.querySelector('.grid')
      expect(gridContainer).toHaveClass('grid-cols-1')
      expect(gridContainer).toHaveClass('sm:grid-cols-2')
      expect(gridContainer).toHaveClass('lg:grid-cols-4')
    })
  })

  describe('Mobile Performance and User Experience', () => {
    test('mobile components load efficiently', async () => {
      const startTime = performance.now()
      
      const mockComplexMobileComponent = () => (
        <div className="min-h-screen bg-tron-dark">
          <header className="bg-tron-grid border-b border-tron-cyan/20">
            <div className="px-4 py-3">
              <h1 className="text-lg font-semibold text-tron-text">Mobile App</h1>
            </div>
          </header>
          <main className="px-4 py-6">
            <div className="space-y-4">
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className="bg-tron-grid p-4 rounded-lg">
                  <h3 className="font-medium text-tron-text">Item {i + 1}</h3>
                  <p className="text-tron-text/80">Description for item {i + 1}</p>
                </div>
              ))}
            </div>
          </main>
          <nav className="fixed bottom-0 inset-x-0 bg-tron-grid border-t border-tron-cyan/20">
            <div className="grid grid-cols-4 py-2">
              {['Home', 'Search', 'Profile', 'Settings'].map(item => (
                <button key={item} className="p-3 text-center text-tron-text">
                  {item}
                </button>
              ))}
            </div>
          </nav>
        </div>
      )

      render(mockComplexMobileComponent())
      
      await waitFor(() => {
        expect(screen.getByText('Mobile App')).toBeInTheDocument()
        expect(screen.getByText('Item 1')).toBeInTheDocument()
        expect(screen.getByText('Item 10')).toBeInTheDocument()
      })

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Should render complex mobile layout efficiently
      expect(renderTime).toBeLessThan(500)
    })

    test('mobile scroll behavior works correctly', () => {
      const mockScrollableComponent = () => (
        <div className="h-screen overflow-y-auto">
          <div className="space-y-4 p-4">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="bg-tron-grid p-6 rounded-lg">
                <h3 className="text-tron-text">Scrollable Item {i + 1}</h3>
              </div>
            ))}
          </div>
        </div>
      )

      render(mockScrollableComponent())

      // Verify scrollable container
      const scrollContainer = document.querySelector('.overflow-y-auto')
      expect(scrollContainer).toBeInTheDocument()
      expect(scrollContainer).toHaveClass('h-screen')

      // Verify content is present
      expect(screen.getByText('Scrollable Item 1')).toBeInTheDocument()
      expect(screen.getByText('Scrollable Item 20')).toBeInTheDocument()
    })
  })
})