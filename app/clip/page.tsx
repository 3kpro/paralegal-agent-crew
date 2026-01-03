"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Copy, Check, TiktokLogo, InstagramLogo } from "@phosphor-icons/react";
import { XeloraLogo } from "@/components/XeloraLogo";

function ClipContent() {
  const searchParams = useSearchParams();
  const [content, setContent] = useState<string>("");
  const [platform, setPlatform] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const encodedContent = searchParams.get("c");
      const platformParam = searchParams.get("p") || "tiktok";

      if (encodedContent) {
        // Decode UTF-8 safe base64 content
        const binaryString = atob(decodeURIComponent(encodedContent));
        const bytes = Uint8Array.from(binaryString, char => char.charCodeAt(0));
        const decoded = new TextDecoder().decode(bytes);
        setContent(decoded);
        setPlatform(platformParam);
      } else {
        setError("No content found");
      }
    } catch {
      setError("Invalid content link");
    }
  }, [searchParams]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);

      // Vibrate on mobile if supported
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }

      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const PlatformIcon = platform === "tiktok" ? TiktokLogo : InstagramLogo;

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 text-lg">{error}</p>
          <p className="text-gray-500 mt-2">Generate a new QR code from XELORA</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-center border-b border-gray-800">
        <XeloraLogo size="sm" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 max-w-lg mx-auto w-full">
        {/* Platform Badge */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-full">
            <PlatformIcon className="w-5 h-5 text-white" weight="duotone" />
            <span className="text-sm text-gray-300 capitalize">{platform} Content</span>
          </div>
        </div>

        {/* Content Preview */}
        <div className="bg-gray-900/80 rounded-2xl border border-gray-800 p-4 mb-6 flex-1 max-h-[50vh] overflow-y-auto">
          <p className="text-gray-200 whitespace-pre-wrap text-sm leading-relaxed">
            {content}
          </p>
        </div>

        {/* Character Count */}
        <p className="text-center text-gray-500 text-xs mb-4">
          {content.length} characters
        </p>

        {/* Copy Button */}
        <motion.button
          onClick={handleCopy}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 transition-all ${
            copied
              ? "bg-green-500 text-white"
              : "bg-coral-500 text-white hover:bg-coral-600"
          }`}
        >
          {copied ? (
            <>
              <Check className="w-6 h-6" weight="bold" />
              Copied! Now paste in {platform}
            </>
          ) : (
            <>
              <Copy className="w-6 h-6" weight="duotone" />
              Tap to Copy
            </>
          )}
        </motion.button>

        {/* Instructions */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-gray-400 text-sm">
            {copied ? (
              <>Open {platform} and paste your content</>
            ) : (
              <>Tap the button above to copy to clipboard</>
            )}
          </p>
          {platform === "tiktok" && (
            <p className="text-gray-500 text-xs">
              TikTok → + → Text → Paste
            </p>
          )}
          {platform === "instagram" && (
            <p className="text-gray-500 text-xs">
              Instagram → Create → Story/Reel → Paste
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-8 text-center">
          <p className="text-gray-600 text-xs">
            Powered by XELORA Viral Score™
          </p>
        </div>
      </div>
    </div>
  );
}

// Loading fallback for Suspense
function ClipLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-coral-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Loading content...</p>
      </div>
    </div>
  );
}

export default function ClipPage() {
  return (
    <Suspense fallback={<ClipLoading />}>
      <ClipContent />
    </Suspense>
  );
}
