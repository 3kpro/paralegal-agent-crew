"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Warning, X, Info } from "@phosphor-icons/react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const toastStyles: Record<ToastType, { bg: string; border: string; text: string; icon: typeof Check }> = {
  success: {
    bg: "bg-green-900/20",
    border: "border-green-500/50",
    text: "text-green-100",
    icon: Check,
  },
  error: {
    bg: "bg-red-900/20",
    border: "border-red-500/50",
    text: "text-red-100",
    icon: Warning,
  },
  warning: {
    bg: "bg-amber-900/20",
    border: "border-amber-500/50",
    text: "text-amber-100",
    icon: Warning,
  },
  info: {
    bg: "bg-blue-900/20",
    border: "border-blue-500/50",
    text: "text-blue-100",
    icon: Info,
  },
};

const iconColors: Record<ToastType, string> = {
  success: "text-green-400",
  error: "text-red-400",
  warning: "text-amber-400",
  info: "text-blue-400",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const success = useCallback((message: string) => showToast(message, "success"), [showToast]);
  const error = useCallback((message: string) => showToast(message, "error"), [showToast]);
  const warning = useCallback((message: string) => showToast(message, "warning"), [showToast]);
  const info = useCallback((message: string) => showToast(message, "info"), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {/* Toast Container - Fixed position at top center */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const styles = toastStyles[toast.type];
            const Icon = styles.icon;
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`px-5 py-3 rounded-xl shadow-2xl backdrop-blur-xl border-2 flex items-center gap-3 pointer-events-auto min-w-[280px] max-w-md ${styles.bg} ${styles.border} ${styles.text}`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${iconColors[toast.type]}`} weight="duotone" />
                <span className="font-medium text-sm flex-1">{toast.message}</span>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="p-1 hover:bg-white/10 rounded-md transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" weight="bold" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
