"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils"
// import { ChevronDown, Check } from "lucide-react" // Lucide is installed

// Icons (using standard SVGs if lucide not available directly or to allow flexibility)
const ChevronDown = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>
)
const Check = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"/></svg>
)


interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}
const SelectContext = React.createContext<SelectContextValue | null>(null);

export function Select({ value, onValueChange, children }: { value: string, onValueChange: (val: string) => void, children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ children, className, id }: { children: React.ReactNode, className?: string, id?: string }) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) throw new Error("SelectTrigger must be used within Select");
  
  return (
    <button
      type="button"
      id={id}
      onClick={() => ctx.setOpen(!ctx.open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300",
        className
      )}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
    const ctx = React.useContext(SelectContext);
    // This is a simplification. Ideally we'd look up the label from children.
    // For now we just display value or placeholder.
    // To display the label, we'd need to traverse children or register items.
    // We'll rely on the parent updating this or just showing the value capitalized.
    
    // A better hack for this lightweight implementation:
    // The SelectValue usually renders the selected option's children.
    // Since we can't easily access the children of SelectContent here without complex state,
    // we might just render the value.
    if (!ctx) return null;
    return <span className="capitalize">{ctx.value || placeholder}</span>;
}

export function SelectContent({ children, className }: { children: React.ReactNode, className?: string }) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;

  return (
    <AnimatePresence>
      {ctx.open && (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className={cn("absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 bg-white text-slate-950 shadow-md animate-in fade-in-80 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 w-full mt-1", className)}
        >
            <div className="p-1">
                {children}
            </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SelectItem({ value, children }: { value: string, children: React.ReactNode }) {
    const ctx = React.useContext(SelectContext);
    if (!ctx) return null;
    const isSelected = ctx.value === value;

    return (
        <div
            onClick={() => {
                ctx.onValueChange(value);
                ctx.setOpen(false);
            }}
            className={cn(
                "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-slate-100 focus:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:hover:bg-slate-800 dark:focus:bg-slate-800",
                isSelected && "bg-slate-100 dark:bg-slate-800"
            )}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {isSelected && <Check className="h-4 w-4" />}
            </span>
            <span className="truncate">{children}</span>
        </div>
    )
}
