"use client";

import Tooltip from "./ui/Tooltip";
import { MagicWand, TrendUp as TrendingUp, Lightning as Zap, Target, Question as HelpCircle } from "@phosphor-icons/react";

/**
 * Pre-configured tooltips for first-time users
 * Based on XELORA_ONBOARDING_COPY.md specifications
 */

export function ViralScoreTooltip({ children }: { children?: React.ReactNode }) {
  return (
    <Tooltip
      title="Viral Score™"
      content={
        <div className="space-y-2">
          <p>This number (0-100) predicts how likely your content is to go viral.</p>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span>0-40: Low engagement expected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span>41-70: Moderate engagement</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span>71-100: High viral potential</span>
            </div>
          </div>
          <p className="text-xs text-tron-cyan mt-2">
            Our algorithm is 87% accurate based on 1M+ analyzed posts.
          </p>
        </div>
      }
      icon={<MagicWand className="w-4 h-4" weight="duotone" />}
      storageKey="viral_score"
      dismissible={true}
    >
      {children}
    </Tooltip>
  );
}

export function TrendingTopicsTooltip({ children }: { children?: React.ReactNode }) {
  return (
    <Tooltip
      title="Trending Topics"
      content={
        <div className="space-y-2">
          <p>These topics are currently exploding across platforms:</p>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span>🔥</span>
              <span><strong>Hot</strong> = Rising fast (post within 6 hours)</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📈</span>
              <span><strong>Trending</strong> = Sustained interest (post within 24 hours)</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🌱</span>
              <span><strong>Emerging</strong> = Early trend (get ahead of the curve)</span>
            </div>
          </div>
          <p className="text-xs text-tron-cyan mt-2">
            We update these every hour so you're always first to the trend.
          </p>
        </div>
      }
      icon={<TrendingUp className="w-4 h-4" weight="duotone" />}
      storageKey="trending_topics"
      dismissible={true}
    >
      {children}
    </Tooltip>
  );
}

export function AIContentGeneratorTooltip({ children }: { children?: React.ReactNode }) {
  return (
    <Tooltip
      title="AI Content Generator"
      content={
        <div className="space-y-2">
          <p>Our AI writes platform-specific content optimized for engagement:</p>
          <div className="space-y-1 text-xs">
            <div>• <strong>Twitter:</strong> Threads + hooks</div>
            <div>• <strong>LinkedIn:</strong> Professional posts</div>
            <div>• <strong>Reddit:</strong> Community-appropriate copy</div>
            <div>• <strong>TikTok:</strong> Script ideas</div>
          </div>
          <p className="text-xs text-tron-cyan mt-2">
            You can edit everything before posting!
          </p>
        </div>
      }
      icon={<Zap className="w-4 h-4" weight="duotone" />}
      storageKey="ai_content_generator"
      dismissible={true}
    >
      {children}
    </Tooltip>
  );
}

export function PlatformTargetingTooltip({ children }: { children?: React.ReactNode }) {
  return (
    <Tooltip
      title="Platform Targeting"
      content={
        <div className="space-y-2">
          <p>Select which social platforms you want to target with this campaign.</p>
          <p className="text-xs">
            XELORA will generate optimized content for each platform you select,
            adapting tone, length, and format automatically.
          </p>
          <p className="text-xs text-tron-cyan mt-2">
            Tip: Start with 1-2 platforms, then expand as you grow!
          </p>
        </div>
      }
      icon={<Target className="w-4 h-4" weight="duotone" />}
      storageKey="platform_targeting"
      dismissible={true}
    >
      {children}
    </Tooltip>
  );
}

export function CampaignStatusTooltip({ children }: { children?: React.ReactNode }) {
  return (
    <Tooltip
      title="Campaign Status"
      content={
        <div className="space-y-2">
          <div className="space-y-1 text-xs">
            <div><strong>Draft:</strong> Campaign is being created</div>
            <div><strong>Ready:</strong> Content generated, ready to publish</div>
            <div><strong>Scheduled:</strong> Will publish automatically at set time</div>
            <div><strong>Published:</strong> Live on your platforms</div>
          </div>
          <p className="text-xs text-tron-cyan mt-2">
            You control when and how your content goes live.
          </p>
        </div>
      }
      dismissible={true}
      storageKey="campaign_status"
    >
      {children}
    </Tooltip>
  );
}

// Quick Help Banner for first-time users
export function FirstTimeHelpBanner() {
  const hasSeenBanner =
    typeof window !== "undefined" &&
    localStorage.getItem("first_time_help_banner_dismissed") === "true";

  if (hasSeenBanner) return null;

  const handleDismiss = () => {
    localStorage.setItem("first_time_help_banner_dismissed", "true");
    window.location.reload(); // Simple reload to hide banner
  };

  const handleTakeTour = () => {
    // Navigate to onboarding with tour query parameter to bypass middleware check
    window.location.href = "/onboarding?tour=true";
  };

  return (
    <div className="bg-gradient-to-r from-tron-cyan/10 to-purple-500/10 border border-tron-cyan/30 rounded-lg p-4 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <MagicWand className="w-5 h-5 text-tron-cyan" weight="duotone" />
            <h3 className="font-bold text-white">New to XELORA?</h3>
          </div>
          <p className="text-sm text-gray-300 mb-3">
            Want a quick walkthrough of all features? Take our interactive product tour!
          </p>
          <button
            onClick={handleTakeTour}
            className="text-sm px-4 py-2 bg-tron-cyan/20 hover:bg-tron-cyan/30 border border-tron-cyan/50 rounded-lg text-tron-cyan hover:text-white transition-colors"
          >
            Take Product Tour →
          </button>
        </div>
        <button
          onClick={handleDismiss}
          className="text-sm text-gray-400 hover:text-white transition-colors whitespace-nowrap"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}


