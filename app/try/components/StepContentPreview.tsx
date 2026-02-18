"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
import GatedContentCard from "./GatedContentCard";

interface StepContentPreviewProps {
  content: Record<string, any>;
  gatingMeta: Record<string, string>;
  platforms: string[];
  onContinue: () => void;
}

const StepContentPreview = memo<StepContentPreviewProps>(
  ({ content, gatingMeta, platforms, onContinue }) => {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
            Your generated content
          </h2>
          <p className="text-sm text-gray-500">
            Real AI-generated, ready-to-post content — tailored for each
            platform.
          </p>
        </div>

        {/* Content cards */}
        <div className="space-y-4">
          {platforms.map((platform) => {
            const platformContent = content[platform];
            if (!platformContent) return null;

            return (
              <GatedContentCard
                key={platform}
                platform={platform}
                content={platformContent.content || ""}
                gateLevel={
                  (gatingMeta[platform] as "full" | "partial" | "blurred") ||
                  "full"
                }
                characterCount={platformContent.characterCount}
                hashtags={platformContent.hashtags}
                fullLength={platformContent.fullLength}
              />
            );
          })}
        </div>

        {/* Unlock CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pt-4"
        >
          <motion.button
            onClick={onContinue}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-sm font-bold bg-white text-black hover:bg-white/90 transition-all"
          >
            Unlock Full Content
            <ArrowRight className="w-4 h-4" weight="bold" />
          </motion.button>
        </motion.div>
      </div>
    );
  },
);

StepContentPreview.displayName = "StepContentPreview";
export default StepContentPreview;
