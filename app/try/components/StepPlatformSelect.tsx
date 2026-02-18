"use client";

import React, { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "@phosphor-icons/react";
import {
  TwitterLogo,
  LinkedinLogo,
  FacebookLogo,
  InstagramLogo,
  TiktokLogo,
  RedditLogo,
} from "@phosphor-icons/react";

const PLATFORMS = [
  { id: "twitter", name: "Twitter / X", icon: TwitterLogo, color: "#1DA1F2" },
  { id: "linkedin", name: "LinkedIn", icon: LinkedinLogo, color: "#0A66C2" },
  { id: "facebook", name: "Facebook", icon: FacebookLogo, color: "#1877F2" },
  { id: "instagram", name: "Instagram", icon: InstagramLogo, color: "#E4405F" },
  { id: "tiktok", name: "TikTok", icon: TiktokLogo, color: "#00F2EA" },
  { id: "reddit", name: "Reddit", icon: RedditLogo, color: "#FF4500" },
];

const MAX_PLATFORMS = 3;

interface StepPlatformSelectProps {
  selectedPlatforms: string[];
  onPlatformsChange: (platforms: string[]) => void;
  onContinue: () => void;
  onBack: () => void;
}

const StepPlatformSelect = memo<StepPlatformSelectProps>(
  ({ selectedPlatforms, onPlatformsChange, onContinue, onBack }) => {
    const canContinue = selectedPlatforms.length >= 2;

    const togglePlatform = useCallback(
      (id: string) => {
        if (selectedPlatforms.includes(id)) {
          onPlatformsChange(selectedPlatforms.filter((p) => p !== id));
        } else if (selectedPlatforms.length < MAX_PLATFORMS) {
          onPlatformsChange([...selectedPlatforms, id]);
        }
      },
      [selectedPlatforms, onPlatformsChange],
    );

    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            Where do you want to post?
          </h2>
          <p className="text-sm text-gray-500">
            Select 2-3 platforms. We'll generate optimized content for each.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {PLATFORMS.map((platform) => {
            const Icon = platform.icon;
            const isSelected = selectedPlatforms.includes(platform.id);
            const isDisabled =
              !isSelected && selectedPlatforms.length >= MAX_PLATFORMS;

            return (
              <motion.button
                key={platform.id}
                onClick={() => togglePlatform(platform.id)}
                whileHover={!isDisabled ? { scale: 1.03 } : {}}
                whileTap={!isDisabled ? { scale: 0.97 } : {}}
                className={`relative flex items-center gap-3 px-4 py-4 rounded-xl border transition-all duration-200 text-left ${
                  isSelected
                    ? "bg-white/10 border-white/30 text-white"
                    : isDisabled
                    ? "bg-black/20 border-white/5 text-gray-700 cursor-not-allowed"
                    : "bg-black/40 border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200"
                }`}
              >
                <Icon
                  className="w-6 h-6 flex-shrink-0"
                  weight={isSelected ? "fill" : "regular"}
                  style={isSelected ? { color: platform.color } : {}}
                />
                <span className="text-sm font-medium">{platform.name}</span>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white"
                  />
                )}
              </motion.button>
            );
          })}
        </div>

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
            Analyze Viral Potential
            <ArrowRight className="w-4 h-4" weight="bold" />
          </motion.button>

          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-300 text-sm font-medium transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>
    );
  },
);

StepPlatformSelect.displayName = "StepPlatformSelect";
export default StepPlatformSelect;
