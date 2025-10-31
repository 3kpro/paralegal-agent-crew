/**
 * GeneratedContentCard Component
 * 
 * Displays a single platform's generated content with edit functionality.
 * Includes character count, hashtags, and edit/save actions.
 * Memoized for performance optimization.
 */

import React, { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Edit3, Save, X } from "lucide-react";
import { Platform, GeneratedPlatformContent } from "../types";

interface GeneratedContentCardProps {
  platform: string;
  content: string | GeneratedPlatformContent;
  platformConfig: Platform;
  isEditing: boolean;
  editedContent: string | undefined;
  index: number;
  onEditToggle: (platform: string) => void;
  onSaveEdit: (platform: string) => void;
  onContentChange: (platform: string, content: string) => void;
}

/**
 * Helper function to extract content string from various formats
 */
const getContentString = (
  content: string | GeneratedPlatformContent
): string => {
  if (typeof content === "string") {
    return content;
  }
  return content?.content || "";
};

/**
 * Helper function to extract hashtags
 */
const getHashtags = (content: string | GeneratedPlatformContent): string[] => {
  if (typeof content === "string") {
    return [];
  }
  return content?.hashtags || [];
};

/**
 * Helper function to extract character count
 */
const getCharacterCount = (
  content: string | GeneratedPlatformContent
): number | undefined => {
  if (typeof content === "string") {
    return undefined;
  }
  return content?.characterCount;
};

/**
 * GeneratedContentCard - Memoized component for displaying platform content
 */
const GeneratedContentCard = memo<GeneratedContentCardProps>(
  ({
    platform,
    content,
    platformConfig,
    isEditing,
    editedContent,
    index,
    onEditToggle,
    onSaveEdit,
    onContentChange,
  }) => {
    const Icon = platformConfig.icon;

    const contentString = getContentString(content);
    const hashtags = getHashtags(content);
    const characterCount = getCharacterCount(content);

    const handleEditClick = useCallback(() => {
      onEditToggle(platform);
    }, [platform, onEditToggle]);

    const handleSaveClick = useCallback(() => {
      onSaveEdit(platform);
    }, [platform, onSaveEdit]);

    const handleContentChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onContentChange(platform, e.target.value);
      },
      [platform, onContentChange]
    );

    return (
      <motion.div
        key={platform}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className="group p-6 bg-gradient-to-br from-tron-dark/50 to-tron-dark/30 backdrop-blur-xl border-2 border-tron-cyan/30 rounded-2xl hover:border-tron-cyan/50 hover:shadow-xl hover:shadow-tron-cyan/20 transition-all"
      >
        {/* Header with platform info and actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-tron-cyan/10 rounded-xl group-hover:bg-tron-cyan/20 transition-colors">
              <Icon
                className="w-6 h-6 text-tron-cyan"
                aria-label={`${platformConfig.name} icon`}
              />
            </div>
            <span className="font-semibold text-tron-text capitalize text-lg">
              {platform}
            </span>
          </div>

          {/* Info and action buttons */}
          <div className="flex items-center gap-3">
            {/* Character count */}
            {characterCount && (
              <span
                className="text-xs text-tron-text-muted px-3 py-1 bg-tron-grid/50 rounded-full"
                aria-label={`Character count: ${characterCount}`}
              >
                {characterCount} chars
              </span>
            )}

            {/* Edit/Save actions */}
            {isEditing ? (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveClick}
                  className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors"
                  title="Save changes"
                  aria-label={`Save edits for ${platform} content`}
                >
                  <Save className="w-5 h-5" />
                </button>
                <button
                  onClick={handleEditClick}
                  className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  title="Cancel editing"
                  aria-label={`Cancel editing ${platform} content`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleEditClick}
                className="opacity-0 group-hover:opacity-100 p-2 text-tron-cyan hover:bg-tron-cyan/10 rounded-lg transition-all"
                title="Edit content"
                aria-label={`Edit ${platform} content`}
              >
                <Edit3 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content area */}
        {isEditing ? (
          <textarea
            value={editedContent !== undefined ? editedContent : contentString}
            onChange={handleContentChange}
            className="w-full min-h-[120px] p-4 bg-tron-grid/50 border-2 border-tron-cyan rounded-xl text-tron-text resize-y focus:ring-4 focus:ring-tron-cyan/20 focus:border-tron-cyan transition-all"
            placeholder="Edit your content..."
            aria-label={`Edit content for ${platform}`}
          />
        ) : (
          <p
            className="text-tron-text leading-relaxed whitespace-pre-wrap"
            role="article"
            aria-label={`Generated content for ${platform}`}
          >
            {contentString}
          </p>
        )}

        {/* Hashtags */}
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-tron-grid">
            {hashtags.map((tag: string) => (
              <span
                key={`${platform}-${tag}`}
                className="text-xs bg-tron-cyan/10 border border-tron-cyan/30 text-tron-cyan px-3 py-1 rounded-full"
                aria-label={`Hashtag: ${tag}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </motion.div>
    );
  }
);

GeneratedContentCard.displayName = "GeneratedContentCard";

export default GeneratedContentCard;