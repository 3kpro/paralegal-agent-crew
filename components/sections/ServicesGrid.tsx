import { Card } from '../ui/Card'

interface ServiceItem {
  icon: string
  title: string
  description: string
}

const services: ServiceItem[] = [
  {
    icon: '▶',
    title: 'Professional UGC Videos',
    description: 'AI-generated user-generated-style videos with consistent characters and professional quality.'
  },
  {
    icon: '📊',
    title: 'Social Media Posts',
    description: 'Platform-optimized content for Twitter, LinkedIn, Instagram, and Facebook with proper formatting.'
  },
  {
    icon: '⏰',
    title: 'Email Campaigns',
    description: 'Complete email sequences with subject lines, preview text, and engaging body content.'
  },
  {
    icon: '📈',
    title: 'SEO Content',
    description: 'Search-optimized blog posts, FAQ sections, and meta descriptions for better visibility.'
  },
  {
    icon: '👥',
    title: 'Brand Consistency',
    description: 'All content maintains your unique brand voice and messaging across every channel.'
  },
  {
    icon: '⭐',
    title: 'Campaign Analytics',
    description: 'Track performance across all channels and optimize future campaigns for better results.'
  }
]

export const ServicesGrid: React.FC = () => {
  return (
    <section id="services" className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            One Upload. Complete Campaign.
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload any content and watch our AI transform it into a coherent,
            multi-channel campaign that maintains your brand voice across all platforms.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-blue-600 text-2xl">{service.icon}</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {service.title}
              </h3>
              <p className="text-gray-600">{service.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
