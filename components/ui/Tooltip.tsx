"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, X } from "lucide-react";

interface TooltipProps {
  title: string;
  content: string | React.ReactNode;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  dismissible?: boolean;
  storageKey?: string; // For permanently dismissing
  position?: "top" | "bottom" | "left" | "right";
}

export default function Tooltip({
  title,
  content,
  children,
  icon,
  dismissible = false,
  storageKey,
  position = "top",
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isPermanentlyDismissed, setIsPermanentlyDismissed] = useState(() => {
    if (typeof window !== "undefined" && storageKey) {
      return localStorage.getItem(`tooltip_dismissed_${storageKey}`) === "true";
    }
    return false;
  });

  const handleDismiss = () => {
    setIsVisible(false);
    if (storageKey) {
      localStorage.setItem(`tooltip_dismissed_${storageKey}`, "true");
      setIsPermanentlyDismissed(true);
    }
  };

  const handleToggle = () => {
    setIsVisible(!isVisible);
  };

  if (isPermanentlyDismissed && dismissible) {
    return <>{children}</>;
  }

  const positionClasses = {
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
  };

  return (
    <div className="relative inline-block">
      {/* Trigger */}
      <div className="flex items-center gap-2">
        {children}
        <button
          onClick={handleToggle}
          onMouseEnter={() => !dismissible && setIsVisible(true)}
          onMouseLeave={() => !dismissible && setIsVisible(false)}
          className="inline-flex items-center justify-center text-gray-400 hover:text-tron-cyan transition-colors cursor-help"
          aria-label="Show tooltip"
        >
          {icon || <HelpCircle className="w-4 h-4" />}
        </button>
      </div>

      {/* Tooltip Content */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: position === "top" ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: position === "top" ? 10 : -10 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 ${positionClasses[position]} w-72`}
          >
            <div className="bg-tron-grid border-2 border-tron-cyan/50 rounded-lg shadow-2xl shadow-tron-cyan/20 p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-tron-cyan/20 rounded">
                    <HelpCircle className="w-4 h-4 text-tron-cyan" />
                  </div>
                  <h4 className="text-sm font-bold text-tron-text">{title}</h4>
                </div>
                {dismissible && (
                  <button
                    onClick={handleDismiss}
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="Dismiss tooltip"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="text-sm text-tron-text-muted leading-relaxed">
                {content}
              </div>

              {/* Arrow */}
              <div
                className={`absolute w-3 h-3 bg-tron-grid border-tron-cyan/50 rotate-45 ${
                  position === "top"
                    ? "bottom-[-7px] left-1/2 -translate-x-1/2 border-b-2 border-r-2"
                    : position === "bottom"
                    ? "top-[-7px] left-1/2 -translate-x-1/2 border-t-2 border-l-2"
                    : position === "left"
                    ? "right-[-7px] top-1/2 -translate-y-1/2 border-t-2 border-r-2"
                    : "left-[-7px] top-1/2 -translate-y-1/2 border-b-2 border-l-2"
                }`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simpler inline tooltip (hover only, no dismiss)
export function InlineTooltip({
  content,
  children,
}: {
  content: string;
  children: React.ReactNode;
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-xs text-gray-300 whitespace-nowrap shadow-lg">
              {content}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
