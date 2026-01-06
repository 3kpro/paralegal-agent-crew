"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Briefcase,
  Heart,
  TrendUp as TrendingUp,
  GameController as Gamepad2,
  ForkKnife as Utensils,
  Airplane as Plane,
  GraduationCap,
  Barbell as Dumbbell,
  Code,
  CurrencyDollar as DollarSign,
  Baby,
  Palette,
  Check,
} from "@phosphor-icons/react";

export interface Interest {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  keywords: string[]; // For XELORA™ search
}

const INTERESTS: Interest[] = [
  {
    id: "technology",
    label: "Technology",
    icon: Code,
    keywords: ["technology", "tech", "software", "AI"],
  },
  {
    id: "fitness",
    label: "Fitness & Health",
    icon: Dumbbell,
    keywords: ["fitness", "health", "workout", "wellness"],
  },
  {
    id: "finance",
    label: "Finance & Investing",
    icon: DollarSign,
    keywords: ["finance", "investing", "money", "crypto"],
  },
  {
    id: "travel",
    label: "Travel & Adventure",
    icon: Plane,
    keywords: ["travel", "adventure", "tourism", "vacation"],
  },
  {
    id: "food",
    label: "Food & Cooking",
    icon: Utensils,
    keywords: ["food", "cooking", "recipes", "restaurants"],
  },
  {
    id: "gaming",
    label: "Gaming & Esports",
    icon: Gamepad2,
    keywords: ["gaming", "esports", "video games", "streaming"],
  },
  {
    id: "fashion",
    label: "Fashion & Beauty",
    icon: Palette,
    keywords: ["fashion", "beauty", "style", "trends"],
  },
  {
    id: "parenting",
    label: "Parenting & Family",
    icon: Baby,
    keywords: ["parenting", "family", "kids", "children"],
  },
  {
    id: "business",
    label: "Business & Marketing",
    icon: Briefcase,
    keywords: ["business", "marketing", "entrepreneurship", "startup"],
  },
  {
    id: "education",
    label: "Education & Learning",
    icon: GraduationCap,
    keywords: ["education", "learning", "courses", "teaching"],
  },
  {
    id: "entertainment",
    label: "Entertainment & Media",
    icon: TrendingUp,
    keywords: ["entertainment", "movies", "TV", "celebrities"],
  },
  {
    id: "lifestyle",
    label: "Lifestyle & Wellness",
    icon: Heart,
    keywords: ["lifestyle", "wellness", "mindfulness", "self-care"],
  },
];

interface InterestSelectionProps {
  onNext: (selectedInterests: Interest[]) => void;
  minSelection?: number;
  maxSelection?: number;
}

export default function InterestSelection({
  onNext,
  minSelection = 3,
  maxSelection = 5,
}: InterestSelectionProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleInterest = (interestId: string) => {
    setSelected((prev) => {
      if (prev.includes(interestId)) {
        return prev.filter((id) => id !== interestId);
      } else if (prev.length < maxSelection) {
        return [...prev, interestId];
      }
      return prev;
    });
  };

  const handleNext = () => {
    const selectedInterests = INTERESTS.filter((i) =>
      selected.includes(i.id)
    );
    onNext(selectedInterests);
  };

  const canProceed = selected.length >= minSelection;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">
          What are you interested in?
        </h1>
        <p className="text-gray-400">
          Select topics you care about so we can show you relevant trends. You can change these anytime.
        </p>
        <p className="text-xs text-gray-500 mt-1">
            XELORA will prioritize trending topics in your selected categories, saving you hours of scrolling.
        </p>
        <p className="text-sm text-coral-400 mt-2">
          {selected.length}/{maxSelection} selected
          {selected.length < minSelection &&
            ` (${minSelection - selected.length} more needed)`}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {INTERESTS.map((interest, index) => {
          const Icon = interest.icon;
          const isSelected = selected.includes(interest.id);
          const isDisabled = !isSelected && selected.length >= maxSelection;

          return (
            <motion.button
              key={interest.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              onClick={() => toggleInterest(interest.id)}
              disabled={isDisabled}
              className={`
                relative h-24 rounded-xl border-2 transition-all duration-200
                flex flex-col items-center justify-center gap-2
                ${
                  isSelected
                    ? "bg-coral-500/20 border-coral-500 shadow-lg shadow-coral-500/20"
                    : isDisabled
                      ? "bg-[#343a40] border-gray-700/50 opacity-50 cursor-not-allowed"
                      : "bg-[#343a40] border-gray-700/50 hover:border-gray-600 hover:bg-[#3a4046]"
                }
              `}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-coral-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" weight="duotone" />
                </div>
              )}
              <Icon
                className={`w-6 h-6 ${isSelected ? "text-coral-400" : "text-gray-400"}`}
                weight="duotone"
              />
              <span
                className={`text-sm font-medium ${isSelected ? "text-white" : "text-gray-300"}`}
              >
                {interest.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <motion.button
        onClick={handleNext}
        disabled={!canProceed}
        className={`
          w-full h-14 rounded-xl font-semibold text-lg transition-all duration-200
          ${
            canProceed
              ? "bg-coral-500 hover:bg-coral-600 text-white shadow-lg hover:shadow-xl"
              : "bg-gray-700 text-gray-500 cursor-not-allowed"
          }
        `}
        whileHover={canProceed ? { scale: 1.02 } : {}}
        whileTap={canProceed ? { scale: 0.98 } : {}}
      >
        {canProceed
          ? "Next: Discover Trending Topics →"
          : `Select ${minSelection - selected.length} more to continue`}
      </motion.button>

      <p className="text-xs text-gray-500 text-center">
        Don't worry, you can explore any topic later. This just helps us show
        you relevant trends to get started.
      </p>
    </div>
  );
}
