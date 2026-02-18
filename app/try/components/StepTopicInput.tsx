"use client";

import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";

const PLACEHOLDER_EXAMPLES = [
  "AI content strategy for startups",
  "Remote work productivity hacks",
  "Sustainable fashion trends",
  "Crypto market predictions",
  "SaaS growth tactics for 2026",
  "Mental health in the workplace",
];

interface StepTopicInputProps {
  topic: string;
  onTopicChange: (topic: string) => void;
  onContinue: () => void;
}

const StepTopicInput = memo<StepTopicInputProps>(
  ({ topic, onTopicChange, onContinue }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);

    useEffect(() => {
      inputRef.current?.focus();
    }, []);

    // Cycle placeholder examples
    useEffect(() => {
      const interval = setInterval(() => {
        setPlaceholderIndex((i) => (i + 1) % PLACEHOLDER_EXAMPLES.length);
      }, 3000);
      return () => clearInterval(interval);
    }, []);

    const canContinue = topic.trim().length >= 2;

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && canContinue) {
          e.preventDefault();
          onContinue();
        }
      },
      [canContinue, onContinue],
    );

    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            What's your post about?
          </h2>
          <p className="text-sm text-gray-500">
            Enter any topic — we'll predict its viral potential and generate
            ready-to-post content.
          </p>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={topic}
          onChange={(e) => onTopicChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={PLACEHOLDER_EXAMPLES[placeholderIndex]}
          className="w-full px-6 py-5 bg-black/40 border border-white/10 rounded-2xl text-white text-lg placeholder:text-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 transition-all"
        />

        <div className="flex items-center gap-4">
          <motion.button
            onClick={onContinue}
            disabled={!canContinue}
            whileHover={canContinue ? { scale: 1.03 } : {}}
            whileTap={canContinue ? { scale: 0.97 } : {}}
            className={`flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              canContinue
                ? "bg-white text-black hover:bg-white/90"
                : "bg-white/5 text-gray-600 cursor-not-allowed"
            }`}
          >
            Continue
            <ArrowRight className="w-4 h-4" weight="bold" />
          </motion.button>

          <span className="text-xs text-gray-700 ml-auto hidden md:block">
            press{" "}
            <kbd className="font-mono bg-white/5 px-1.5 py-0.5 rounded text-gray-500">
              ↵ Enter
            </kbd>
          </span>
        </div>
      </div>
    );
  },
);

StepTopicInput.displayName = "StepTopicInput";
export default StepTopicInput;
