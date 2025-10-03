'use client'

import { ModernHero, ModernFeatures, ModernPricing } from '../components/sections'
import { Navigation, Footer, ContactSection } from '../components'

export default function ModernLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation onContactClick={() => {}} />

      <ModernHero />

      <ModernFeatures />

      <ModernPricing />

      <ContactSection />

      <Footer />
    </div>
  )
}
