"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X, ArrowSquareOut } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

export function DomainTransitionBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check if user has dismissed the banner
    const dismissed = localStorage.getItem("domain-transition-banner-dismissed");
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("domain-transition-banner-dismissed", "true");
    setIsVisible(false);
  };

  // Check if we are on an app page (dashboard, etc) where sidebar is present
  const isAppPage = ["/dashboard", "/campaigns", "/helix", "/settings", "/onboarding"].some(
    (path) => pathname?.startsWith(path)
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`bg-gray-950 border-b border-tron-cyan/30 relative z-50 ${
            isAppPage ? "md:ml-56" : ""
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 py-2.5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="hidden sm:flex w-7 h-7 rounded-md bg-tron-cyan/15 items-center justify-center flex-shrink-0">
                  <ArrowSquareOut className="w-4 h-4 text-tron-cyan" weight="duotone" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-300">
                    <span className="font-bold text-tron-cyan">New Domain:</span>{" "}
                    We&apos;ve moved to{" "}
                    <span className="font-bold text-white">getxelora.com</span>
                    <span className="hidden sm:inline"> for better brand protection.</span>{" "}
                    Update your bookmarks!
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4 text-gray-500 hover:text-white" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
