"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GuideStep {
  title: string;
  description: string;
  tip?: string;
  targetStep: number;
}

const guideSteps: GuideStep[] = [
  {
    title: "Campaign Basics",
    description:
      "Give your campaign a memorable name and select the platforms you want to target.",
    tip: "Pro tip: Start with 2-3 platforms for better focus",
    targetStep: 1,
  },
  {
    title: "Find Your Trend",
    description:
      "Search for trending topics in your niche. We'll show you real-time data to help you ride the wave.",
    tip: "Look for trends with high volume but moderate competition",
    targetStep: 2,
  },
  {
    title: "AI Content Generation",
    description:
      "Select your AI provider and watch as platform-optimized content is generated automatically.",
    tip: "Each platform gets custom-tailored content with hashtags",
    targetStep: 3,
  },
  {
    title: "Review & Launch",
    description:
      "Review your generated content, make any tweaks, and save your campaign.",
    tip: "Copy content directly to your platforms and watch engagement soar",
    targetStep: 4,
  },
];

interface SidebarGuideProps {
  currentStep: number;
  onDismiss?: () => void;
}

export default function SidebarGuide({
  currentStep,
  onDismiss,
}: SidebarGuideProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasSeenGuide, setHasSeenGuide] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the guide
    const guideDismissed = localStorage.getItem("ccai_sidebar_guide_dismissed");
    if (guideDismissed) {
      setHasSeenGuide(true);
      return;
    }

    // Show guide after short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("ccai_sidebar_guide_dismissed", "true");
    setIsVisible(false);
    setHasSeenGuide(true);
    onDismiss?.();
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (hasSeenGuide || !isVisible) return null;

  const currentGuideStep =
    guideSteps.find((step) => step.targetStep === currentStep) || guideSteps[0];
  const stepIndex = guideSteps.findIndex(
    (step) => step.targetStep === currentStep,
  );
  const progress = ((stepIndex + 1) / guideSteps.length) * 100;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={`fixed right-4 top-24 z-40 ${isMinimized ? "w-16" : "w-96"} transition-all duration-300`}
        >
          <div className="bg-gradient-to-br from-tron-grid to-tron-dark border-2 border-tron-cyan/40 rounded-2xl shadow-2xl shadow-tron-cyan/10 overflow-hidden">
            {/* Header */}
            <div className="bg-tron-dark/50 border-b border-tron-cyan/30 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-tron-cyan animate-pulse" />
                {!isMinimized && (
                  <span className="text-sm font-semibold text-tron-cyan">
                    Guide
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMinimize}
                  className="text-tron-text-muted hover:text-tron-cyan transition-colors"
                  title={isMinimized ? "Expand" : "Minimize"}
                >
                  {isMinimized ? "□" : "–"}
                </button>
                <button
                  onClick={handleDismiss}
                  className="text-tron-text-muted hover:text-tron-magenta transition-colors"
                  title="Dismiss guide"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content (hidden when minimized) */}
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 space-y-4">
                    {/* Progress bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-tron-text-muted">
                          Step {stepIndex + 1} of {guideSteps.length}
                        </span>
                        <span className="text-tron-cyan font-semibold">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-tron-dark rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-tron-cyan to-blue-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    {/* Step content */}
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-3"
                    >
                      <h3 className="text-xl font-bold text-tron-text">
                        {currentGuideStep.title}
                      </h3>
                      <p className="text-sm text-tron-text-muted leading-relaxed">
                        {currentGuideStep.description}
                      </p>

                      {/* Tip box */}
                      {currentGuideStep.tip && (
                        <div className="bg-tron-dark/50 border border-tron-cyan/20 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <span className="text-tron-cyan text-lg">💡</span>
                            <div>
                              <p className="text-xs font-semibold text-tron-cyan mb-1">
                                Pro Tip
                              </p>
                              <p className="text-xs text-tron-text-muted">
                                {currentGuideStep.tip}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>

                    {/* Step indicators */}
                    <div className="flex justify-center gap-2 pt-2">
                      {guideSteps.map((_, index) => (
                        <div
                          key={index}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            index <= stepIndex
                              ? "w-8 bg-tron-cyan"
                              : "w-1.5 bg-tron-grid"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Dismiss button */}
                    <button
                      onClick={handleDismiss}
                      className="w-full py-2 text-xs text-tron-text-muted hover:text-tron-cyan transition-colors border-t border-tron-grid pt-4"
                    >
                      Got it, hide guide →
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
