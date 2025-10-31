"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
  Send,
  Calendar,
  Users,
  Check,
  X,
  Loader2,
  AlertCircle,
  Clock,
  Share,
  ChevronDown,
  ChevronUp,
  Settings,
} from "lucide-react";

interface SocialAccount {
  id: string;
  platform: string;
  account_name: string;
  account_handle?: string;
  is_active: boolean;
  is_verified: boolean;
}

interface PublishButtonProps {
  content: string;
  campaignId?: string;
  onPublishSuccess?: (results: any) => void;
  onPublishError?: (error: string) => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

export default function PublishButton({
  content,
  campaignId,
  onPublishSuccess,
  onPublishError,
  disabled = false,
  variant = "primary",
  size = "md",
}: PublishButtonProps) {
  const supabase = createClient();
  const [showModal, setShowModal] = useState(false);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showModal) {
      loadSocialAccounts();
    }
  }, [showModal]);

  async function loadSocialAccounts() {
    setLoading(true);
    try {
      const response = await fetch("/api/social-accounts");
      const result = await response.json();

      if (result.success) {
        const activeAccounts = result.accounts.filter(
          (acc: SocialAccount) => acc.is_active,
        );
        setSocialAccounts(activeAccounts);
        // Pre-select all active accounts
        setSelectedAccounts(activeAccounts.map((acc: SocialAccount) => acc.id));
      }
    } catch (error) {
      console.error("Failed to load social accounts:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish() {
    if (selectedAccounts.length === 0) {
      onPublishError?.("Please select at least one social account");
      return;
    }

    if (!content || content.trim().length === 0) {
      onPublishError?.("Content cannot be empty");
      return;
    }

    setPublishing(true);
    try {
      const publishData: any = {
        social_account_ids: selectedAccounts,
        content: content.trim(),
        campaign_id: campaignId,
      };

      // Add scheduling if set
      if (isScheduled && scheduledDate && scheduledTime) {
        const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
        if (scheduledDateTime > new Date()) {
          publishData.scheduled_for = scheduledDateTime.toISOString();
        } else {
          onPublishError?.("Scheduled time must be in the future");
          setPublishing(false);
          return;
        }
      }

      const response = await fetch("/api/social-publishing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(publishData),
      });

      const result = await response.json();

      if (result.success) {
        onPublishSuccess?.(result);
        setShowModal(false);

        // Reset form
        setSelectedAccounts([]);
        setIsScheduled(false);
        setScheduledDate("");
        setScheduledTime("");
      } else {
        onPublishError?.(result.error || "Publishing failed");
      }
    } catch (error) {
      console.error("Publishing error:", error);
      onPublishError?.("Network error occurred");
    } finally {
      setPublishing(false);
    }
  }

  function toggleAccountSelection(accountId: string) {
    setSelectedAccounts((prev) =>
      prev.includes(accountId)
        ? prev.filter((id) => id !== accountId)
        : [...prev, accountId],
    );
  }

  const buttonSizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  const buttonVariants = {
    primary: "bg-tron-cyan hover:bg-tron-cyan/80 text-tron-dark",
    secondary:
      "bg-tron-grid hover:bg-tron-dark border border-tron-cyan/30 text-tron-text",
  };

  const minDateTime = new Date();
  minDateTime.setMinutes(minDateTime.getMinutes() + 5); // Minimum 5 minutes from now
  const minDate = minDateTime.toISOString().split("T")[0];
  const minTime = minDateTime.toTimeString().slice(0, 5);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowModal(true)}
        disabled={disabled || !content?.trim()}
        className={`
          ${buttonSizes[size]} 
          ${buttonVariants[variant]}
          font-semibold rounded-lg transition-all duration-200 
          flex items-center gap-2 
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        `}
      >
        <Send className="w-4 h-4" />
        Publish
      </motion.button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-tron-grid border border-tron-cyan/30 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-tron-text flex items-center gap-2">
                  <Share className="w-5 h-5 text-tron-cyan" />
                  Publish to Social Media
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-tron-text-muted hover:text-tron-text transition-colors"
                  title="Close modal"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-tron-cyan" />
                  <p className="text-tron-text-muted">
                    Loading social accounts...
                  </p>
                </div>
              ) : socialAccounts.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-tron-cyan/50 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-tron-text mb-2">
                    No Social Accounts Connected
                  </h4>
                  <p className="text-tron-text-muted mb-4">
                    Connect your social media accounts to publish campaigns
                  </p>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      window.location.href = "/social-accounts";
                    }}
                    className="bg-tron-cyan hover:bg-tron-cyan/80 text-tron-dark px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Settings className="w-4 h-4" />
                    Connect Accounts
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Content Preview */}
                  <div>
                    <label className="block text-sm font-medium text-tron-text mb-2">
                      Content to Publish
                    </label>
                    <div className="bg-tron-dark/50 border border-tron-cyan/20 rounded-lg p-4 max-h-32 overflow-y-auto">
                      <p className="text-sm text-tron-text whitespace-pre-wrap">
                        {content}
                      </p>
                    </div>
                    <p className="text-xs text-tron-text-muted mt-1">
                      {content.length} characters
                    </p>
                  </div>

                  {/* Social Account Selection */}
                  <div>
                    <label className="block text-sm font-medium text-tron-text mb-3">
                      Select Social Accounts ({selectedAccounts.length}{" "}
                      selected)
                    </label>
                    <div className="space-y-2">
                      {socialAccounts.map((account) => {
                        const isSelected = selectedAccounts.includes(
                          account.id,
                        );
                        return (
                          <label
                            key={account.id}
                            className={`
                              flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                              ${
                                isSelected
                                  ? "bg-tron-cyan/20 border-tron-cyan/50"
                                  : "bg-tron-dark/50 border-tron-cyan/20 hover:border-tron-cyan/40"
                              }
                            `}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() =>
                                toggleAccountSelection(account.id)
                              }
                              className="w-4 h-4 text-tron-cyan bg-tron-dark border-tron-cyan/30 rounded focus:ring-tron-cyan"
                            />

                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-tron-text">
                                  {account.account_name}
                                </span>
                                {account.is_verified && (
                                  <Check className="w-4 h-4 text-green-400" />
                                )}
                              </div>
                              <p className="text-sm text-tron-text-muted">
                                {account.account_handle} • {account.platform}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Scheduling Options */}
                  <div>
                    <label className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        checked={isScheduled}
                        onChange={(e) => setIsScheduled(e.target.checked)}
                        className="w-4 h-4 text-tron-cyan bg-tron-dark border-tron-cyan/30 rounded focus:ring-tron-cyan"
                      />
                      <span className="text-sm font-medium text-tron-text">
                        Schedule for later
                      </span>
                    </label>

                    {isScheduled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-2 gap-3"
                      >
                        <div>
                          <label
                            className="block text-sm text-tron-text-muted mb-1"
                            htmlFor="scheduled-date"
                          >
                            Date
                          </label>
                          <input
                            id="scheduled-date"
                            type="date"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            min={minDate}
                            title="Select date for scheduled posting"
                            className="w-full p-2 bg-tron-dark border border-tron-cyan/30 rounded-lg text-tron-text focus:border-tron-cyan focus:outline-none"
                          />
                        </div>
                        <div>
                          <label
                            className="block text-sm text-tron-text-muted mb-1"
                            htmlFor="scheduled-time"
                          >
                            Time
                          </label>
                          <input
                            id="scheduled-time"
                            type="time"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            min={
                              scheduledDate === minDate ? minTime : undefined
                            }
                            title="Select time for scheduled posting"
                            className="w-full p-2 bg-tron-dark border border-tron-cyan/30 rounded-lg text-tron-text focus:border-tron-cyan focus:outline-none"
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-tron-cyan/20">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-tron-text-muted hover:text-tron-text transition-colors"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handlePublish}
                      disabled={selectedAccounts.length === 0 || publishing}
                      className="bg-tron-cyan hover:bg-tron-cyan/80 disabled:bg-tron-cyan/30 disabled:cursor-not-allowed text-tron-dark px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                    >
                      {publishing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {isScheduled ? "Scheduling..." : "Publishing..."}
                        </>
                      ) : (
                        <>
                          {isScheduled ? (
                            <Clock className="w-4 h-4" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          {isScheduled ? "Schedule Post" : "Publish Now"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
