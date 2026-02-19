"use client";

import { motion } from "framer-motion";
import { PaperPlaneRight as Send, Lock } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import TikTokPublishModal, { TikTokPublishMetadata } from "./TikTokPublishModal";
import { OrbitalLoader } from "@/components/ui/orbital-loader";

interface PublishButtonProps {
  content?: string;
  campaignId?: string;
  socialAccountIds?: string[];
  onPublishSuccess?: (results: any) => void;
  onPublishError?: (error: string) => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  videoUrl?: string;
  videoDuration?: number;
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
  videoUrl,
  videoDuration,
}: PublishButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showTikTokModal, setShowTikTokModal] = useState(false);
  const [tiktokAccountId, setTiktokAccountId] = useState<string | null>(null);

  const buttonSizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  // Check if any account is TikTok
  useEffect(() => {
    const checkForTikTok = async () => {
      if (!socialAccountIds || socialAccountIds.length === 0) return;

      try {
        const response = await fetch("/api/social-accounts");
        const data = await response.json();

        if (data.success && data.accounts) {
          const tiktokAccount = data.accounts.find(
            (acc: any) =>
              socialAccountIds.includes(acc.id) &&
              acc.platform === "tiktok"
          );

          if (tiktokAccount) {
            setTiktokAccountId(tiktokAccount.id);
          }
        }
      } catch (error) {
        console.error("Error checking for TikTok account:", error);
      }
    };

    checkForTikTok();
  }, [socialAccountIds]);

  const handlePublish = async () => {
    console.log("PublishButton clicked. Content present:", !!content, "Length:", content?.length);
    console.log("Social Account IDs:", socialAccountIds);
    console.log("TikTok Account ID:", tiktokAccountId);

    if (!content) {
       console.error("No content to publish.");
       alert("Error: No content to publish found.");
       onPublishError?.("No content to publish.");
       return;
    }

    if (!socialAccountIds || socialAccountIds.length === 0) {
        console.error("No social accounts selected.");
        alert("Error: No social accounts matched. Debug: " + JSON.stringify(socialAccountIds));
        onPublishError?.("No connected social accounts found matching the target platforms.");
        return;
    }

    // If publishing to TikTok, show the TikTok UX modal
    if (tiktokAccountId) {
      console.log("Opening TikTok publish modal...");
      setShowTikTokModal(true);
      return;
    }

    // Otherwise, proceed with normal publishing
    // We need to iterate through selected accounts and publish to each one
    // The new API endpoint handles one platform at a time
    await performPublish();
  };

  const handleTikTokPublish = async (metadata: TikTokPublishMetadata) => {
    setShowTikTokModal(false);
    await performPublish(metadata);
  };

  const performPublish = async (tiktokMetadata?: TikTokPublishMetadata) => {
    setLoading(true);
    try {
      console.log("Sending publish request...");
      
      // Get account details to know the platform
      const accountsResponse = await fetch("/api/social-accounts");
      const accountsData = await accountsResponse.json();
      
      if (!accountsData.success || !accountsData.accounts) {
        throw new Error("Failed to fetch account details");
      }

      const results = [];
      const errors = [];

      // Iterate through each selected account ID
      for (const accountId of socialAccountIds || []) {
        const account = accountsData.accounts.find((c: any) => c.id === accountId);
        
        if (!account) {
          console.error(`Account not found: ${accountId}`);
          errors.push(`Account ${accountId} not found`);
          continue;
        }

        const platform = account.platform; // e.g., 'twitter', 'linkedin'
        
        if (!platform) {
          errors.push(`Unknown platform for account ${accountId}`);
          continue;
        }

        console.log(`Publishing to ${platform}...`);

        const response = await fetch("/api/social/post", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            platform, // Required by new API
            content,
            campaignId: campaignId,
            // social_account_ids is NOT sent; auth is handled by backend using user session + platform
            // mediaUrls: [] // Add if we have media support in this button later
            tiktok_metadata: platform === 'tiktok' ? tiktokMetadata : undefined,
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          errors.push(`${platform}: ${data.error || "Failed"}`);
        } else {
          results.push(data);
        }
      }

      console.log("Publish results:", results);

      if (errors.length > 0) {
        throw new Error(errors.join(", "));
      }

      onPublishSuccess?.({ success: true, results });

    } catch (error) {
      console.error("Publish error:", error);
      alert("Publish Failed: " + (error instanceof Error ? error.message : String(error)));
      onPublishError?.(error instanceof Error ? error.message : "Failed to publish");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
          <OrbitalLoader className="w-5 h-5" />
        ) : (
          <Send className="w-4 h-4" weight="duotone" />
        )}
        {loading ? 'Publishing...' : 'Publish Now'}
      </motion.button>

      {/* TikTok Publish Modal */}
      {tiktokAccountId && (
        <TikTokPublishModal
          isOpen={showTikTokModal}
          onClose={() => setShowTikTokModal(false)}
          onPublish={handleTikTokPublish}
          connectionId={tiktokAccountId}
          videoUrl={videoUrl}
          caption={content || ""}
          videoDuration={videoDuration}
        />
      )}
    </>
  );
}
