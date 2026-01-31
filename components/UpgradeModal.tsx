"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Check } from "lucide-react";
import Link from "next/link";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: "campaigns" | "generations" | "features";
  currentUsage?: {
    campaigns: number;
    campaignLimit: number;
  };
}

export default function UpgradeModal({
  isOpen,
  onClose,
  reason,
  currentUsage,
}: UpgradeModalProps) {
  const messages = {
    campaigns: {
      title: "Campaign Limit Reached",
      description: `You've created ${currentUsage?.campaigns || 5} campaigns this month (Free limit: ${currentUsage?.campaignLimit || 5}).`,
      benefit: "Upgrade to Pro for unlimited campaigns",
    },
    generations: {
      title: "Daily Generation Limit Reached",
      description: "You've used all your daily AI generations.",
      benefit: "Upgrade to Pro for unlimited daily generations",
    },
    features: {
      title: "Pro Feature",
      description: "This feature is only available on the Pro plan.",
      benefit: "Upgrade to unlock all features",
    },
  };

  const message = messages[reason];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-[#1a1a1a] rounded-2xl shadow-2xl max-w-lg w-full border-2 border-coral-500/30 overflow-hidden"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-br from-coral-500/20 to-tron-cyan/20 p-6 border-b border-gray-800">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-coral-500/20 rounded-lg">
                    <Zap className="w-6 h-6 text-coral-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    {message.title}
                  </h2>
                </div>
                <p className="text-gray-300 text-sm">{message.description}</p>
              </div>

              {/* Body */}
              <div className="p-6">
                {/* Benefit Highlight */}
                <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-3">
                    <Zap className="w-4 h-4" />
                    {message.benefit}
                  </div>
                  <ul className="space-y-2">
                    {[
                      "Unlimited campaigns per month",
                      "Unlimited trend searches per day",
                      "Priority AI generation",
                      "Export campaigns as markdown",
                      "Advanced content controls",
                    ].map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm text-gray-300"
                      >
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 border-2 border-gray-700 rounded-xl font-semibold text-gray-300 hover:bg-gray-800 transition-colors"
                  >
                    Maybe Later
                  </button>
                  <Link
                    href="/pricing"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-coral-500 to-tron-cyan rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-coral-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Upgrade to Pro
                  </Link>
                </div>

                {/* Pricing Note */}
                <p className="text-xs text-center text-gray-500 mt-4">
                  Starting at $29/month • Cancel anytime
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
