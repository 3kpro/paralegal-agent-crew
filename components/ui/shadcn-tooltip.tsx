"use client"

import * as React from "react"
// We would need @radix-ui/react-tooltip for full accessible implementation.
// Assuming we don't have it, we'll build a simple wrapper.

import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>

interface TooltipContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}
const TooltipContext = React.createContext<TooltipContextType | null>(null);

const Tooltip = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </TooltipContext.Provider>
  )
}

const TooltipTrigger = ({ children, asChild, ...props }: any) => {
    const ctx = React.useContext(TooltipContext);
    if (!ctx) return null;
    return (
        <div
            onMouseEnter={() => ctx.setOpen(true)}
            onMouseLeave={() => ctx.setOpen(false)}
            className="inline-block cursor-help"
            {...props}
        >
            {children}
        </div>
    )
}

const TooltipContent = ({ className, sideOffset = 4, children, ...props }: any) => {
    const ctx = React.useContext(TooltipContext);
    if (!ctx) return null;

    return (
        <AnimatePresence>
            {ctx.open && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={cn(
                        "absolute z-50 overflow-hidden rounded-md border border-slate-200 bg-slate-900 px-3 py-1.5 text-xs text-slate-50 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:border-slate-800 dark:bg-slate-50 dark:text-slate-900",
                        "bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-xs", // basic positioning: top centered
                        className
                    )}
                    {...props}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
