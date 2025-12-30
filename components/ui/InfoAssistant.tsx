"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkle as Sparkles,
  TrendUp as TrendingUp,
  Lightning as Zap,
  Target,
  Brain,
  CaretRight as ChevronRight,
} from "@phosphor-icons/react";

interface InfoAssistantProps {
  step: number;
  isVisible?: boolean;
}

interface AssistantMessage {
  title: string;
  content: string;
  icon: React.ReactNode;
  type: "tip" | "feature" | "promo";
}

const InfoAssistant: React.FC<InfoAssistantProps> = ({
  step,
  isVisible = true,
}) => {
  const [currentMessage, setCurrentMessage] = useState<AssistantMessage | null>(
    null
  );
  const [isMinimized, setIsMinimized] = useState(false);

  // Define messages for each step
  const messages: Record<number, AssistantMessage[]> = {
    1: [
      {
        title: "Choose Your Platforms",
        content:
          "Select the social platforms where you want to publish. You can pick multiple platforms - the AI will optimize content for each one.",
        icon: <Zap className="w-5 h-5" weight="duotone" />,
        type: "tip",
      },
      {
        title: "Platform Optimization",
        content:
          "Each platform has unique requirements. We automatically adjust character limits, tone, and formatting for Twitter, LinkedIn, Instagram, and more.",
        icon: <Brain className="w-5 h-5" weight="duotone" />,
        type: "tip",
      },
    ],
    2: [
      {
        title: "Find Trending Topics",
        content:
          "Use the search bar to discover what's trending in your niche. The AI analyzes real-time data to surface relevant topics your audience cares about.",
        icon: <TrendingUp className="w-5 h-5" weight="duotone" />,
        type: "tip",
      },
      {
        title: "Select Multiple Trends",
        content:
          "Click on multiple trending topics to give the AI more context. This helps generate more relevant and engaging content for your campaign.",
        icon: <Target className="w-5 h-5" weight="duotone" />,
        type: "tip",
      },
    ],
    3: [
      {
        title: "Customize Your Content",
        content:
          "Adjust the temperature slider to control creativity. Higher values = more creative, lower values = more focused and professional.",
        icon: <Sparkles className="w-5 h-5" weight="duotone" />,
        type: "tip",
      },
      {
        title: "Set Your Preferences",
        content:
          "Choose your target audience, content tone, and focus areas. These settings help the AI match your brand voice and messaging goals.",
        icon: <Brain className="w-5 h-5" weight="duotone" />,
        type: "tip",
      },
    ],
    4: [
      {
        title: "Review & Publish",
        content:
          "Review the generated content, make any final edits, and schedule your posts. You can publish immediately or schedule for optimal times.",
        icon: <ChevronRight className="w-5 h-5" weight="duotone" />,
        type: "tip",
      },
    ],
  };

  // Rotate through messages for current step
  useEffect(() => {
    const stepMessages = messages[step] || messages[1];
    let currentIndex = 0;

    const rotateMessage = () => {
      setCurrentMessage(stepMessages[currentIndex]);
      currentIndex = (currentIndex + 1) % stepMessages.length;
    };

    rotateMessage(); // Show first message immediately

    const interval = setInterval(rotateMessage, 8000); // Rotate every 8 seconds

    return () => clearInterval(interval);
  }, [step]);

  if (!isVisible || !currentMessage) return null;

  const getTypeColor = (type: string) => {
    switch (type) {
      case "tip":
        return "from-tron-cyan/10 to-blue-500/10 border-tron-cyan/30";
      case "feature":
        return "from-tron-magenta/10 to-purple-500/10 border-tron-magenta/30";
      case "promo":
        return "from-yellow-500/10 to-orange-500/10 border-yellow-500/30";
      default:
        return "from-tron-cyan/10 to-tron-magenta/10 border-tron-cyan/30";
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "tip":
        return "text-tron-cyan";
      case "feature":
        return "text-tron-magenta";
      case "promo":
        return "text-yellow-400";
      default:
        return "text-tron-cyan";
    }
  };

  return (
    <AnimatePresence>
      {!isMinimized ? (
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0.1}
          dragConstraints={{
            top: -window.innerHeight / 2,
            left: -window.innerWidth / 2,
            right: window.innerWidth / 2,
            bottom: window.innerHeight / 2,
          }}
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -400, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed left-4 bottom-24 z-40 w-80 max-w-[calc(100vw-2rem)] cursor-move"
        >
          <motion.div
            key={currentMessage.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className={`relative backdrop-blur-md bg-gradient-to-br ${getTypeColor(
              currentMessage.type
            )} border rounded-2xl p-5 shadow-2xl`}
          >
            {/* Close/Minimize Button */}
            <button
              onClick={() => setIsMinimized(true)}
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full transition-all cursor-pointer z-50"
              aria-label="Minimize assistant"
            >
              <X className="w-4 h-4 text-tron-text-muted hover:text-tron-text" weight="duotone" />
            </button>

            {/* Icon Badge */}
            <div
              className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-tron-dark/50 to-tron-dark/30 border-2 ${
                currentMessage.type === "tip"
                  ? "border-tron-cyan/30"
                  : currentMessage.type === "feature"
                  ? "border-tron-magenta/30"
                  : "border-yellow-500/30"
              } mb-4`}
            >
              <div className={getIconColor(currentMessage.type)}>
                {currentMessage.icon}
              </div>
            </div>

            {/* Type Badge */}
            <div className="mb-2">
              <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-tron-cyan/20 text-tron-cyan">
                💡 Setup Guide
              </span>
            </div>

            {/* Title */}
            <h3 className="text-base font-bold text-tron-text mb-2">
              {currentMessage.title}
            </h3>

            {/* Content */}
            <p className="text-sm text-tron-text-muted/90 leading-relaxed">
              {currentMessage.content}
            </p>

            {/* Animated Progress Dots */}
            <div className="flex gap-1.5 mt-4">
              {(messages[step] || messages[1]).map((_, idx) => (
                <motion.div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    messages[step]?.indexOf(currentMessage) === idx
                      ? `w-8 ${
                          currentMessage.type === "tip"
                            ? "bg-tron-cyan"
                            : currentMessage.type === "feature"
                            ? "bg-tron-magenta"
                            : "bg-yellow-400"
                        }`
                      : "w-1.5 bg-tron-text-muted/30"
                  }`}
                  animate={{
                    width:
                      messages[step]?.indexOf(currentMessage) === idx
                        ? 32
                        : 6,
                  }}
                />
              ))}
            </div>

            {/* Decorative Glow */}
            <div className="absolute inset-0 rounded-2xl bg-tron-cyan/5 -z-10 blur-xl" />
          </motion.div>
        </motion.div>
      ) : (
        // Minimized floating button
        <motion.button
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          onClick={() => setIsMinimized(false)}
          className="fixed left-4 bottom-24 z-40 p-4 bg-gradient-to-r from-tron-cyan to-tron-magenta rounded-full shadow-2xl hover:scale-110 transition-transform"
          aria-label="Show assistant"
        >
          <Sparkles className="w-6 h-6 text-white" weight="duotone" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default InfoAssistant;
