'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Steps } from '@/components/ui/steps'
import { ContentEditor } from './ContentEditor'
import { StyleCustomizer } from './StyleCustomizer'
import { PublishSettings } from './PublishSettings'

const steps = [
  { id: 'content', title: 'Create Content' },
  { id: 'style', title: 'Customize Style' },
  { id: 'publish', title: 'Publish' }
]

export function CampaignWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [campaignData, setCampaignData] = useState({
    content: '',
    style: {
      theme: 'default',
      music: null,
      effects: []
    },
    publishSettings: {
      platforms: [],
      schedule: null
    }
  })

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const updateCampaignData = (section: keyof typeof campaignData, data: any) => {
    setCampaignData(prev => ({
      ...prev,
      [section]: data
    }))
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Steps 
        steps={steps} 
        currentStep={currentStep} 
        onStepClick={setCurrentStep}
      />

      <div className="mt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {currentStep === 0 && (
              <ContentEditor
                content={campaignData.content}
                onChange={(content) => updateCampaignData('content', content)}
                onNext={handleNext}
              />
            )}

            {currentStep === 1 && (
              <StyleCustomizer
                style={campaignData.style}
                onChange={(style) => updateCampaignData('style', style)}
                onBack={handleBack}
                onNext={handleNext}
              />
            )}

            {currentStep === 2 && (
              <PublishSettings
                settings={campaignData.publishSettings}
                onChange={(settings) => updateCampaignData('publishSettings', settings)}
                onBack={handleBack}
                campaignData={campaignData}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}