"use client";

import React, { memo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Cpu,
  Brain,
  Briefcase,
  ChartLineUp,
  CurrencyCircleDollar,
  Heart,
  GameController,
  Globe,
  ShoppingCart,
  Atom,
  Camera,
  PencilSimple,
  ArrowLeft,
  ArrowRight,
} from "@phosphor-icons/react";

const NICHE_CATEGORIES = [
  { id: "tech", label: "Technology & Software", icon: Cpu, color: "#3B82F6" },
  { id: "ai-ml", label: "AI & Machine Learning", icon: Brain, color: "#8B5CF6" },
  { id: "business", label: "Business & Entrepreneurship", icon: Briefcase, color: "#10B981" },
  { id: "marketing", label: "Marketing & Social Media", icon: ChartLineUp, color: "#F59E0B" },
  { id: "finance", label: "Finance & Crypto", icon: CurrencyCircleDollar, color: "#EF4444" },
  { id: "health", label: "Health & Wellness", icon: Heart, color: "#EC4899" },
  { id: "gaming", label: "Gaming & Entertainment", icon: GameController, color: "#6366F1" },
  { id: "politics", label: "Politics & Current Events", icon: Globe, color: "#DC2626" },
  { id: "ecommerce", label: "E-commerce & Retail", icon: ShoppingCart, color: "#14B8A6" },
  { id: "science", label: "Science & Innovation", icon: Atom, color: "#0EA5E9" },
  { id: "creator", label: "Creator Economy", icon: Camera, color: "#F97316" },
];

const MAX_SELECTION = 3;

interface NicheSelectorProps {
  selectedNiches: string[];
  customNiche: string;
  onNichesChange: (niches: string[]) => void;
  onCustomNicheChange: (value: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

const NicheSelector = memo<NicheSelectorProps>(
  ({ selectedNiches, customNiche, onNichesChange, onCustomNicheChange, onContinue, onBack }) => {

    const toggleNiche = useCallback(
      (nicheId: string) => {
        if (selectedNiches.includes(nicheId)) {
          onNichesChange(selectedNiches.filter((n) => n !== nicheId));
        } else if (selectedNiches.length < MAX_SELECTION) {
          onNichesChange([...selectedNiches, nicheId]);
        }
      },
      [selectedNiches, onNichesChange]
    );

    const hasSelection = selectedNiches.length > 0 || customNiche.trim().length > 0;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">
            What topics interest you?
          </h2>
          <p className="text-gray-400 text-sm">
            Select up to {MAX_SELECTION} categories to discover focused viral trends.
            Or type your own niche below.
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {NICHE_CATEGORIES.map((niche) => {
            const isSelected = selectedNiches.includes(niche.id);
            const isDisabled = !isSelected && selectedNiches.length >= MAX_SELECTION;
            const Icon = niche.icon;

            return (
              <motion.button
                key={niche.id}
                onClick={() => toggleNiche(niche.id)}
                whileHover={!isDisabled ? { scale: 1.03 } : {}}
                whileTap={!isDisabled ? { scale: 0.97 } : {}}
                disabled={isDisabled}
                className={`
                  relative p-3 rounded-xl border text-left transition-all duration-200
                  ${
                    isSelected
                      ? "bg-white/10 border-coral-500/60 shadow-lg shadow-coral-500/10"
                      : isDisabled
                      ? "bg-gray-800/30 border-white/5 opacity-40 cursor-not-allowed"
                      : "bg-gray-800/50 border-white/10 hover:border-white/20 hover:bg-gray-800/70"
                  }
                `}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? "bg-coral-500/20" : "bg-white/5"
                    }`}
                    style={isSelected ? { backgroundColor: `${niche.color}20` } : {}}
                  >
                    <Icon
                      className="w-4 h-4"
                      weight={isSelected ? "fill" : "regular"}
                      style={{ color: isSelected ? niche.color : "#9ca3af" }}
                    />
                  </div>
                  <span
                    className={`text-xs font-medium leading-tight ${
                      isSelected ? "text-white" : "text-gray-300"
                    }`}
                  >
                    {niche.label}
                  </span>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <div
                    className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                    style={{ backgroundColor: niche.color }}
                  >
                    ✓
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Custom Niche Input */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <PencilSimple className="w-3.5 h-3.5" />
            Or type your own niche
          </label>
          <input
            type="text"
            value={customNiche}
            onChange={(e) => onCustomNicheChange(e.target.value)}
            placeholder="e.g., Solopreneur Tax Tips, HR Engagement Tools, Epstein Files..."
            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-coral-500/40 focus:ring-1 focus:ring-coral-500/20 transition-colors"
          />
        </div>

        {/* Selection Summary */}
        {hasSelection && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-gray-500">Selected:</span>
            {selectedNiches.map((nicheId) => {
              const niche = NICHE_CATEGORIES.find((n) => n.id === nicheId);
              return niche ? (
                <span
                  key={nicheId}
                  className="px-2 py-0.5 rounded-full text-xs font-medium text-white border"
                  style={{
                    backgroundColor: `${niche.color}15`,
                    borderColor: `${niche.color}40`,
                  }}
                >
                  {niche.label}
                </span>
              ) : null;
            })}
            {customNiche.trim() && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white bg-coral-500/15 border border-coral-500/40">
                {customNiche.trim()}
              </span>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-gray-400 hover:text-white text-sm font-medium transition-colors py-2 px-4 flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </motion.button>

          <motion.button
            onClick={onContinue}
            disabled={!hasSelection}
            whileHover={hasSelection ? { scale: 1.03 } : {}}
            whileTap={hasSelection ? { scale: 0.97 } : {}}
            className={`
              px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2
              ${
                hasSelection
                  ? "bg-coral-500 hover:bg-coral-400 text-white shadow-lg shadow-coral-500/25"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            Discover Trends <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    );
  }
);

NicheSelector.displayName = "NicheSelector";

export default NicheSelector;
export { NICHE_CATEGORIES };
