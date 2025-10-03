'use client'

// Force rebuild - Content Cascade AI Landing Page
import { 
  ModernHero, 
  ModernFeatures, 
  DemoVideoSection,
  TestimonialsSection,
  ModernPricing,
  FAQSection,
  WaitlistSection
} from '../components/sections'
import { Navigation, Footer, ContactSection } from '../components'
import { scrollToContact } from '../utils/scroll'

export default function HomePage() {
  const handleContactClick = () => {
    scrollToContact()
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation onContactClick={handleContactClick} />

      <ModernHero />

      <DemoVideoSection />

      <ModernFeatures />

      <TestimonialsSection />

      <ModernPricing />

      <FAQSection />

      <WaitlistSection />

      <ContactSection />

      <Footer />
    </div>
  )
}
