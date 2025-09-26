import { Button } from './ui/Button'

interface NavigationProps {
  onContactClick: () => void
}

export const Navigation: React.FC<NavigationProps> = ({ onContactClick }) => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">3K</span>
            </div>
            <span className="text-xl font-bold text-gray-800">3K Pro Services</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('services')}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              About
            </button>
            <Button
              onClick={onContactClick}
              variant="primary"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
