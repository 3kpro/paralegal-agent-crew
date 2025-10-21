'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface OnboardingStep {
  title: string
  description: string
  targetStep?: number
  position?: 'top' | 'center' | 'bottom'
}

const onboardingSteps: OnboardingStep[] = [
  {
    title: '🚀 Welcome to Content Cascade AI',
    description: 'Let\'s create your first viral campaign in 4 simple steps. This will only take 2 minutes!',
    position: 'center'
  },
  {
    title: '✨ Step 1: Name Your Campaign',
    description: 'Give your campaign a memorable name and select which platforms you want to target.',
    targetStep: 1,
    position: 'top'
  },
  {
    title: '🔥 Step 2: Find Trending Topics',
    description: 'Search for trending topics in your niche. We\'ll show you what\'s hot right now!',
    targetStep: 2,
    position: 'top'
  },
  {
    title: '🤖 Step 3: Generate AI Content',
    description: 'Watch as AI creates platform-specific content optimized for engagement.',
    targetStep: 3,
    position: 'top'
  },
  {
    title: '📋 Step 4: Review & Save',
    description: 'Review your content and save it as a campaign. Copy-paste to your platforms and go viral!',
    targetStep: 4,
    position: 'top'
  }
]

interface OnboardingTourProps {
  currentStep: number
  onComplete: () => void
}

export default function OnboardingTour({ currentStep, onComplete }: OnboardingTourProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentTourStep, setCurrentTourStep] = useState(0)
  const [hasSeenTour, setHasSeenTour] = useState(false)

  useEffect(() => {
    // Check if user has seen the tour
    const tourCompleted = localStorage.getItem('ccai_tour_completed')
    if (tourCompleted) {
      setHasSeenTour(true)
      return
    }

    // Show welcome message after short delay
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Auto-advance tour based on user progress
    if (hasSeenTour || !isVisible) return

    const stepData = onboardingSteps[currentTourStep]
    if (stepData.targetStep && currentStep > stepData.targetStep) {
      handleNext()
    }
  }, [currentStep, currentTourStep, hasSeenTour, isVisible])

  const handleNext = () => {
    if (currentTourStep < onboardingSteps.length - 1) {
      setCurrentTourStep(prev => prev + 1)
    } else {
      completeTour()
    }
  }

  const handleSkip = () => {
    completeTour()
  }

  const completeTour = () => {
    setIsVisible(false)
    localStorage.setItem('ccai_tour_completed', 'true')
    setHasSeenTour(true)
    onComplete()
  }

  if (hasSeenTour || !isVisible) return null

  const currentStepData = onboardingSteps[currentTourStep]
  const isWelcome = currentTourStep === 0

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleSkip}
          />

          {/* Tour Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className={`fixed z-50 ${
              currentStepData.position === 'center'
                ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                : 'top-24 left-1/2 -translate-x-1/2'
            } ${isWelcome ? 'w-[90%] max-w-2xl' : 'w-[90%] max-w-lg'}`}
          >
            <div className="bg-gradient-to-br from-tron-grid to-tron-dark border-2 border-tron-cyan rounded-2xl p-8 shadow-2xl shadow-tron-cyan/20">
              {/* Progress Indicator */}
              {!isWelcome && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-tron-text-muted">
                      Step {currentTourStep} of {onboardingSteps.length - 1}
                    </span>
                    <span className="text-xs text-tron-cyan">
                      {Math.round((currentTourStep / (onboardingSteps.length - 1)) * 100)}%
                    </span>
                  </div>
                  <div className="h-1 bg-tron-dark rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-tron-cyan to-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentTourStep / (onboardingSteps.length - 1)) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="text-center mb-8">
                <motion.h2
                  key={currentStepData.title}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`${isWelcome ? 'text-3xl' : 'text-2xl'} font-bold text-tron-text mb-4`}
                >
                  {currentStepData.title}
                </motion.h2>
                <motion.p
                  key={currentStepData.description}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className={`${isWelcome ? 'text-lg' : 'text-base'} text-tron-text-muted leading-relaxed`}
                >
                  {currentStepData.description}
                </motion.p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                {isWelcome ? (
                  <>
                    <button
                      onClick={handleNext}
                      className="px-8 py-3 bg-gradient-to-r from-tron-cyan to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-tron-cyan/30 transition-all"
                    >
                      Let's Get Started! 🚀
                    </button>
                    <button
                      onClick={handleSkip}
                      className="px-8 py-3 bg-tron-grid border border-tron-cyan/30 text-tron-text-muted hover:text-tron-text font-semibold rounded-lg transition-colors"
                    >
                      Skip Tour
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleNext}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-tron-cyan to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-tron-cyan/30 transition-all"
                    >
                      {currentTourStep < onboardingSteps.length - 1 ? 'Next' : 'Finish Tour'} →
                    </button>
                    <button
                      onClick={handleSkip}
                      className="px-6 py-3 bg-tron-grid border border-tron-cyan/30 text-tron-text-muted hover:text-tron-text font-semibold rounded-lg transition-colors"
                    >
                      Skip
                    </button>
                  </>
                )}
              </div>

              {/* Fun Animation Elements */}
              {isWelcome && (
                <div className="absolute -top-4 -right-4 w-20 h-20">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="text-6xl"
                  >
                    ✨
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
