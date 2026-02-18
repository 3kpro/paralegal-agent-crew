"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import {
  TwitterLogo,
  LinkedinLogo,
  FacebookLogo,
  InstagramLogo,
  TiktokLogo,
  RedditLogo,
  Lock,
} from "@phosphor-icons/react";

const PLATFORM_META: Record<string, { icon: any; name: string; color: string }> = {
  twitter: { icon: TwitterLogo, name: "Twitter / X", color: "#1DA1F2" },
  linkedin: { icon: LinkedinLogo, name: "LinkedIn", color: "#0A66C2" },
  facebook: { icon: FacebookLogo, name: "Facebook", color: "#1877F2" },
  instagram: { icon: InstagramLogo, name: "Instagram", color: "#E4405F" },
  tiktok: { icon: TiktokLogo, name: "TikTok", color: "#00F2EA" },
  reddit: { icon: RedditLogo, name: "Reddit", color: "#FF4500" },
};

interface GatedContentCardProps {
  platform: string;
  content: string;
  gateLevel: "full" | "partial" | "blurred";
  characterCount?: number;
  hashtags?: string[];
  fullLength?: number;
}

const GatedContentCard = memo<GatedContentCardProps>(
  ({ platform, content, gateLevel, characterCount, hashtags, fullLength }) => {
    const meta = PLATFORM_META[platform] || {
      icon: TwitterLogo,
      name: platform,
      color: "#888",
    };
    const Icon = meta.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-black/40 border border-white/10 rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <Icon
              className="w-5 h-5"
              weight="fill"
              style={{ color: meta.color }}
            />
            <span className="text-sm font-semibold text-white">
              {meta.name}
            </span>
          </div>
          {characterCount && (
            <span className="text-xs text-gray-600">
              {characterCount} chars
            </span>
          )}
        </div>

        {/* Content area */}
        <div className="relative px-5 py-4">
          <div
            className={`text-sm text-gray-300 leading-relaxed whitespace-pre-wrap ${
              gateLevel === "blurred" ? "filter blur-[6px] select-none" : ""
            }`}
          >
            {content}
          </div>

          {/* Gradient overlay for partial */}
          {gateLevel === "partial" && (
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none" />
          )}

          {/* Blurred overlay with lock */}
          {gateLevel === "blurred" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                <Lock className="w-4 h-4 text-gray-500" weight="bold" />
                <span className="text-xs text-gray-500 font-medium">
                  Sign up to unlock
                </span>
              </div>
            </div>
          )}

          {/* Partial gate message */}
          {gateLevel === "partial" && fullLength && (
            <div className="absolute inset-x-0 bottom-2 flex justify-center pointer-events-none">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
                <Lock className="w-3.5 h-3.5 text-gray-500" weight="bold" />
                <span className="text-xs text-gray-500 font-medium">
                  {Math.round((content.length / fullLength) * 100)}% shown
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Hashtags (only for full view) */}
        {gateLevel === "full" && hashtags && hashtags.length > 0 && (
          <div className="px-5 pb-3 flex flex-wrap gap-1.5">
            {hashtags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </motion.div>
    );
  },
);

GatedContentCard.displayName = "GatedContentCard";
export default GatedContentCard;
