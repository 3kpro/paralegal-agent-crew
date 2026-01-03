"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { X, DeviceMobile, QrCode } from "@phosphor-icons/react";

interface SendToPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  platform: string;
}

export function SendToPhoneModal({
  isOpen,
  onClose,
  content,
  platform,
}: SendToPhoneModalProps) {
  const [qrUrl, setQrUrl] = useState<string>("");
  const [isLocalhost, setIsLocalhost] = useState(false);

  useEffect(() => {
    if (content && isOpen) {
      // Encode content as UTF-8 safe base64
      const utf8Bytes = new TextEncoder().encode(content);
      const binaryString = Array.from(utf8Bytes, byte => String.fromCharCode(byte)).join('');
      const encoded = encodeURIComponent(btoa(binaryString));

      const hostname = typeof window !== "undefined" ? window.location.hostname : "";
      const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
      setIsLocalhost(isLocal);

      // Use origin for URL generation
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://xelora.app";
      const url = `${baseUrl}/clip?c=${encoded}&p=${platform.toLowerCase()}`;
      setQrUrl(url);
    }
  }, [content, platform, isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-gray-900 rounded-3xl border border-gray-800 p-6 max-w-sm w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-coral-500/20 flex items-center justify-center">
                <DeviceMobile className="w-5 h-5 text-coral-400" weight="duotone" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Send to Phone</h3>
                <p className="text-xs text-gray-400">Scan to copy on mobile</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* QR Code */}
          <div className="bg-white rounded-2xl p-4 mb-6">
            {qrUrl ? (
              <QRCodeSVG
                value={qrUrl}
                size={240}
                level="M"
                className="w-full h-auto"
                bgColor="#ffffff"
                fgColor="#000000"
              />
            ) : (
              <div className="w-60 h-60 flex items-center justify-center">
                <QrCode className="w-16 h-16 text-gray-400 animate-pulse" />
              </div>
            )}
          </div>

          {/* Localhost Warning */}
          {isLocalhost && (
            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <p className="text-xs text-amber-300 font-medium mb-1">Local Development</p>
              <p className="text-xs text-amber-200/80">
                Your phone can't reach localhost. Access your dev server via your computer's network IP (e.g., <code className="bg-black/30 px-1 rounded">192.168.x.x:3000</code>) then try again.
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="space-y-3 text-center">
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-coral-500/20 text-coral-400 text-xs flex items-center justify-center font-semibold">1</span>
                <span className="text-gray-300">Scan QR</span>
              </div>
              <div className="w-4 h-px bg-gray-700" />
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-coral-500/20 text-coral-400 text-xs flex items-center justify-center font-semibold">2</span>
                <span className="text-gray-300">Tap Copy</span>
              </div>
              <div className="w-4 h-px bg-gray-700" />
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-coral-500/20 text-coral-400 text-xs flex items-center justify-center font-semibold">3</span>
                <span className="text-gray-300">Paste</span>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Open your camera app and point at the QR code
            </p>

            {platform.toLowerCase() === "tiktok" && (
              <div className="mt-4 p-3 bg-gray-800/50 rounded-xl">
                <p className="text-xs text-gray-400">
                  <span className="text-white font-medium">TikTok tip:</span> After copying, open TikTok → tap + → select "Text" → paste your content
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
