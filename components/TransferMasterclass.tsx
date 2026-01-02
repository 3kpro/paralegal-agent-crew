"use client";

import { useState } from "react";
import {
  CaretDown,
  CaretUp,
  TiktokLogo,
  TwitterLogo,
  LinkedinLogo,
  InstagramLogo,
  YoutubeLogo,
  Copy,
  ArrowSquareOut,
  Lightning,
  Clock,
  TextT,
  HashStraight,
} from "@phosphor-icons/react";

interface PlatformGuide {
  name: string;
  icon: React.ElementType;
  color: string;
  postUrl: string;
  characterLimit: string;
  bestTimes: string;
  tips: string[];
  hashtagTip: string;
  steps: string[];
}

const platformGuides: Record<string, PlatformGuide> = {
  tiktok: {
    name: "TikTok",
    icon: TiktokLogo,
    color: "#00f2ea",
    postUrl: "https://www.tiktok.com/upload",
    characterLimit: "2,200 characters (caption)",
    bestTimes: "7-9 AM, 12-3 PM, 7-11 PM",
    tips: [
      "Hook viewers in first 3 seconds",
      "Use trending sounds when possible",
      "End with a question or CTA",
      "Reply to comments quickly for algorithm boost",
    ],
    hashtagTip: "3-5 hashtags max. Mix trending + niche tags.",
    steps: [
      "Copy your content above",
      "Click 'Open TikTok' to go to upload page",
      "Create/upload your video",
      "Paste caption in description field",
      "Add hashtags at the end",
      "Post and engage with comments!",
    ],
  },
  twitter: {
    name: "X (Twitter)",
    icon: TwitterLogo,
    color: "#1DA1F2",
    postUrl: "https://twitter.com/compose/tweet",
    characterLimit: "280 characters",
    bestTimes: "8-10 AM, 12 PM, 5-6 PM",
    tips: [
      "Lead with the hook - first line is everything",
      "Use line breaks for readability",
      "Quote tweet yourself for threads",
      "Engage in replies within first hour",
    ],
    hashtagTip: "1-2 hashtags only. More looks spammy.",
    steps: [
      "Copy your content above",
      "Click 'Open X' to compose",
      "Paste your content",
      "Review character count",
      "Post at optimal time",
    ],
  },
  linkedin: {
    name: "LinkedIn",
    icon: LinkedinLogo,
    color: "#0A66C2",
    postUrl: "https://www.linkedin.com/feed/?shareActive=true",
    characterLimit: "3,000 characters",
    bestTimes: "7-8 AM, 12 PM, 5-6 PM (weekdays)",
    tips: [
      "Start with a bold statement or story",
      "Use short paragraphs (1-2 sentences)",
      "Add a clear CTA at the end",
      "Avoid external links in post (kills reach)",
    ],
    hashtagTip: "3-5 hashtags. Place at bottom, not inline.",
    steps: [
      "Copy your content above",
      "Click 'Open LinkedIn' to start post",
      "Paste content in post field",
      "Add hashtags at the bottom",
      "Consider adding a relevant image",
      "Post and respond to every comment",
    ],
  },
  instagram: {
    name: "Instagram",
    icon: InstagramLogo,
    color: "#E4405F",
    postUrl: "https://www.instagram.com/",
    characterLimit: "2,200 characters (caption)",
    bestTimes: "11 AM - 1 PM, 7-9 PM",
    tips: [
      "First line is your hook (shows in feed)",
      "Use emojis to break up text",
      "Include CTA in caption",
      "Reels > static posts for reach",
    ],
    hashtagTip: "20-30 hashtags in first comment, not caption.",
    steps: [
      "Copy your content above",
      "Open Instagram app on mobile",
      "Create Reel or Post",
      "Paste caption",
      "Put hashtags in first comment",
      "Post and share to Stories",
    ],
  },
  youtube: {
    name: "YouTube",
    icon: YoutubeLogo,
    color: "#FF0000",
    postUrl: "https://studio.youtube.com/",
    characterLimit: "5,000 characters (description)",
    bestTimes: "2-4 PM (weekdays), 9-11 AM (weekends)",
    tips: [
      "First 150 chars show in search - make them count",
      "Include timestamps for long videos",
      "Add relevant keywords naturally",
      "Pin a comment with CTA",
    ],
    hashtagTip: "3-5 hashtags in description. First 3 show above title.",
    steps: [
      "Copy your content above",
      "Click 'Open YouTube Studio'",
      "Upload your video",
      "Paste in description field",
      "Add tags in the tags section",
      "Set thumbnail and publish",
    ],
  },
};

interface TransferMasterclassProps {
  activePlatform?: string;
  content?: string;
  onCopy?: () => void;
}

export function TransferMasterclass({
  activePlatform,
  content,
  onCopy,
}: TransferMasterclassProps) {
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(
    activePlatform || null
  );
  const [isExpanded, setIsExpanded] = useState(true);

  const togglePlatform = (platform: string) => {
    setExpandedPlatform(expandedPlatform === platform ? null : platform);
  };

  const copyAndOpen = (platform: string) => {
    if (content) {
      navigator.clipboard.writeText(content);
      onCopy?.();
    }
    const guide = platformGuides[platform];
    if (guide) {
      window.open(guide.postUrl, "_blank");
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl border border-coral-500/30 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-coral-500/20 flex items-center justify-center">
            <Lightning className="w-5 h-5 text-coral-400" weight="duotone" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-white">Transfer Masterclass</h3>
            <p className="text-xs text-gray-400">
              Platform-specific posting guides
            </p>
          </div>
        </div>
        {isExpanded ? (
          <CaretUp className="w-5 h-5 text-gray-400" />
        ) : (
          <CaretDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-2">
          {Object.entries(platformGuides).map(([key, guide]) => {
            const Icon = guide.icon;
            const isActive = expandedPlatform === key;

            return (
              <div
                key={key}
                className={`rounded-xl border transition-all ${
                  isActive
                    ? "border-coral-500/50 bg-coral-500/5"
                    : "border-gray-700/50 bg-gray-800/30"
                }`}
              >
                {/* Platform Header */}
                <button
                  onClick={() => togglePlatform(key)}
                  className="w-full px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className="w-5 h-5"
                      style={{ color: guide.color }}
                      weight="duotone"
                    />
                    <span className="font-medium text-white">{guide.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyAndOpen(key);
                      }}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-coral-500/20 text-coral-400 hover:bg-coral-500/30 transition-colors flex items-center gap-1.5"
                    >
                      <ArrowSquareOut className="w-3.5 h-3.5" />
                      Open {guide.name.split(" ")[0]}
                    </button>
                    {isActive ? (
                      <CaretUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <CaretDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {isActive && (
                  <div className="px-4 pb-4 space-y-4">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-gray-800/50">
                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                          <TextT className="w-3.5 h-3.5" />
                          Character Limit
                        </div>
                        <p className="text-sm text-white font-medium">
                          {guide.characterLimit}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-800/50">
                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                          <Clock className="w-3.5 h-3.5" />
                          Best Times
                        </div>
                        <p className="text-sm text-white font-medium">
                          {guide.bestTimes}
                        </p>
                      </div>
                    </div>

                    {/* Tips */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        Pro Tips
                      </h4>
                      <ul className="space-y-1.5">
                        {guide.tips.map((tip, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-300 flex items-start gap-2"
                          >
                            <span className="text-coral-400 mt-0.5">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Hashtag Tip */}
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="flex items-center gap-2 text-blue-400 text-xs font-medium mb-1">
                        <HashStraight className="w-3.5 h-3.5" />
                        Hashtag Strategy
                      </div>
                      <p className="text-sm text-gray-300">{guide.hashtagTip}</p>
                    </div>

                    {/* Steps */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        Transfer Steps
                      </h4>
                      <ol className="space-y-2">
                        {guide.steps.map((step, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-300 flex items-start gap-3"
                          >
                            <span className="w-5 h-5 rounded-full bg-coral-500/20 text-coral-400 text-xs flex items-center justify-center flex-shrink-0">
                              {idx + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => copyAndOpen(key)}
                      className="w-full py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2"
                      style={{ backgroundColor: guide.color }}
                    >
                      <Copy className="w-4 h-4" />
                      Copy & Open {guide.name.split(" ")[0]}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
