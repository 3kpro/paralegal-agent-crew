'use client'

import { ModernHero, ModernFeatures, ModernPricing, ServicesGrid, FAQSection, TestimonialsSection, WaitlistSection } from '../components/sections'
import { Navigation, Footer, ContactSection } from '../components'
import { useState } from 'react'

export default function ModernLandingPage() {
  const [showContactModal, setShowContactModal] = useState(false)

  const handleContactClick = () => {
    const contactElement = document.getElementById('contact')
    if (contactElement) {
      contactElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen">
      <Navigation onContactClick={handleContactClick} />

      <ModernHero />

      <ModernFeatures />

      <ServicesGrid />

      <ModernPricing />

      <TestimonialsSection />

      <FAQSection />

      <WaitlistSection />

      <ContactSection />

      <Footer />
    </div>
  )
}
