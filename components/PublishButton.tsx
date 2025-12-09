"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";

interface PublishButtonProps {
  content?: string;
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
  const buttonSizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  const buttonVariants = {
    primary: "bg-gray-600 text-white cursor-not-allowed",
    secondary:
      "bg-tron-grid border border-gray-500/30 text-gray-400 cursor-not-allowed",
  };

  return (
    <motion.button
      whileHover={{ scale: 1 }}
      whileTap={{ scale: 0.95 }}
      disabled={true}
      title="Publishing will be available after OAuth implementation"
      className={`
        ${buttonSizes[size]}
        ${buttonVariants[variant]}
        font-semibold rounded-lg transition-all duration-200
        flex items-center gap-2 opacity-60
      `}
    >
      <Lock className="w-4 h-4" />
      Coming Soon
    </motion.button>
  );
}
