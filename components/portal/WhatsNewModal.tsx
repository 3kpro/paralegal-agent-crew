"use client";

import { Bell } from "@phosphor-icons/react";

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LATEST_UPDATE_DATE = "November 5, 2025";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  checklist?: string[];
}

function FeatureCard({ icon, title, description, checklist }: FeatureCardProps) {
  return (
    <div className="bg-[#2b2b2b] border border-gray-700/50 rounded-lg p-5">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
          <p className="text-gray-300 text-sm mb-3">{description}</p>
          {checklist && (
            <div className="space-y-2">
              {checklist.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">✓</span>
                  <span className="text-sm text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function WhatsNewModal({ isOpen, onClose }: WhatsNewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#343a40] border-2 border-coral-500/50 rounded-xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-coral-500/20 to-purple-500/20 border-b border-coral-500/30 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-coral-400" weight="duotone" />
              <h2 className="text-2xl font-bold text-white">What's New</h2>
              <span className="text-xs px-2 py-1 bg-coral-500/20 border border-coral-500/30 rounded-full text-coral-300">
                {LATEST_UPDATE_DATE}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close What's New modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          <FeatureCard
            icon="📡"
            title="Real-Time Signal Tracking"
            description="XELORA monitors emerging signals across 6+ platforms to identify trends before they peak. Predictive momentum detection in real-time."
            checklist={[
              "Multi-platform signal analysis",
              "Emerging trend identification",
              "Momentum prediction algorithms"
            ]}
          />

          <FeatureCard
            icon="🔥"
            title="Virality Engineering"
            description="Optimize content for maximum engagement. XELORA analyzes what makes content viral and helps you engineer your next breakthrough moment."
            checklist={[
              "Viral score prediction",
              "Content optimization suggestions",
              "Timing intelligence for maximum reach"
            ]}
          />

          <FeatureCard
            icon="🌍"
            title="6+ Platform Integration"
            description="Publish your optimized content across Twitter, LinkedIn, Facebook, Instagram, TikTok, and Reddit from a single dashboard."
          />

          <FeatureCard
            icon="⚡"
            title="Now in Beta"
            description="XELORA is actively being enhanced with advanced features and signal analysis improvements. Your feedback shapes the future."
          />
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-700/50 p-4 bg-[#2b2b2b]">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-coral-500 hover:bg-coral-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
