"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Globe,
  Briefcase,
  PencilSimple,
  ArrowLeft,
  Star,
  Rocket,
} from "@phosphor-icons/react";
import { ValidationType } from "../types";

interface CategoryConfig {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  examples: string[];
  existingType: ValidationType;
  newType: ValidationType;
}

const CATEGORIES: CategoryConfig[] = [
  {
    id: "physical",
    title: "Physical Product",
    subtitle: "Tangible goods you ship or sell in-store",
    icon: Package,
    color: "#10B981",
    examples: ["Skincare", "Electronics", "Apparel"],
    existingType: "physical-existing",
    newType: "physical-new",
  },
  {
    id: "saas",
    title: "Web App / SaaS",
    subtitle: "Software, platforms, or digital tools",
    icon: Globe,
    color: "#8B5CF6",
    examples: ["SaaS", "Mobile app", "Extension"],
    existingType: "saas-existing",
    newType: "saas-new",
  },
  {
    id: "service",
    title: "Service",
    subtitle: "Consulting, agency, or freelance offerings",
    icon: Briefcase,
    color: "#3B82F6",
    examples: ["Consulting", "Agency", "Coaching"],
    existingType: "service-existing",
    newType: "service-new",
  },
];

interface ValidationTypeSelectorProps {
  onTypeSelect: (type: ValidationType) => void;
  onBack: () => void;
}

const ValidationTypeSelector = memo<ValidationTypeSelectorProps>(
  ({ onTypeSelect, onBack }) => {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            What are you promoting?
          </h2>
          <p className="text-gray-400 text-sm">
            Pick your category, then tell us if it&#39;s already live or launching soon.
          </p>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mx-auto">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className="group relative p-5 bg-gray-800/50 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-200 flex flex-col"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${cat.color}10 0%, transparent 60%)`,
                  }}
                />

                <div className="relative z-10 flex flex-col flex-1">
                  {/* Icon + Title — fixed height zone */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: `${cat.color}15`,
                        border: `1px solid ${cat.color}30`,
                      }}
                    >
                      <Icon
                        className="w-5 h-5"
                        weight="duotone"
                        style={{ color: cat.color }}
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-white leading-tight">{cat.title}</h3>
                      <p className="text-[11px] text-gray-400 leading-tight">{cat.subtitle}</p>
                    </div>
                  </div>

                  {/* Examples — fixed height with overflow hidden */}
                  <div className="flex flex-wrap gap-1 mb-4 h-6 overflow-hidden">
                    {cat.examples.map((ex) => (
                      <span
                        key={ex}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 whitespace-nowrap"
                      >
                        {ex}
                      </span>
                    ))}
                  </div>

                  {/* Existing / New Sub-buttons — pinned to bottom */}
                  <div className="flex gap-2 mt-auto">
                    <motion.button
                      onClick={() => onTypeSelect(cat.existingType)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 hover:brightness-125"
                      style={{
                        backgroundColor: `${cat.color}10`,
                        borderColor: `${cat.color}30`,
                        color: cat.color,
                      }}
                    >
                      <Star className="w-3.5 h-3.5 flex-shrink-0" weight="duotone" />
                      Existing
                    </motion.button>
                    <motion.button
                      onClick={() => onTypeSelect(cat.newType)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 hover:brightness-125"
                      style={{
                        backgroundColor: `${cat.color}10`,
                        borderColor: `${cat.color}30`,
                        color: cat.color,
                      }}
                    >
                      <Rocket className="w-3.5 h-3.5 flex-shrink-0" weight="duotone" />
                      New Launch
                    </motion.button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom / Free Text Option */}
        <div className="w-full max-w-4xl mx-auto">
          <motion.button
            onClick={() => onTypeSelect("custom")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-4 bg-gray-800/30 border border-white/10 rounded-2xl hover:border-white/20 transition-all duration-200 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-700/50 border border-gray-600/50 flex items-center justify-center flex-shrink-0">
              <PencilSimple className="w-5 h-5 text-gray-400" weight="duotone" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-white">Custom / Free Text</h3>
              <p className="text-[11px] text-gray-400">
                Describe anything — a personal brand, content idea, or campaign concept
              </p>
            </div>
          </motion.button>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-gray-400 hover:text-white text-sm font-medium transition-colors py-2 px-4 flex items-center gap-1 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </motion.button>
        </div>
      </div>
    );
  }
);

ValidationTypeSelector.displayName = "ValidationTypeSelector";

export default ValidationTypeSelector;
