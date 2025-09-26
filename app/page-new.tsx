'use client'

import { useState } from 'react'
import { Navigation } from '../components/Navigation'
import { HeroSection } from '../components/sections/HeroSection'
import { StatsSection } from '../components/sections/StatsSection'
import { ServicesGrid } from '../components/sections/ServicesGrid'
import { PricingSection } from '../components/sections/PricingSection'
import { CTASection } from '../components/sections/CTASection'
import { ContactSection } from '../components/sections/ContactSection'
import { Footer } from '../components/Footer'
import { DemoModal } from '../components/modals/DemoModal'
import { TrialModal } from '../components/modals/TrialModal'
import { scrollToContact } from '../utils/scroll'

export default function HomePage() {
  const [showDemoModal, setShowDemoModal] = useState(false)
  const [showTrialModal, setShowTrialModal] = useState(false)

  const handleContactClick = () => {
    scrollToContact()
  }

  const handleDemoClick = () => {
    setShowDemoModal(true)
  }

  const handleTrialClick = () => {
    setShowTrialModal(true)
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation onContactClick={handleContactClick} />

      <HeroSection
        onDemoClick={handleDemoClick}
        onTrialClick={handleTrialClick}
      />

      <StatsSection />

      <ServicesGrid />

      <PricingSection onContactClick={handleContactClick} />

      <CTASection
        onContactClick={handleContactClick}
        onDemoClick={handleDemoClick}
      />

      <ContactSection />

      <Footer />

      <DemoModal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
      />

      <TrialModal
        isOpen={showTrialModal}
        onClose={() => setShowTrialModal(false)}
        onContactClick={handleContactClick}
      />
    </div>
  )
}
