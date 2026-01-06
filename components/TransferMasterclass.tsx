"use client";

import { useState, useEffect } from "react";
import {
  CaretDown,
  CaretUp,
  TiktokLogo,
  TwitterLogo,
  LinkedinLogo,
  InstagramLogo,
  YoutubeLogo,
  FacebookLogo,
  RedditLogo,
  Copy,
  ArrowSquareOut,
  Lightning,
  Clock,
  TextT,
  HashStraight,
  DeviceMobile,
  Info,
} from "@phosphor-icons/react";
import { SendToPhoneModal } from "./SendToPhoneModal";

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
  facebook: {
    name: "Facebook",
    icon: FacebookLogo,
    color: "#1877F2",
    postUrl: "https://www.facebook.com/",
    characterLimit: "63,206 characters",
    bestTimes: "1-3 PM (weekdays)",
    tips: [
      "Visuals are key - always include media",
      "Keep text conversational and friendly",
      "Ask questions to drive engagement",
      "Use Facebook Stories for casual updates",
    ],
    hashtagTip: "Use sparingly (1-2 max). Less effective than other platforms.",
    steps: [
      "Copy your content above",
      "Click 'Open Facebook' to go to feed",
      "Create a new post",
      "Paste content and attach media",
      "Check preview and post",
    ],
  },
  reddit: {
    name: "Reddit",
    icon: RedditLogo,
    color: "#FF4500",
    postUrl: "https://www.reddit.com/submit",
    characterLimit: "40,000 characters (body), 300 (title)",
    bestTimes: "6-9 AM (US times)",
    tips: [
      "Provide value first, don't just sell",
      "Match the subreddit's culture/rules",
      "Engage in comments genuinely",
      "Avoid obvious self-promotion",
    ],
    hashtagTip: "Hashtags don't work on Reddit. Use keywords in text.",
    steps: [
      "Copy your content above",
      "Click 'Open Reddit' to submit",
      "Choose appropriate subreddit",
      "Paste title and body",
      "Verify subreddit rules",
      "Post and monitor comments",
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
  // Use state to manage expansion
  // Default to collapsed so the user sees the down arrow (CaretDown) and can expand manually
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneModalPlatform, setPhoneModalPlatform] = useState("");

  const selectedGuideKey = activePlatform && platformGuides[activePlatform] ? activePlatform : null;
  const currentGuide = selectedGuideKey ? platformGuides[selectedGuideKey] : null;

  // Auto-expansion removed per user request - manual control only
  // "They are collapsed. Let the user do that."

  const openPhoneModal = (platform: string) => {
    setPhoneModalPlatform(platform);
    setShowPhoneModal(true);
  };

  // Platforms that are mobile-first (text posts only work on mobile)
  const mobileFirstPlatforms = ["tiktok", "instagram"];

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

  const GuideIcon = currentGuide ? currentGuide.icon : Lightning;

  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl border border-coral-500/30 overflow-hidden shadow-xl sticky top-8">
      {/* Header */}
      <div className="w-full px-6 py-4 flex items-center justify-between border-b border-gray-700/50 bg-black/20">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl bg-coral-500/20 flex items-center justify-center shadow-lg shadow-coral-500/10 transition-colors"
            style={currentGuide ? { backgroundColor: `${currentGuide.color}20` } : undefined}
          >
            <GuideIcon 
              className="w-5 h-5" 
              weight="duotone"
              style={currentGuide ? { color: currentGuide.color } : { color: "#ff6b6b" }}
            />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-white tracking-wide">
              {currentGuide ? `${currentGuide.name} Guide` : "Transfer Masterclass"}
            </h3>
            <p className="text-xs text-gray-400 font-medium">
              {currentGuide ? "Platform-specific strategy" : "Select content to view guide"}
            </p>
          </div>
        </div>
        {currentGuide && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            {isExpanded ? (
              <CaretUp className="w-5 h-5 text-gray-400" />
            ) : (
              <CaretDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
        )}
      </div>

      {/* Content Area */}
      {isExpanded && (
        <div className="min-h-[300px] flex flex-col">
          {currentGuide && selectedGuideKey ? (
            <div className="p-6 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
                  <div className="flex items-center gap-2 text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">
                    <TextT className="w-4 h-4 text-cyan-400" />
                    Length
                  </div>
                  <p className="text-sm text-white font-semibold">
                    {currentGuide.characterLimit}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
                  <div className="flex items-center gap-2 text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">
                    <Clock className="w-4 h-4 text-purple-400" />
                    Timing
                  </div>
                  <p className="text-sm text-white font-semibold">
                    {currentGuide.bestTimes}
                  </p>
                </div>
              </div>

              {/* Steps */}
              <div>
                <h4 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  <span className="w-8 h-[1px] bg-gray-600"></span>
                  Action Plan
                  <span className="w-full h-[1px] bg-gray-600"></span>
                </h4>
                <ol className="space-y-4">
                  {currentGuide.steps.map((step, idx) => (
                    <li
                      key={idx}
                      className="group flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <span className="w-6 h-6 rounded-full bg-coral-500/10 border border-coral-500/30 text-coral-400 text-xs font-bold flex items-center justify-center flex-shrink-0 group-hover:bg-coral-500 group-hover:text-white transition-all shadow-[0_0_10px_rgba(255,107,107,0.2)]">
                        {idx + 1}
                      </span>
                      <span className="text-sm text-gray-300 leading-relaxed">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Pro Tips */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-5 border border-gray-700/50">
                <h4 className="text-xs font-bold text-coral-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Lightning className="w-4 h-4" weight="fill" />
                  Pro Tips
                </h4>
               <ul className="space-y-2.5">
                  {currentGuide.tips.map((tip, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-gray-300/90 flex items-start gap-2.5"
                    >
                       <div className="w-1 h-1 rounded-full bg-gray-500 mt-2 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hashtag Tip */}
              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wide mb-2">
                  <HashStraight className="w-4 h-4" weight="bold" />
                  Hashtag Strategy
                </div>
                <p className="text-sm text-blue-100/80 leading-relaxed font-medium">
                  {currentGuide.hashtagTip}
                </p>
              </div>

              {/* Mobile-First Platform Notice */}
              {mobileFirstPlatforms.includes(selectedGuideKey) && (
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wide mb-2">
                    <DeviceMobile className="w-4 h-4" weight="bold" />
                    Mobile App Required
                  </div>
                  <p className="text-sm text-amber-100/80 leading-relaxed">
                    {selectedGuideKey === "tiktok"
                      ? "TikTok text posts only work on mobile. Use 'Send to Phone' to copy instantly."
                      : "Instagram allows creating posts from desktop, but Reels usually require the mobile app."}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-2">
                {mobileFirstPlatforms.includes(selectedGuideKey) && content && (
                  <button
                    onClick={() => openPhoneModal(selectedGuideKey)}
                    className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-900/20"
                  >
                    <DeviceMobile className="w-4 h-4" weight="bold" />
                    Send to Phone
                  </button>
                )}
                <button
                  onClick={() => copyAndOpen(selectedGuideKey)}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all flex items-center justify-center gap-2 hover:brightness-110 shadow-lg"
                  style={{ backgroundColor: currentGuide.color, boxShadow: `0 4px 14px 0 ${currentGuide.color}40` }}
                >
                  <ArrowSquareOut className="w-4 h-4" weight="bold" />
                  Open {currentGuide.name}
                </button>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 opacity-50">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-2">
                <Info className="w-8 h-8 text-gray-600" />
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">No Content Selected</h4>
                <p className="text-sm text-gray-500 max-w-[200px] mx-auto">
                  Click the <span className="text-coral-400">Copy</span> button on any generated content to view its posting guide.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Send to Phone Modal */}
      <SendToPhoneModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        content={content || ""}
        platform={phoneModalPlatform}
      />
    </div>
  );
}
