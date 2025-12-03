"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, TrendingUp, Users, Clock, Sparkles, Lightbulb } from "lucide-react";
import { useState } from "react";

interface ViralScoreBreakdownProps {
  score: number;
  potential: 'high' | 'medium' | 'low';
  factors: {
    volume: number;        // 0-10
    multiSource: number;   // 0-10
    freshness: number;     // 0-10
    keywordBoost: number;  // 0-15
    aiAnalysis: number;    // 0-70
  };
  aiReasoning?: string;
  compact?: boolean;
}

export function ViralScoreBreakdown({
  score,
  potential,
  factors,
  aiReasoning,
  compact = false
}: ViralScoreBreakdownProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate what's working and what could improve
  const insights = generateInsights(factors, score);

  return (
    <div className="w-full">
      {/* Expandable Trigger */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-2 px-3 rounded-lg hover:bg-tron-grid/30 transition-colors text-sm"
      >
        <span className="text-tron-text-muted flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          {isExpanded ? "Hide" : "Show"} Score Breakdown
        </span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-tron-text-muted" />
        </motion.div>
      </button>

      {/* Breakdown Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-4 p-4 bg-tron-grid/20 rounded-lg border border-tron-cyan/20">

              {/* What's Working Section */}
              {insights.working.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    What's Working
                  </h4>
                  <ul className="space-y-1.5">
                    {insights.working.map((item, idx) => (
                      <li key={idx} className="text-xs text-tron-text-muted flex items-start gap-2">
                        <span className="text-green-400 mt-0.5">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Could Improve Section */}
              {insights.improvements.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Could Boost Score
                  </h4>
                  <ul className="space-y-1.5">
                    {insights.improvements.map((item, idx) => (
                      <li key={idx} className="text-xs text-tron-text-muted flex items-start gap-2">
                        <span className="text-yellow-400 mt-0.5">⚠</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Factor Breakdown */}
              <div className="pt-3 border-t border-tron-cyan/10">
                <h4 className="text-xs font-semibold text-tron-text-muted mb-3">Score Components</h4>
                <div className="space-y-2">
                  <FactorBar
                    icon={<Users className="w-3 h-3" />}
                    label="Audience Volume"
                    score={factors.volume}
                    max={10}
                    color="blue"
                  />
                  <FactorBar
                    icon={<TrendingUp className="w-3 h-3" />}
                    label="Multi-Platform"
                    score={factors.multiSource}
                    max={10}
                    color="purple"
                  />
                  <FactorBar
                    icon={<Clock className="w-3 h-3" />}
                    label="Trend Freshness"
                    score={factors.freshness}
                    max={10}
                    color="cyan"
                  />
                  <FactorBar
                    icon={<Sparkles className="w-3 h-3" />}
                    label="Hot Keywords"
                    score={factors.keywordBoost}
                    max={15}
                    color="yellow"
                  />
                  <FactorBar
                    icon={<Lightbulb className="w-3 h-3" />}
                    label="AI Content Analysis"
                    score={factors.aiAnalysis}
                    max={70}
                    color="green"
                  />
                </div>
              </div>

              {/* AI Reasoning */}
              {aiReasoning && (
                <div className="pt-3 border-t border-tron-cyan/10">
                  <p className="text-xs text-tron-text-muted italic">
                    <span className="font-semibold text-tron-cyan">AI Insight:</span> {aiReasoning}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Factor Bar Component
function FactorBar({
  icon,
  label,
  score,
  max,
  color
}: {
  icon: React.ReactNode;
  label: string;
  score: number;
  max: number;
  color: 'blue' | 'purple' | 'cyan' | 'yellow' | 'green';
}) {
  const percentage = (score / max) * 100;

  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    cyan: 'bg-tron-cyan',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500'
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-tron-text-muted">
          {icon}
          <span>{label}</span>
        </div>
        <span className="text-tron-text font-mono">
          {score}/{max}
        </span>
      </div>
      <div className="h-1.5 bg-tron-grid rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`h-full ${colorClasses[color]} rounded-full`}
        />
      </div>
    </div>
  );
}

// Generate actionable insights based on factors
function generateInsights(
  factors: ViralScoreBreakdownProps['factors'],
  totalScore: number
): { working: string[]; improvements: string[] } {
  const working: string[] = [];
  const improvements: string[] = [];

  // Volume analysis
  if (factors.volume >= 7) {
    working.push(`Strong audience volume (${factors.volume}/10 points)`);
  } else if (factors.volume >= 5) {
    improvements.push(`Moderate volume. Could gain +${10 - factors.volume} points with higher traffic topics`);
  } else {
    improvements.push(`Low volume topic. Look for trending searches with 100K+ monthly volume (+${10 - factors.volume} pts)`);
  }

  // Multi-source analysis
  if (factors.multiSource >= 10) {
    working.push("Trending across multiple platforms (max points)");
  } else if (factors.multiSource >= 5) {
    improvements.push(`Found on 2 platforms. Appearing on 3+ platforms adds +${10 - factors.multiSource} points`);
  } else {
    improvements.push(`Single platform trend. Cross-platform topics score +${10 - factors.multiSource} higher`);
  }

  // Freshness analysis
  if (factors.freshness >= 10) {
    working.push("Ultra-fresh trend (discovered within 4 hours)");
  } else if (factors.freshness >= 5) {
    improvements.push(`Trend is 4-24 hours old. Catching trends earlier adds +${10 - factors.freshness} points`);
  } else {
    improvements.push(`Older trend (24+ hours). Fresh trends within 4 hours score +10 points`);
  }

  // Keyword boost analysis
  if (factors.keywordBoost >= 10) {
    working.push("Contains high-velocity keywords (AI, crypto, viral triggers)");
  } else if (factors.keywordBoost >= 5) {
    working.push("Good topic structure (How-to/Why format)");
    improvements.push(`Add hot keywords (AI, GPT, crypto, hack, secret) for +${15 - factors.keywordBoost} bonus points`);
  } else {
    improvements.push(`No viral keywords. Use formats like "How to [X]" or add hot keywords (AI, crypto) for +15 points`);
  }

  // AI analysis
  if (factors.aiAnalysis >= 50) {
    working.push(`Excellent content hook and emotional appeal (${factors.aiAnalysis}/70 points)`);
  } else if (factors.aiAnalysis >= 30) {
    improvements.push(`Good content potential. Add stronger hook, emotional trigger, or broader appeal for +${70 - factors.aiAnalysis} points`);
  } else {
    improvements.push(`Weak content appeal. Focus on curiosity, fear/greed triggers, or universal problems for +${70 - factors.aiAnalysis} points`);
  }

  return { working, improvements };
}
