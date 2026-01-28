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
    <div className="bg-muted border border-border rounded-lg p-5">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm mb-3">{description}</p>
          {checklist && (
            <div className="space-y-2">
              {checklist.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-foreground mt-0.5">✓</span>
                  <span className="text-sm text-muted-foreground">{item}</span>
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
      <div className="bg-card border-2 border-border rounded-xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-muted border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-foreground" weight="duotone" />
              <h2 className="text-2xl font-bold text-foreground">What's New</h2>
              <span className="text-xs px-2 py-1 bg-primary/10 border border-border rounded-full text-foreground">
                {LATEST_UPDATE_DATE}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
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
        <div className="border-t border-border p-4 bg-muted">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-lg font-semibold transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
