'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface WelcomeMessage {
  text: string
  subtext?: string
  duration?: number
}

const welcomeMessages: WelcomeMessage[] = [
  {
    text: "Tired of staring at blank screens?",
    subtext: "Welcome to TrendPulse. We fixed that.",
    duration: 3500
  },
  {
    text: "Here's the secret:",
    subtext: "Trends are just conversations you're late to... until now",
    duration: 3500
  },
  {
    text: "We find what's hot.",
    subtext: "AI writes the content. You take the credit.",
    duration: 3500
  },
  {
    text: "While they're still brainstorming,",
    subtext: "you're already posting. That's the edge.",
    duration: 3500
  },
  {
    text: "Ready to move at internet speed?",
    subtext: "Let's build your first campaign",
    duration: 4500
  }
]

export default function WelcomeAnimation() {
  const router = useRouter()
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false)

  useEffect(() => {
    // Check if user has seen the welcome animation
    const welcomeCompleted = localStorage.getItem('ccai_welcome_completed')
    if (welcomeCompleted) {
      setHasSeenWelcome(true)
      setIsComplete(true)
      return
    }
  }, [])

  useEffect(() => {
    if (hasSeenWelcome || isComplete) return

    const currentMessage = welcomeMessages[currentMessageIndex]
    const duration = currentMessage.duration || 2500

    const timer = setTimeout(() => {
      if (currentMessageIndex < welcomeMessages.length - 1) {
        setCurrentMessageIndex(prev => prev + 1)
      }
    }, duration)

    return () => clearTimeout(timer)
  }, [currentMessageIndex, hasSeenWelcome, isComplete])

  const handleContinue = () => {
    localStorage.setItem('ccai_welcome_completed', 'true')
    setIsComplete(true)
    router.push('/campaigns/new')
  }

  const handleSkip = () => {
    localStorage.setItem('ccai_welcome_completed', 'true')
    setIsComplete(true)
  }

  if (hasSeenWelcome || isComplete) return null

  const currentMessage = welcomeMessages[currentMessageIndex]
  const isLastMessage = currentMessageIndex === welcomeMessages.length - 1

  // Smooth ease-out cubic
  const easing = [0.16, 1, 0.3, 1] as [number, number, number, number]

  return (
    <div className="fixed inset-0 z-50 bg-tron-dark flex items-center justify-center">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute top-8 right-8 text-tron-text-muted hover:text-tron-cyan transition-colors text-sm"
      >
        Skip →
      </button>

      {/* Message container */}
      <div className="relative max-w-4xl mx-auto px-8 text-center">
        <AnimatePresence mode="wait">
          <div key={currentMessageIndex} className="space-y-4">
            {/* Main text - white fades in first */}
            <motion.h1
              className="text-5xl md:text-7xl font-bold text-white tracking-tight"
              initial={{
                opacity: 0
              }}
              animate={{
                opacity: 1
              }}
              exit={{
                opacity: 0
              }}
              transition={{
                duration: 1.0,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              {currentMessage.text}
            </motion.h1>

            {/* Subtext - blue fades in slightly after white */}
            {currentMessage.subtext && (
              <motion.p
                className="text-xl md:text-2xl text-tron-cyan font-light"
                initial={{
                  opacity: 0
                }}
                animate={{
                  opacity: 1
                }}
                exit={{
                  opacity: 0
                }}
                transition={{
                  duration: 1.0,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  delay: 0.8 // Blue text comes in later so white message sinks in first
                }}
              >
                {currentMessage.subtext}
              </motion.p>
            )}

            {/* Continue button (only on last message) */}
            {isLastMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="pt-8"
              >
                <button
                  onClick={handleContinue}
                  className="group relative px-12 py-4 bg-gradient-to-r from-tron-cyan to-blue-500 text-white text-lg font-semibold rounded-lg overflow-hidden transition-all hover:shadow-2xl hover:shadow-tron-cyan/40 hover:scale-105"
                >
                  <span className="relative z-10">Continue →</span>
                  <motion.div
                    className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20"
                    initial={false}
                    whileHover={{ opacity: 0.2 }}
                    transition={{ duration: 0.3 }}
                  />
                </button>
              </motion.div>
            )}
          </div>
        </AnimatePresence>

        {/* Progress dots */}
        <motion.div
          className="flex justify-center gap-2 mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {welcomeMessages.map((_, index) => (
            <motion.div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index === currentMessageIndex
                  ? 'w-8 bg-tron-cyan'
                  : index < currentMessageIndex
                  ? 'w-1.5 bg-tron-cyan/50'
                  : 'w-1.5 bg-tron-grid'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
            />
          ))}
        </motion.div>
      </div>

      {/* Decorative elements */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-tron-cyan/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />
    </div>
  )
}
