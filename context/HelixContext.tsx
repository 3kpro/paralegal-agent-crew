"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";

// Define the shape of the context data
export interface HelixContextState {
  page: string;
  pageContent?: string; // Summary of visible content
  data?: any; // Structured data (e.g., list of trends)
  selections?: any; // User selections (e.g., selected trend ID)
  actions?: Record<string, () => void>; // Callable actions
}

interface HelixContextType {
  context: HelixContextState;
  setContext: (newContext: Partial<HelixContextState>) => void;
  updateContext: (updates: Partial<HelixContextState>) => void;
  registerAction: (name: string, handler: () => void) => void;
}

const defaultState: HelixContextState = {
  page: "unknown",
};

const HelixContext = createContext<HelixContextType | undefined>(undefined);

export const HelixProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const [context, setContextState] = useState<HelixContextState>({
    ...defaultState,
    page: pathname || "unknown",
  });

  // Reset context on route change (optional - or keep some accumulation?)
  // For now, let's update the page name automatically.
  useEffect(() => {
    setContextState((prev) => ({
      ...prev,
      page: pathname || "unknown",
      // We might want to clear specific data on navigation, 
      // but let's leave it to individual pages to overwrite data.
      // actually, stale data is bad. Let's clear data/selections.
      data: undefined,
      selections: undefined,
      actions: undefined
    }));
  }, [pathname]);

  const setContext = React.useCallback((newContext: Partial<HelixContextState>) => {
    setContextState((prev) => ({ ...prev, ...newContext }));
  }, []);
  
  const updateContext = React.useCallback((updates: Partial<HelixContextState>) => {
     setContextState(prev => ({ ...prev, ...updates }));
  }, []);

  const registerAction = React.useCallback((name: string, handler: () => void) => {
    setContextState((prev) => ({
      ...prev,
      actions: {
        ...prev.actions,
        [name]: handler,
      },
    }));
  }, []);

  const value = React.useMemo(() => ({
    context, setContext, updateContext, registerAction
  }), [context, setContext, updateContext, registerAction]);

  return (
    <HelixContext.Provider value={value}>
      {children}
    </HelixContext.Provider>
  );
};

export const useHelix = () => {
  const context = useContext(HelixContext);
  if (!context) {
    throw new Error("useHelix must be used within a HelixProvider");
  }
  return context;
};
