/**
 * Toast Component
 * 
 * Accessible toast notification with ARIA live region support.
 * Automatically disappears after duration.
 */

import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { ToastState } from "../types";

interface ToastProps {
  toast: ToastState;
}

/**
 * Toast - Memoized accessible toast notification
 */
const Toast = memo<ToastProps>(({ toast }) => {
  return (
    <AnimatePresence>
      {toast.show && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <div
            className={`px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border-2 flex items-center gap-3 ${
              toast.type === "success"
                ? "bg-green-500/20 border-green-500/50 text-green-100"
                : "bg-red-500/20 border-red-500/50 text-red-100"
            }`}
          >
            {toast.type === "success" ? (
              <Check className="w-5 h-5 text-green-400" aria-hidden="true" />
            ) : (
              <span className="text-red-400 text-xl" aria-hidden="true">
                ⚠️
              </span>
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

Toast.displayName = "Toast";

export default Toast;