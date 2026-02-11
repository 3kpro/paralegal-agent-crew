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
          className={`bg-gradient-to-r from-tron-cyan/10 via-tron-magenta/10 to-tron-cyan/10 border-b border-tron-cyan/20 relative z-50 ${
            isAppPage ? "md:ml-56" : ""
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="hidden sm:flex w-8 h-8 rounded-lg bg-tron-cyan/20 items-center justify-center flex-shrink-0">
                  <ArrowSquareOut className="w-4 h-4 text-tron-cyan" weight="duotone" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-tron-text">
                    <span className="font-semibold text-tron-cyan">New Domain:</span>{" "}
                    <span className="text-tron-text-muted">
                      We've moved to{" "}
                      <span className="font-semibold text-white">getxelora.com</span>{" "}
                      for better brand protection. Update your bookmarks!
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1.5 hover:bg-tron-cyan/10 rounded-lg transition-colors flex-shrink-0"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4 text-tron-text-muted hover:text-tron-text" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
