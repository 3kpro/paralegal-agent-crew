"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  RocketLaunch,
  CopySimple,
  Sliders,
  Check,
} from "@phosphor-icons/react";

interface StepSignupGateProps {
  topic: string;
  viralScore: number;
}

const VALUE_PROPS = [
  {
    icon: CopySimple,
    text: "Copy full content for all platforms instantly",
  },
  {
    icon: RocketLaunch,
    text: "Generate unlimited variations with custom tone and style",
  },
  {
    icon: Sliders,
    text: "Fine-tune audience, content angle, and CTAs per platform",
  },
];

const StepSignupGate = memo<StepSignupGateProps>(({ topic, viralScore }) => {
  const signupUrl = `/signup?ref=try&topic=${encodeURIComponent(topic)}&score=${viralScore}`;

  return (
    <div className="flex flex-col items-center text-center space-y-8 max-w-md mx-auto">
      {/* Headline */}
      <div className="space-y-3">
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold text-white leading-tight"
        >
          You just predicted your viral post.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-500 text-sm"
        >
          Unlock the full platform to copy, customize, and generate more.
        </motion.p>
      </div>

      {/* Value props */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-4 w-full text-left"
      >
        {VALUE_PROPS.map((prop, i) => {
          const Icon = prop.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.15 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-white/60" weight="duotone" />
              </div>
              <span className="text-sm text-gray-300">{prop.text}</span>
            </motion.div>
          );
        })}
      </motion.div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="space-y-3 w-full pt-2"
      >
        <Link
          href={signupUrl}
          className="w-full flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-sm font-bold bg-white text-black hover:bg-white/90 transition-all"
        >
          <Check className="w-4 h-4" weight="bold" />
          Create Free Account
        </Link>

        <Link
          href="/trend-gen"
          className="w-full flex items-center justify-center px-7 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-300 transition-colors"
        >
          Continue exploring trends
        </Link>
      </motion.div>
    </div>
  );
});

StepSignupGate.displayName = "StepSignupGate";
export default StepSignupGate;
