"use client";

import { motion } from "framer-motion";
import { Send, Lock } from "lucide-react";
import { useState } from "react";

interface PublishButtonProps {
  content?: string;
  campaignId?: string;
  socialAccountIds?: string[];
  onPublishSuccess?: (results: any) => void;
  onPublishError?: (error: string) => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

export default function PublishButton({
  content,
  campaignId,
  socialAccountIds,
  onPublishSuccess,
  onPublishError,
  disabled = false,
  variant = "primary",
  size = "md",
}: PublishButtonProps) {
  const [loading, setLoading] = useState(false);

  const buttonSizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  const handlePublish = async () => {
    if (!content) return;
    
    // Auto-detect social accounts if not provided
    // Ideally, these should be passed. If not, we can't publish safely.
    // For now, if no accounts passed, we might error or try to fetch? 
    // Trying to fetch active accounts here is too complex. 
    // We will assume they are passed or validation happens server-side (if server infers).
    // API requires social_account_ids.
    
    if (!socialAccountIds || socialAccountIds.length === 0) {
        // Fallback: This allows Testing if the parent didn't implement selection yet.
        // We'll let the user know.
        onPublishError?.("No social accounts selected for publishing.");
        return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/social-publishing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          campaign_id: campaignId,
          social_account_ids: socialAccountIds, 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to publish");
      }

      onPublishSuccess?.(data);

    } catch (error) {
      onPublishError?.(error instanceof Error ? error.message : "Failed to publish");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      disabled={disabled || loading}
      onClick={handlePublish}
      className={`
        ${buttonSizes[size]}
        ${variant === 'primary' ? 'bg-coral-500 hover:bg-coral-600 text-white' : 'bg-gray-700 text-white'}
        font-semibold rounded-lg transition-all duration-200
        flex items-center gap-2
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'shadow-lg shadow-coral-500/20'}
      `}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <Send className="w-4 h-4" />
      )}
      {loading ? 'Publishing...' : 'Publish Now'}
    </motion.button>
  );
}
