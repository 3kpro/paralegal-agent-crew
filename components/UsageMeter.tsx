"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { TrendingUp, Zap, Crown } from "lucide-react";

interface UsageData {
  tier: string;
  limits: {
    daily_generations: number;
    daily_tokens: number;
    monthly_campaigns: number;
  };
  usage: {
    generations: number;
    tokens: number;
    campaigns: number;
  };
  remaining: {
    generations: number;
    percentage_used: number;
  };
  can_generate: boolean;
}

export default function UsageMeter() {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsage();
  }, []);

  async function fetchUsage() {
    try {
      const response = await fetch("/api/usage");
      if (response.ok) {
        const data = await response.json();
        setUsageData(data);
      }
    } catch (error) {
      console.error("Error fetching usage:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-tron-grid border border-tron-cyan/30 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-tron-dark rounded w-1/2 mb-2"></div>
        <div className="h-8 bg-tron-dark rounded w-full"></div>
      </div>
    );
  }

  if (!usageData) return null;

  const isUnlimited = usageData.limits.daily_generations === -1;
  const percentageUsed = usageData.remaining.percentage_used;
  const isFree = usageData.tier === "free";
  const isNearLimit = percentageUsed >= 80 && !isUnlimited;

  // Color based on usage
  const getProgressColor = () => {
    if (isUnlimited) return "bg-gradient-to-r from-yellow-400 to-amber-500";
    if (percentageUsed >= 100) return "bg-red-500";
    if (percentageUsed >= 80) return "bg-amber-500";
    return "bg-tron-cyan";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-tron-grid border border-tron-cyan/30 rounded-xl p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-tron-cyan" />
          <h3 className="font-semibold text-tron-text">Daily Generations</h3>
        </div>
        <div className="flex items-center gap-2">
          {usageData.tier === "premium" && (
            <Crown className="w-4 h-4 text-amber-400" />
          )}
          <span className="text-xs px-2 py-1 bg-tron-cyan/20 text-tron-cyan rounded-full capitalize">
            {usageData.tier}
          </span>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="mb-3">
        {isUnlimited ? (
          <div className="text-center py-2">
            <div className="text-2xl font-bold text-amber-400 mb-1">
              Unlimited
            </div>
            <div className="text-xs text-tron-text-muted">
              Premium members enjoy unlimited generations
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-tron-text-muted">
                {usageData.usage.generations} of {usageData.limits.daily_generations} used
              </span>
              <span className="text-sm font-semibold text-tron-cyan">
                {usageData.remaining.generations} left
              </span>
            </div>

            {/* Progress Bar */}
            <div className="relative w-full h-2 bg-tron-dark rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(percentageUsed, 100)}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`h-full ${getProgressColor()}`}
              />
            </div>

            <div className="text-xs text-right text-tron-text-muted mt-1">
              {percentageUsed}% used
            </div>
          </>
        )}
      </div>

      {/* Warning/Upgrade Messages */}
      {!isUnlimited && (
        <>
          {percentageUsed >= 100 ? (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-300 mb-2">
                Daily limit reached! Resets at midnight.
              </p>
              <Link
                href="/settings?tab=membership"
                className="inline-flex items-center gap-1 text-sm text-red-400 hover:text-red-300 font-medium"
              >
                Upgrade for more <TrendingUp className="w-3 h-3" />
              </Link>
            </div>
          ) : isNearLimit ? (
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-sm text-amber-300 mb-2">
                Running low on generations!
              </p>
              <Link
                href="/settings?tab=membership"
                className="inline-flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300 font-medium"
              >
                Upgrade now <TrendingUp className="w-3 h-3" />
              </Link>
            </div>
          ) : isFree ? (
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-300 text-center">
                <strong>Free Tier:</strong> {usageData.limits.daily_generations} generations/day
              </p>
              <Link
                href="/settings?tab=membership"
                className="mt-2 w-full inline-block text-center text-sm text-blue-400 hover:text-blue-300 font-medium"
              >
                Get 25/day with Pro
              </Link>
            </div>
          ) : null}
        </>
      )}

      {/* Reset Timer */}
      <div className="mt-3 pt-3 border-t border-tron-cyan/20">
        <p className="text-xs text-center text-tron-text-muted">
          Resets daily at midnight {Intl.DateTimeFormat().resolvedOptions().timeZone}
        </p>
      </div>
    </motion.div>
  );
}
