"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, WarningCircle as AlertCircle, Play, Lock, Users, Chat as MessageSquare, Copy, Scissors, CurrencyDollar as DollarSign, TiktokLogo } from "@phosphor-icons/react";
import { OrbitalLoader } from "@/components/ui/orbital-loader";

interface TikTokCreatorInfo {
  creator_avatar_url: string;
  creator_username: string;
  creator_nickname: string;
  privacy_level_options: string[];
  comment_disabled: boolean;
  duet_disabled: boolean;
  stitch_disabled: boolean;
  max_video_post_duration_sec: number;
}

interface TikTokPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (metadata: TikTokPublishMetadata) => void;
  connectionId: string;
  videoUrl?: string;
  caption: string;
  videoDuration?: number;
}

export interface TikTokPublishMetadata {
  privacy_level: string;
  disable_comment: boolean;
  disable_duet: boolean;
  disable_stitch: boolean;
  brand_content_toggle: boolean;
  brand_organic_toggle: boolean;
}

export default function TikTokPublishModal({
  isOpen,
  onClose,
  onPublish,
  connectionId,
  videoUrl,
  caption,
  videoDuration = 0,
}: TikTokPublishModalProps) {
  const [creatorInfo, setCreatorInfo] = useState<TikTokCreatorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TikTok metadata (per UX guidelines)
  const [privacyLevel, setPrivacyLevel] = useState<string>("");
  const [disableComment, setDisableComment] = useState(false);
  const [disableDuet, setDisableDuet] = useState(false);
  const [disableStitch, setDisableStitch] = useState(false);
  const [brandContentToggle, setBrandContentToggle] = useState(false); // Point 3: OFF by default

  // Fetch creator info (Point 1)
  useEffect(() => {
    if (isOpen && connectionId) {
      fetchCreatorInfo();
    }
  }, [isOpen, connectionId]);

  const fetchCreatorInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/tiktok/creator-info?connection_id=${connectionId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch creator info");
      }

      setCreatorInfo(data.creator_info);
      console.log("[TikTok Publish Modal] Creator info loaded:", data.creator_info);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("[TikTok Publish Modal] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = () => {
    // Validate required fields (Point 2: User must select privacy)
    if (!privacyLevel) {
      setError("Please select a privacy level");
      return;
    }

    // Point 1: Check video duration
    if (creatorInfo && videoDuration > creatorInfo.max_video_post_duration_sec) {
      setError(`Video duration (${videoDuration}s) exceeds maximum allowed (${creatorInfo.max_video_post_duration_sec}s)`);
      return;
    }

    const metadata: TikTokPublishMetadata = {
      privacy_level: privacyLevel,
      disable_comment: disableComment,
      disable_duet: disableDuet,
      disable_stitch: disableStitch,
      brand_content_toggle: brandContentToggle,
      brand_organic_toggle: brandContentToggle, // Same as brand_content_toggle typically
    };

    onPublish(metadata);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-tron-dark border-2 border-tron-cyan/30 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <TiktokLogo className="w-8 h-8" weight="duotone" />
                Post to TikTok
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} weight="duotone" />
              </button>
            </div>

            {loading && (
              <div className="text-center py-8">
                <OrbitalLoader className="w-10 h-10 text-tron-cyan mx-auto" />
                <p className="text-gray-400">Loading creator info...</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" weight="duotone" />
                <div>
                  <p className="text-red-400 font-semibold">Error</p>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </div>
            )}

            {!loading && creatorInfo && (
              <div className="space-y-6">
                {/* Point 1: Display Creator Info */}
                <div className="bg-tron-grid/50 border border-tron-cyan/20 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    {creatorInfo.creator_avatar_url && (
                      <img
                        src={creatorInfo.creator_avatar_url}
                        alt={creatorInfo.creator_username}
                        className="w-12 h-12 rounded-full"
                      />
                    )}
                    <div>
                      <p className="text-white font-semibold">{creatorInfo.creator_nickname}</p>
                      <p className="text-gray-400 text-sm">@{creatorInfo.creator_username}</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs mt-2">
                    Posting as this TikTok account
                  </p>
                </div>

                {/* Point 5: Video Preview */}
                {videoUrl && (
                  <div className="bg-tron-grid/50 border border-tron-cyan/20 rounded-lg p-4">
                    <p className="text-white font-semibold mb-2 flex items-center gap-2">
                      <Play size={16} weight="duotone" />
                      Video Preview
                    </p>
                    <video
                      src={videoUrl}
                      controls
                      className="w-full rounded-lg max-h-60"
                    />
                  </div>
                )}

                {/* Point 5: Editable Caption */}
                <div>
                  <label className="text-white font-semibold mb-2 block">
                    Caption
                  </label>
                  <textarea
                    value={caption}
                    readOnly
                    className="w-full bg-tron-grid/50 border border-tron-cyan/20 rounded-lg p-3 text-white resize-none"
                    rows={3}
                    placeholder="Enter your caption..."
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    Caption can be edited before posting
                  </p>
                </div>

                {/* Point 2: Privacy Level (NO DEFAULT - User must select) */}
                <div>
                  <label className="text-white font-semibold mb-2 block flex items-center gap-2">
                    <Lock size={16} weight="duotone" />
                    Privacy Level <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={privacyLevel}
                    onChange={(e) => setPrivacyLevel(e.target.value)}
                    className="w-full bg-tron-grid/50 border border-tron-cyan/20 rounded-lg p-3 text-white"
                  >
                    <option value="">Select privacy level...</option>
                    {creatorInfo.privacy_level_options?.map((option) => (
                      <option key={option} value={option}>
                        {option === "PUBLIC_TO_EVERYONE" && "Public"}
                        {option === "MUTUAL_FOLLOW_FRIENDS" && "Friends"}
                        {option === "SELF_ONLY" && "Private"}
                        {!["PUBLIC_TO_EVERYONE", "MUTUAL_FOLLOW_FRIENDS", "SELF_ONLY"].includes(option) && option}
                      </option>
                    ))}
                  </select>
                  <p className="text-gray-400 text-xs mt-1">
                    Choose who can see this video
                  </p>
                </div>

                {/* Point 2: Interaction Settings (OFF by default, disabled if app settings disabled) */}
                <div className="space-y-3">
                  <p className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Users size={16} weight="duotone" />
                    Allow Interactions
                  </p>

                  <label className={`flex items-center gap-3 p-3 rounded-lg border ${
                    creatorInfo.comment_disabled
                      ? "bg-gray-800/30 border-gray-700/30 cursor-not-allowed"
                      : "bg-tron-grid/50 border-tron-cyan/20 cursor-pointer"
                  }`}>
                    <input
                      type="checkbox"
                      checked={!disableComment}
                      onChange={(e) => setDisableComment(!e.target.checked)}
                      disabled={creatorInfo.comment_disabled}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <MessageSquare size={16} className="text-tron-cyan" weight="duotone" />
                        <span className="text-white">Comments</span>
                      </div>
                      {creatorInfo.comment_disabled && (
                        <p className="text-xs text-gray-500">Disabled in your TikTok app settings</p>
                      )}
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-3 rounded-lg border ${
                    creatorInfo.duet_disabled
                      ? "bg-gray-800/30 border-gray-700/30 cursor-not-allowed"
                      : "bg-tron-grid/50 border-tron-cyan/20 cursor-pointer"
                  }`}>
                    <input
                      type="checkbox"
                      checked={!disableDuet}
                      onChange={(e) => setDisableDuet(!e.target.checked)}
                      disabled={creatorInfo.duet_disabled}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Copy size={16} className="text-tron-cyan" weight="duotone" />
                        <span className="text-white">Duet</span>
                      </div>
                      {creatorInfo.duet_disabled && (
                        <p className="text-xs text-gray-500">Disabled in your TikTok app settings</p>
                      )}
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-3 rounded-lg border ${
                    creatorInfo.stitch_disabled
                      ? "bg-gray-800/30 border-gray-700/30 cursor-not-allowed"
                      : "bg-tron-grid/50 border-tron-cyan/20 cursor-pointer"
                  }`}>
                    <input
                      type="checkbox"
                      checked={!disableStitch}
                      onChange={(e) => setDisableStitch(!e.target.checked)}
                      disabled={creatorInfo.stitch_disabled}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Scissors size={16} className="text-tron-cyan" weight="duotone" />
                        <span className="text-white">Stitch</span>
                      </div>
                      {creatorInfo.stitch_disabled && (
                        <p className="text-xs text-gray-500">Disabled in your TikTok app settings</p>
                      )}
                    </div>
                  </label>

                  <p className="text-gray-400 text-xs">
                    All interaction settings are off by default. Turn on the ones you want to allow.
                  </p>
                </div>

                {/* Point 3: Commercial Content Disclosure (OFF by default) */}
                <div className="bg-tron-grid/50 border border-tron-cyan/20 rounded-lg p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={brandContentToggle}
                      onChange={(e) => setBrandContentToggle(e.target.checked)}
                      className="w-5 h-5 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign size={16} className="text-yellow-400" weight="duotone" />
                        <span className="text-white font-semibold">Branded Content</span>
                      </div>
                      <p className="text-gray-400 text-sm">
                        This content promotes a brand, product, or service. Your video will be labeled as promotional content.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Point 5: User Consent & Processing Notice */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-blue-300 text-sm">
                    <strong>Note:</strong> After publishing, it may take a few minutes for your content to process and appear on your TikTok profile.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePublish}
                    disabled={!privacyLevel}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-tron-cyan to-tron-magenta hover:opacity-90 text-white font-semibold rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Post to TikTok
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
