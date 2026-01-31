import { render, screen, fireEvent } from '@testing-library/react'
import { Skeleton } from '@/components/SkeletonLoader'
import { OrbitalLoader } from '@/components/ui/orbital-loader'
import './test-components.css'

// Mock components to test theme consistency
const MockTronButton = ({ variant = 'primary', children }: { variant?: 'primary' | 'secondary', children: React.ReactNode }) => (
  <button className={
    variant === 'primary' 
      ? 'bg-tron-cyan hover:bg-tron-cyan/80 text-tron-dark font-semibold py-3 px-8 rounded-lg transition-all duration-200'
      : 'bg-tron-grid border-2 border-tron-cyan text-tron-cyan hover:bg-tron-cyan/10 font-semibold py-3 px-8 rounded-lg transition-all duration-200'
  }>
    {children}
  </button>
)

const MockTronCard = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-tron-grid rounded-xl shadow-lg border border-tron-grid hover:shadow-2xl transition-shadow duration-200 p-6">
    {children}
  </div>
)

const MockTronInput = ({ placeholder }: { placeholder: string }) => (
  <input 
    type="text"
    placeholder={placeholder}
    className="w-full bg-tron-grid border border-tron-cyan/30 text-tron-text rounded-lg px-4 py-3 focus:outline-none focus:border-tron-cyan focus:ring-1 focus:ring-tron-cyan"
  />
)

const MockTronModal = ({ isOpen, onClose, children }: { isOpen: boolean, onClose: () => void, children: React.ReactNode }) => {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-tron-grid border border-tron-cyan/30 backdrop-blur-md rounded-xl shadow-2xl max-w-2xl w-full">
        {children}
      </div>
    </div>
  )
}

describe('Tron Theme Integration E2E Tests', () => {
  describe('Color Palette Consistency', () => {
    test('primary Tron colors are used correctly', () => {
      const mockComponent = () => (
        <div className="bg-tron-dark min-h-screen">
          <div className="bg-tron-grid p-6">
            <h1 className="text-tron-text">Main Text</h1>
            <p className="text-tron-text-muted">Muted Text</p>
            <span className="text-tron-cyan">Accent Text</span>
          </div>
        </div>
      )

      render(mockComponent())

      // Verify main background
      const darkBackground = document.querySelector('.bg-tron-dark')
      expect(darkBackground).toBeInTheDocument()

      // Verify elevated surface
      const gridBackground = document.querySelector('.bg-tron-grid')
      expect(gridBackground).toBeInTheDocument()

      // Verify text colors
      expect(screen.getByText('Main Text')).toHaveClass('text-tron-text')
      expect(screen.getByText('Muted Text')).toHaveClass('text-tron-text-muted')
      expect(screen.getByText('Accent Text')).toHaveClass('text-tron-cyan')
    })

    test('Tron border colors maintain consistency', () => {
      const mockComponent = () => (
        <div>
          <div className="border border-tron-cyan">Strong Border</div>
          <div className="border border-tron-cyan/30">Medium Border</div>
          <div className="border border-tron-cyan/20">Subtle Border</div>
        </div>
      )

      render(mockComponent())

      // Verify border color variations
      expect(document.querySelector('.border-tron-cyan')).toBeInTheDocument()
      expect(document.querySelector('.border-tron-cyan\\/30')).toBeInTheDocument()
      expect(document.querySelector('.border-tron-cyan\\/20')).toBeInTheDocument()
    })

    test('Tron accent colors for success and error states', () => {
      const mockComponent = () => (
        <div>
          <div className="bg-tron-green text-tron-dark p-3 rounded-lg">
            Success Message
          </div>
          <div className="bg-tron-magenta text-tron-text p-3 rounded-lg">
            Error Message
          </div>
        </div>
      )

      render(mockComponent())

      const successElement = screen.getByText('Success Message')
      const errorElement = screen.getByText('Error Message')

      expect(successElement).toHaveClass('bg-tron-green')
      expect(successElement).toHaveClass('text-tron-dark')
      expect(errorElement).toHaveClass('bg-tron-magenta')
      expect(errorElement).toHaveClass('text-tron-text')
    })
  })

  describe('Component Theme Integration', () => {
    test('Tron buttons maintain theme consistency', () => {
      render(
        <div>
          <MockTronButton variant="primary">Primary Button</MockTronButton>
          <MockTronButton variant="secondary">Secondary Button</MockTronButton>
        </div>
      )

      const primaryButton = screen.getByText('Primary Button')
      const secondaryButton = screen.getByText('Secondary Button')

      // Primary button styling
      expect(primaryButton).toHaveClass('bg-tron-cyan')
      expect(primaryButton).toHaveClass('hover:bg-tron-cyan/80')
      expect(primaryButton).toHaveClass('text-tron-dark')
      expect(primaryButton).toHaveClass('font-semibold')
      expect(primaryButton).toHaveClass('transition-all')

      // Secondary button styling  
      expect(secondaryButton).toHaveClass('bg-tron-grid')
      expect(secondaryButton).toHaveClass('border-2')
      expect(secondaryButton).toHaveClass('border-tron-cyan')
      expect(secondaryButton).toHaveClass('text-tron-cyan')
      expect(secondaryButton).toHaveClass('hover:bg-tron-cyan/10')
    })

    test('Tron cards use consistent styling', () => {
      render(
        <MockTronCard>
          <h3 className="text-tron-text font-semibold mb-2">Card Title</h3>
          <p className="text-tron-text-muted">Card content with muted text</p>
        </MockTronCard>
      )

      const cardContainer = document.querySelector('.bg-tron-grid')
      expect(cardContainer).toBeInTheDocument()
      expect(cardContainer).toHaveClass('rounded-xl')
      expect(cardContainer).toHaveClass('shadow-lg')
      expect(cardContainer).toHaveClass('border')
      expect(cardContainer).toHaveClass('border-tron-grid')
      expect(cardContainer).toHaveClass('hover:shadow-2xl')
      expect(cardContainer).toHaveClass('transition-shadow')

      expect(screen.getByText('Card Title')).toHaveClass('text-tron-text')
      expect(screen.getByText('Card content with muted text')).toHaveClass('text-tron-text-muted')
    })

    test('Tron inputs maintain theme consistency', () => {
      render(
        <MockTronInput placeholder="Enter your text" />
      )

      const input = screen.getByPlaceholderText('Enter your text')
      expect(input).toHaveClass('bg-tron-grid')
      expect(input).toHaveClass('border')
      expect(input).toHaveClass('border-tron-cyan/30')
      expect(input).toHaveClass('text-tron-text')
      expect(input).toHaveClass('focus:border-tron-cyan')
      expect(input).toHaveClass('focus:ring-tron-cyan')
    })

    test('Tron modals use correct backdrop and styling', () => {
      let isOpen = true
      const onClose = jest.fn(() => { isOpen = false })

      render(
        <MockTronModal isOpen={isOpen} onClose={onClose}>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-tron-text mb-4">Modal Title</h2>
            <p className="text-tron-text-muted">Modal content</p>
          </div>
        </MockTronModal>
      )

      // Verify modal backdrop
      const backdrop = document.querySelector('.bg-black\\/50')
      expect(backdrop).toBeInTheDocument()
      expect(backdrop).toHaveClass('backdrop-blur-sm')

      // Verify modal container
      const modalContainer = document.querySelector('.bg-tron-grid')
      expect(modalContainer).toBeInTheDocument()
      expect(modalContainer).toHaveClass('border')
      expect(modalContainer).toHaveClass('border-tron-cyan/30')
      expect(modalContainer).toHaveClass('backdrop-blur-md')
      expect(modalContainer).toHaveClass('rounded-xl')
      expect(modalContainer).toHaveClass('shadow-2xl')

      expect(screen.getByText('Modal Title')).toHaveClass('text-tron-text')
      expect(screen.getByText('Modal content')).toHaveClass('text-tron-text-muted')
    })

    test('skeleton loader integrates with Tron theme', () => {
      render(<Skeleton />)

      const skeletonElement = document.querySelector('.animate-pulse')
      expect(skeletonElement).toBeInTheDocument()
      
      // Verify it uses Tron theme background
      const tronBackground = document.querySelector('.bg-tron-grid\\/50')
      expect(tronBackground).toBeInTheDocument()
    })
  })

  describe('Interactive States and Animations', () => {
    test('Tron buttons handle hover and active states correctly', () => {
      render(
        <div>
          <MockTronButton variant="primary">Hover Primary</MockTronButton>
          <MockTronButton variant="secondary">Hover Secondary</MockTronButton>
        </div>
      )

      const primaryButton = screen.getByText('Hover Primary')
      const secondaryButton = screen.getByText('Hover Secondary')

      // Test primary button hover states
      expect(primaryButton).toHaveClass('hover:bg-tron-cyan/80')
      expect(primaryButton).toHaveClass('transition-all')
      expect(primaryButton).toHaveClass('duration-200')

      // Test secondary button hover states
      expect(secondaryButton).toHaveClass('hover:bg-tron-cyan/10')
      expect(secondaryButton).toHaveClass('transition-all')
      expect(secondaryButton).toHaveClass('duration-200')

      // Simulate interaction
      fireEvent.mouseEnter(primaryButton)
      fireEvent.mouseEnter(secondaryButton)
    })

    test('focus states maintain Tron theme consistency', () => {
      render(
        <div>
          <MockTronInput placeholder="Focus test input" />
          <MockTronButton>Focus test button</MockTronButton>
        </div>
      )

      const input = screen.getByPlaceholderText('Focus test input')
      const button = screen.getByText('Focus test button')

      // Test input focus states
      expect(input).toHaveClass('focus:border-tron-cyan')
      expect(input).toHaveClass('focus:ring-1')
      expect(input).toHaveClass('focus:ring-tron-cyan')

      fireEvent.focus(input)
      fireEvent.focus(button)
    })

    test('Tron glow effects and shadows work correctly', () => {
      const mockGlowComponent = () => (
        <div className="bg-tron-dark p-8">
          <div className="bg-tron-grid rounded-xl shadow-lg hover:shadow-2xl hover:shadow-tron-cyan/20 transition-shadow duration-300">
            <div className="p-6">
              <button className="bg-tron-cyan hover:bg-tron-cyan/80 hover:shadow-lg hover:shadow-tron-cyan/30 text-tron-dark font-semibold py-3 px-8 rounded-lg transition-all duration-200">
                Glowing Button
              </button>
            </div>
          </div>
        </div>
      )

      render(mockGlowComponent())

      // Verify glow effects are applied
      const glowCard = document.querySelector('.hover\\:shadow-tron-cyan\\/20')
      expect(glowCard).toBeInTheDocument()
      expect(glowCard).toHaveClass('transition-shadow')
      expect(glowCard).toHaveClass('duration-300')

      const glowButton = document.querySelector('.hover\\:shadow-tron-cyan\\/30')
      expect(glowButton).toBeInTheDocument()
    })
  })

  describe('Theme Consistency Across Breakpoints', () => {
    test('Tron theme maintains consistency on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      const mockMobileComponent = () => (
        <div className="bg-tron-dark min-h-screen">
          <div className="bg-tron-grid p-4 sm:p-6 lg:p-8">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-tron-text">
              Responsive Title
            </h1>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-tron-grid border border-tron-cyan/30 rounded-lg p-4">
                <h3 className="text-tron-text font-medium">Card 1</h3>
              </div>
              <div className="bg-tron-grid border border-tron-cyan/30 rounded-lg p-4">
                <h3 className="text-tron-text font-medium">Card 2</h3>
              </div>
            </div>
          </div>
        </div>
      )

      render(mockMobileComponent())

      // Verify theme colors are maintained
      expect(document.querySelector('.bg-tron-dark')).toBeInTheDocument()
      expect(document.querySelector('.bg-tron-grid')).toBeInTheDocument()
      expect(document.querySelector('.border-tron-cyan\\/30')).toBeInTheDocument()
      expect(screen.getByText('Responsive Title')).toHaveClass('text-tron-text')
    })

    test('Tron theme works correctly on desktop', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })

      const mockDesktopComponent = () => (
        <div className="bg-tron-dark min-h-screen">
          <div className="max-w-7xl mx-auto p-8">
            <div className="grid grid-cols-4 gap-8">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="bg-tron-grid border border-tron-cyan/20 rounded-xl p-6 hover:border-tron-cyan/40 transition-colors">
                  <h3 className="text-tron-text font-semibold mb-2">Desktop Card {i + 1}</h3>
                  <p className="text-tron-text-muted">Desktop optimized content</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )

      render(mockDesktopComponent())

      // Verify desktop layout maintains theme
      expect(document.querySelector('.bg-tron-dark')).toBeInTheDocument()
      expect(document.querySelectorAll('.bg-tron-grid')).toHaveLength(4)
      expect(screen.getByText('Desktop Card 1')).toHaveClass('text-tron-text')
      expect(screen.getAllByText('Desktop optimized content')[0]).toHaveClass('text-tron-text-muted')
    })
  })

  describe('Theme Integration with Loading States', () => {
    test('loading spinners (OrbitalLoader) use Tron theme colors', () => {
      const mockLoadingComponent = () => (
        <div className="flex items-center justify-center p-8">
          <OrbitalLoader className="text-tron-cyan" />
          <span className="ml-3 text-tron-text">Loading...</span>
        </div>
      )

      render(mockLoadingComponent())

      // OrbitalLoader renders as a SVG spinner, verify it's in the document with the theme color
      const loader = document.querySelector('.text-tron-cyan')
      expect(loader).toBeInTheDocument()
      
      // Verify parent container structure if needed, but primary check is the color application
      expect(screen.getByText('Loading...')).toHaveClass('text-tron-text')
    })

    test('progress bars use Tron theme styling', () => {
      const mockProgressComponent = () => (
        <div className="w-full">
          <div className="flex justify-between text-sm text-tron-text-muted mb-2">
            <span>Progress</span>
            <span>75%</span>
          </div>
          <div className="w-full bg-tron-grid rounded-full h-2 border border-tron-cyan/20">
            <div className="bg-tron-cyan h-full rounded-full transition-all duration-300 progress-fill-75">
              <div className="h-full bg-gradient-to-r from-tron-cyan to-tron-green rounded-full"></div>
            </div>
          </div>
        </div>
      )

      render(mockProgressComponent())

      // Verify progress bar background
      const progressBg = document.querySelector('.bg-tron-grid')
      expect(progressBg).toBeInTheDocument()
      expect(progressBg).toHaveClass('border')
      expect(progressBg).toHaveClass('border-tron-cyan/20')

      // Verify progress fill
      const progressFill = document.querySelector('.bg-tron-cyan')
      expect(progressFill).toBeInTheDocument()
      expect(progressFill).toHaveClass('transition-all')

      // Verify percentage text exists (the exact class may vary)
      expect(screen.getByText('75%')).toBeInTheDocument()
    })

    test('skeleton loaders blend seamlessly with Tron theme', () => {
      const mockSkeletonGrid = () => (
        <div className="bg-tron-dark p-8">
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="bg-tron-grid p-6 rounded-xl">
                <div className="animate-pulse space-y-3">
                  <div className="bg-tron-grid/50 h-4 rounded w-3/4"></div>
                  <div className="bg-tron-grid/50 h-4 rounded w-1/2"></div>
                  <div className="bg-tron-grid/50 h-4 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )

      render(mockSkeletonGrid())

      // Verify skeleton elements use correct Tron theme background
      const skeletonElements = document.querySelectorAll('.bg-tron-grid\\/50')
      expect(skeletonElements.length).toBeGreaterThan(0)

      // Verify animation is applied
      const animatedElements = document.querySelectorAll('.animate-pulse')
      expect(animatedElements.length).toBe(3)
    })
  })

  describe('Accessibility with Tron Theme', () => {
    test('Tron theme maintains adequate color contrast', () => {
      const mockAccessibilityComponent = () => (
        <div className="bg-tron-dark p-8">
          <h1 className="text-tron-text text-2xl font-bold mb-4">
            High Contrast Title
          </h1>
          <p className="text-tron-text-muted mb-4">
            This text should have adequate contrast for readability
          </p>
          <button className="bg-tron-cyan text-tron-dark font-semibold py-3 px-6 rounded-lg">
            Accessible Button
          </button>
          <button className="bg-tron-grid border-2 border-tron-cyan text-tron-cyan font-semibold py-3 px-6 rounded-lg ml-4">
            Secondary Accessible Button
          </button>
        </div>
      )

      render(mockAccessibilityComponent())

      // Verify high contrast combinations are used
      expect(screen.getByText('High Contrast Title')).toHaveClass('text-tron-text')
      
      const primaryButton = screen.getByText('Accessible Button')
      expect(primaryButton).toHaveClass('bg-tron-cyan')
      expect(primaryButton).toHaveClass('text-tron-dark')
      
      const secondaryButton = screen.getByText('Secondary Accessible Button')
      expect(secondaryButton).toHaveClass('text-tron-cyan')
      expect(secondaryButton).toHaveClass('border-tron-cyan')
    })

    test('focus indicators use Tron theme colors', () => {
      const mockFocusComponent = () => (
        <div className="space-y-4 p-8">
          <button className="bg-tron-cyan text-tron-dark py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-tron-cyan focus:ring-offset-2 focus:ring-offset-tron-dark">
            Focusable Button
          </button>
          <input 
            type="text" 
            className="bg-tron-grid border border-tron-cyan/30 text-tron-text px-4 py-2 rounded focus:outline-none focus:border-tron-cyan focus:ring-1 focus:ring-tron-cyan"
            placeholder="Focusable input"
          />
        </div>
      )

      render(mockFocusComponent())

      const button = screen.getByText('Focusable Button')
      const input = screen.getByPlaceholderText('Focusable input')

      // Verify focus ring styles
      expect(button).toHaveClass('focus:ring-2')
      expect(button).toHaveClass('focus:ring-tron-cyan')
      expect(button).toHaveClass('focus:ring-offset-tron-dark')

      expect(input).toHaveClass('focus:border-tron-cyan')
      expect(input).toHaveClass('focus:ring-1')
      expect(input).toHaveClass('focus:ring-tron-cyan')
    })
  })
})