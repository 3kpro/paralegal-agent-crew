"use client";

import React, { memo, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const PHASES = [
  {
    label: "Scanning trending signals",
    substeps: [
      "Checking 150K+ data points...",
      "Analyzing social momentum...",
      "Mapping topic velocity...",
    ],
  },
  {
    label: "Analyzing Viral DNA",
    substeps: [
      "Evaluating hook potential...",
      "Mapping emotional resonance...",
      "Scoring value proposition...",
    ],
  },
  {
    label: "Engineering your content",
    substeps: [
      "Optimizing for each platform...",
      "Applying anti-hallucination rules...",
      "Generating ready-to-post content...",
    ],
  },
];

interface StepAnalyzingProps {
  topic: string;
}

const StepAnalyzing = memo<StepAnalyzingProps>(({ topic }) => {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [substepIndex, setSubstepIndex] = useState(0);

  useEffect(() => {
    const substepTimer = setInterval(() => {
      setSubstepIndex((prev) => {
        const currentPhase = PHASES[phaseIndex];
        if (prev < currentPhase.substeps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1500);

    return () => clearInterval(substepTimer);
  }, [phaseIndex]);

  useEffect(() => {
    const phaseTimer = setInterval(() => {
      setPhaseIndex((prev) => {
        if (prev < PHASES.length - 1) {
          setSubstepIndex(0);
          return prev + 1;
        }
        return prev;
      });
    }, 4500);

    return () => clearInterval(phaseTimer);
  }, []);

  const currentPhase = PHASES[phaseIndex];

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-10">
      {/* Pulsing orbital animation */}
      <div className="relative w-28 h-28">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-white/10"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border-2 border-white/20"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.5, 0.2, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3,
          }}
        />
        <motion.div
          className="absolute inset-4 rounded-full border-2 border-white/30"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.7, 0.3, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.6,
          }}
        />
        {/* Center dot */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-3 h-3 rounded-full bg-white shadow-lg shadow-white/30" />
        </motion.div>
      </div>

      {/* Phase label */}
      <div className="text-center space-y-3">
        <AnimatePresence mode="wait">
          <motion.h3
            key={phaseIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-xl font-bold text-white"
          >
            {currentPhase.label}
          </motion.h3>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.p
            key={`${phaseIndex}-${substepIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm text-gray-500"
          >
            {currentPhase.substeps[substepIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Topic badge */}
      <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full">
        <span className="text-xs text-gray-400">
          Analyzing:{" "}
          <span className="text-white font-medium">
            {topic.length > 50 ? topic.slice(0, 50) + "..." : topic}
          </span>
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white/40 rounded-full"
            initial={{ width: "0%" }}
            animate={{
              width:
                phaseIndex === 0
                  ? "33%"
                  : phaseIndex === 1
                  ? "66%"
                  : "90%",
            }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );
});

StepAnalyzing.displayName = "StepAnalyzing";
export default StepAnalyzing;
