"use client";

import React, { memo, useEffect, useState } from "react";
import { AnimatePresence, motion, useSpring, useTransform } from "framer-motion";
import { ArrowRight, ArrowCounterClockwise } from "@phosphor-icons/react";
import { Lightning, Heart, Diamond } from "@phosphor-icons/react";

interface ViralDNA {
  hookType: string;
  primaryEmotion: string;
  valueProp: string;
}

interface StepViralRevealProps {
  viralScore: number;
  viralPotential: "high" | "medium" | "low";
  viralDNA?: ViralDNA;
  aiReasoning?: string;
  onContinue: () => void;
  onRetry: () => void;
}

function ScoreCounter({ target }: { target: number }) {
  const spring = useSpring(0, { stiffness: 40, damping: 15 });
  const display = useTransform(spring, (v) => Math.round(v));
  const [value, setValue] = useState(0);

  useEffect(() => {
    spring.set(target);
    const unsub = display.on("change", (v) => setValue(v));
    return unsub;
  }, [target, spring, display]);

  return <span>{value}</span>;
}

const DNA_CARDS = [
  { key: "hookType", label: "Hook Type", icon: Lightning, delay: 0.6 },
  { key: "primaryEmotion", label: "Primary Emotion", icon: Heart, delay: 0.9 },
  { key: "valueProp", label: "Value Prop", icon: Diamond, delay: 1.2 },
] as const;

const StepViralReveal = memo<StepViralRevealProps>(
  ({ viralScore, viralPotential, viralDNA, aiReasoning, onContinue, onRetry }) => {
    const [showDNA, setShowDNA] = useState(false);
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
      const dnaTimer = setTimeout(() => setShowDNA(true), 1500);
      const btnTimer = setTimeout(() => setShowButton(true), 2800);
      return () => {
        clearTimeout(dnaTimer);
        clearTimeout(btnTimer);
      };
    }, []);

    const scoreColor =
      viralPotential === "high"
        ? "text-green-400"
        : viralPotential === "medium"
        ? "text-yellow-400"
        : "text-gray-400";

    const glowColor =
      viralPotential === "high"
        ? "shadow-green-500/20"
        : viralPotential === "medium"
        ? "shadow-yellow-500/20"
        : "shadow-gray-500/10";

    const ringColor =
      viralPotential === "high"
        ? "border-green-500/40"
        : viralPotential === "medium"
        ? "border-yellow-500/40"
        : "border-gray-500/20";

    return (
      <div className="flex flex-col items-center space-y-8">
        {/* Score circle */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`relative w-40 h-40 rounded-full border-4 ${ringColor} flex items-center justify-center shadow-2xl ${glowColor}`}
        >
          <div className="text-center">
            <div className={`text-5xl font-black ${scoreColor}`}>
              <ScoreCounter target={viralScore} />
            </div>
            <div className="text-xs text-gray-500 font-medium mt-1">
              / 100
            </div>
          </div>
        </motion.div>

        {/* Potential badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className={`px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${
            viralPotential === "high"
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : viralPotential === "medium"
              ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
              : "bg-gray-500/10 border-gray-500/30 text-gray-400"
          }`}
        >
          {viralPotential === "high"
            ? "High Viral Potential"
            : viralPotential === "medium"
            ? "Medium Viral Potential"
            : "Low Viral Potential"}
        </motion.div>

        {/* AI Reasoning */}
        {aiReasoning && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="text-sm text-gray-500 text-center max-w-md"
          >
            {aiReasoning}
          </motion.p>
        )}

        {/* Viral DNA cards */}
        <AnimatePresence>
          {showDNA && viralDNA && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-3 gap-3 w-full max-w-lg"
            >
              {DNA_CARDS.map((card) => {
                const Icon = card.icon;
                const value = viralDNA[card.key];
                return (
                  <motion.div
                    key={card.key}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: card.delay }}
                    className="p-4 bg-white/5 border border-white/10 rounded-xl text-center"
                  >
                    <Icon
                      className="w-5 h-5 mx-auto mb-2 text-white/60"
                      weight="duotone"
                    />
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">
                      {card.label}
                    </p>
                    <p className="text-sm text-white font-semibold">{value}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA buttons */}
        <AnimatePresence>
          {showButton && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <motion.button
                onClick={onContinue}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold bg-white text-black hover:bg-white/90 transition-all"
              >
                See Your Generated Content
                <ArrowRight className="w-4 h-4" weight="bold" />
              </motion.button>

              <button
                onClick={onRetry}
                className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-300 transition-colors font-medium"
              >
                <ArrowCounterClockwise className="w-3.5 h-3.5" />
                Try a different topic
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

StepViralReveal.displayName = "StepViralReveal";
export default StepViralReveal;
