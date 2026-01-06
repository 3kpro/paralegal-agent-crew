"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { TrendUp as TrendingUp, WarningCircle as AlertCircle, MagicWand } from "@phosphor-icons/react";
import { BouncingDots } from "@/components/ui/bouncing-dots";
import type { Interest } from "./InterestSelection";
import { getViralScoreEmoji, formatViralScore } from "@/lib/viral-score-utils";

interface TrendWithViralScore {
  title: string;
  formattedTraffic: string;
  relatedQueries?: string[];
  viralScore: number;
  viralPotential: "high" | "medium" | "low";
  viralDNA?: {
    hookType: string;
    primaryEmotion: string;
    valueProp: string;
  };
}

interface InterestTrends {
  interest: Interest;
  trends: TrendWithViralScore[];
  loading: boolean;
  error?: string;
}

interface TrendingTopicsPreviewProps {
  selectedInterests: Interest[];
  onNext: () => void;
  onBack: () => void;
}

export default function TrendingTopicsPreview({
  selectedInterests,
  onNext,
  onBack,
}: TrendingTopicsPreviewProps) {
  const [interestTrends, setInterestTrends] = useState<InterestTrends[]>([]);

  useEffect(() => {
    // Initialize loading state for all interests
    setInterestTrends(
      selectedInterests.map((interest) => ({
        interest,
        trends: [],
        loading: true,
      }))
    );

    // Fetch trends for each interest in parallel
    selectedInterests.forEach((interest, index) => {
      // Use the first keyword from each interest
      const keyword = interest.keywords[0];

      fetch(`/api/trends?keyword=${encodeURIComponent(keyword)}&mode=ideas`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data?.trending) {
            // Take top 3 trends
            const topTrends = data.data.trending.slice(0, 3);

            setInterestTrends((prev) => {
              const updated = [...prev];
              updated[index] = {
                interest,
                trends: topTrends,
                loading: false,
              };
              return updated;
            });
          } else {
            throw new Error("Failed to fetch trends");
          }
        })
        .catch((error) => {
          console.error(`Error fetching trends for ${interest.label}:`, error);
          setInterestTrends((prev) => {
            const updated = [...prev];
            updated[index] = {
              interest,
              trends: [],
              loading: false,
              error: "Failed to load trends",
            };
            return updated;
          });
        });
    });
  }, [selectedInterests]);

  const allLoaded = interestTrends.every((it) => !it.loading);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Here&apos;s what&apos;s trending in your topics
        </h1>
        <p className="text-gray-400">
          These are real-time trends across Twitter, Reddit, LinkedIn, and more—updated every hour.
        </p>
        <p className="text-xs text-gray-500 mt-1">
            Pick any topic to see its Viral Score and create content around it.
        </p>
      </div>

      {/* Trends Grid */}
      <div className="space-y-6">
        {interestTrends.map((interestTrend, index) => {
          const Icon = interestTrend.interest.icon;

          return (
            <motion.div
              key={interestTrend.interest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-[#343a40] rounded-xl border-2 border-gray-700/50 p-6"
            >
              {/* Interest Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-coral-500/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-coral-400" weight="duotone" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {interestTrend.interest.label}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Based on: {interestTrend.interest.keywords.join(", ")}
                  </p>
                </div>
              </div>

              {/* Loading State */}
              {interestTrend.loading && (
                <div className="flex items-center justify-center py-8">
                  <BouncingDots className="bg-coral-400" />
                  <span className="ml-2 text-gray-400">
                    Finding trending topics...
                  </span>
                </div>
              )}

              {/* Error State */}
              {interestTrend.error && (
                <div className="flex items-center gap-2 py-4 text-amber-400">
                  <AlertCircle className="w-5 h-5" weight="duotone" />
                  <span className="text-sm">{interestTrend.error}</span>
                </div>
              )}

              {/* Trends List */}
              {!interestTrend.loading && !interestTrend.error && (
                <div className="space-y-3">
                  {interestTrend.trends.map((trend, trendIndex) => (
                    <motion.div
                      key={trendIndex}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: trendIndex * 0.1 }}
                      className="bg-[#2b2b2b] rounded-lg p-4 border border-gray-700/30 hover:border-coral-500/50 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-4 h-4 text-coral-400 group-hover:scale-110 transition-transform" weight="duotone" />
                            <h4 className="text-white font-medium group-hover:text-coral-400 transition-colors">
                              {trend.title}
                            </h4>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">
                            {trend.formattedTraffic}
                          </p>
                          {trend.viralDNA && (
                            <div className="flex gap-1.5 flex-wrap">
                                <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                    🪝 {trend.viralDNA.hookType}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                    ❤️ {trend.viralDNA.primaryEmotion}
                                </span>
                            </div>
                          )}
                        </div>

                        {/* Viral Score Badge */}
                        <div className="flex flex-col items-end gap-1">
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                              trend.viralPotential === "high"
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : trend.viralPotential === "medium"
                                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                  : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                            }`}
                          >
                            <span>{getViralScoreEmoji(trend.viralPotential)}</span>
                            <span>{formatViralScore(trend.viralScore)}</span>
                          </div>
                          <span className="text-xs text-gray-500 capitalize">
                            {trend.viralPotential} potential
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Info Box */}
      {allLoaded && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-coral-500/10 border border-coral-500/30 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <MagicWand className="w-5 h-5 text-coral-400 mt-0.5 flex-shrink-0" weight="duotone" />
            <div>
              <h4 className="text-sm font-semibold text-coral-400 mb-1">
                What is Viral Score™?
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Our AI predicts how well content on these topics will perform
                (0-100 score). Based on search volume, trend velocity, proven viral
                patterns, and freshness. Higher scores = higher viral
                potential.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-4">
        <motion.button
          onClick={onBack}
          className="flex-1 h-14 rounded-xl font-semibold text-lg transition-all duration-200 bg-transparent text-gray-300 border-2 border-gray-700 hover:bg-gray-700/30 hover:border-gray-600"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          ← Back to Interests
        </motion.button>

        <motion.button
          onClick={onNext}
          disabled={!allLoaded}
          className={`flex-1 h-14 rounded-xl font-semibold text-lg transition-all duration-200 ${
            allLoaded
              ? "bg-coral-500 hover:bg-coral-600 text-white shadow-lg hover:shadow-xl"
              : "bg-gray-700 text-gray-500 cursor-not-allowed"
          }`}
          whileHover={allLoaded ? { scale: 1.02 } : {}}
          whileTap={allLoaded ? { scale: 0.98 } : {}}
        >
          {allLoaded ? "Next: Complete Profile →" : "Loading trends..."}
        </motion.button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        You can explore more topics anytime from your dashboard
      </p>
    </div>
  );
}
