import { Button } from '../ui/Button'

interface CTASectionProps {
  onContactClick: () => void
  onDemoClick: () => void
}

export const CTASection: React.FC<CTASectionProps> = ({
  onContactClick,
  onDemoClick
}) => {
  return (
    <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-800 to-gray-900 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6">
          Ready to Transform Your Content Marketing?
        </h2>
        <p className="text-xl text-gray-300 mb-8">
          Join hundreds of businesses already using AI to create better content faster.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onContactClick}
            variant="primary"
            size="lg"
          >
            Start Your Free Trial
          </Button>
          <Button
            onClick={onDemoClick}
            variant="outline"
            size="lg"
          >
            Schedule a Demo
          </Button>
        </div>
      </div>
    </section>
  )
}
