"use client";

import { useState } from "react";
import { CaretDown as ChevronDown, MagicWand, Fire as Flame, TwitterLogo as Twitter, TrendUp as TrendingUp } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

interface TrendSourceSelectorProps {
  value: string;
  onChange: (source: string) => void;
  disabled?: boolean;
}

const trendSources = [
  {
    id: "mixed",
    label: "Mixed Sources",
    description: "Combines all trending data sources",
    icon: MagicWand,
    color: "from-tron-cyan to-tron-magenta",
  },
  {
    id: "google",
    label: "Google Trends",
    description: "Popular search queries and topics",
    icon: TrendingUp,
    color: "from-blue-400 to-cyan-400",
  },
  {
    id: "twitter",
    label: "Twitter Trends",
    description: "Viral topics and conversations",
    icon: Twitter,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "reddit",
    label: "Reddit Hot Topics",
    description: "Popular discussions and communities",
    icon: Flame,
    color: "from-orange-500 to-red-500",
  },
];

export function TrendSourceSelector({
  value,
  onChange,
  disabled = false,
}: TrendSourceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedSource = trendSources.find((s) => s.id === value);
  const SelectedIcon = selectedSource?.icon || MagicWand;

  return (
    <div className="relative">
      {/* Dropdown Button */}
      <motion.button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
        className={`w-full px-4 py-3 flex items-center justify-between gap-3 rounded-xl border-2 
          backdrop-blur-xl transition-all duration-200
          ${'$'}{
            disabled
              ? "opacity-50 cursor-not-allowed bg-tron-dark/20 border-tron-cyan/10"
              : isOpen
                ? "bg-tron-dark/60 border-tron-cyan/50 shadow-lg shadow-tron-cyan/20"
                : "bg-tron-dark/40 border-tron-cyan/30 hover:border-tron-cyan/50 hover:shadow-lg hover:shadow-tron-cyan/10"
          }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg bg-gradient-to-br ${'$'}{selectedSource?.color || "from-tron-cyan to-tron-magenta"}`}
          >
            <SelectedIcon className="w-4 h-4 text-white" weight="duotone" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-tron-cyan">
              {selectedSource?.label}
            </div>
            <div className="text-xs text-tron-text-muted">
              {selectedSource?.description}
            </div>
          </div>
        </div>

        <ChevronDown
          className={`w-5 h-5 text-tron-cyan transition-transform duration-300 ${'$'}{
            isOpen ? "rotate-180" : ""
          }`}
          weight="duotone"
        />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 z-50 bg-tron-dark/95 backdrop-blur-xl 
              border-2 border-tron-cyan/30 rounded-xl shadow-2xl shadow-tron-cyan/20 overflow-hidden"
          >
            <div className="p-2 space-y-1">
              {trendSources.map((source, index) => {
                const SourceIcon = source.icon;
                const isSelected = value === source.id;

                return (
                  <motion.button
                    key={source.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      onChange(source.id);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-3 flex items-center gap-3 rounded-lg transition-all duration-200
                      ${'$'}{
                        isSelected
                          ? "bg-gradient-to-r from-tron-cyan/20 to-tron-magenta/20 border-l-2 border-tron-cyan"
                          : "hover:bg-tron-cyan/10"
                      }`}
                  >
                    <div
                      className={`p-2 rounded-lg bg-gradient-to-br ${'$'}{source.color}`}
                    >
                      <SourceIcon className="w-4 h-4 text-white" weight="duotone" />
                    </div>

                    <div className="flex-1 text-left">
                      <div className="text-sm font-semibold text-tron-cyan">
                        {source.label}
                      </div>
                      <div className="text-xs text-tron-text-muted">
                        {source.description}
                      </div>
                    </div>

                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 rounded-full bg-tron-cyan"
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
