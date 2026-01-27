"use client";

import { OrbitalLoader } from "@/components/ui/orbital-loader";

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  variant?: "default" | "luma"; // Keeping variant prop for compatibility but treating them same or mapping if needed
}

export function LoadingState({
  message = "Loading...",
  size = "md",
  fullScreen = false,
  variant = "default",
}: LoadingStateProps) {
  // Map size to something if needed, OrbitalLoader has fixed size but we can style it via className if needed.
  // The default OrbitalLoader is w-16 h-16.
  // We can pass className to scale it.

  let scaleClass = "";
  if (size === "sm") scaleClass = "scale-50";
  if (size === "lg") scaleClass = "scale-150";

  const content = (
    <OrbitalLoader message={message} className={scaleClass} />
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-tron-dark flex items-center justify-center">
        {content}
      </div>
    );
  }

  return <div className="p-8 flex justify-center">{content}</div>;
}



// Skeleton loaders for different components
export function CampaignCardSkeleton() {
  return (
    <div className="bg-tron-grid border border-tron-cyan/30 rounded-lg p-6 animate-pulse">
      <div className="h-6 bg-tron-dark/50 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-tron-dark/50 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-tron-dark/50 rounded w-2/3 mb-4"></div>
      <div className="flex gap-2">
        <div className="h-8 w-8 bg-tron-dark/50 rounded"></div>
        <div className="h-8 w-8 bg-tron-dark/50 rounded"></div>
        <div className="h-8 w-8 bg-tron-dark/50 rounded"></div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-tron-grid border border-tron-cyan/30 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-tron-cyan/30 animate-pulse">
        <div className="h-6 bg-tron-dark/50 rounded w-32"></div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="p-4 border-b border-tron-cyan/30 flex items-center gap-4 animate-pulse"
        >
          <div className="h-10 w-10 bg-tron-dark/50 rounded"></div>
          <div className="flex-1">
            <div className="h-4 bg-tron-dark/50 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-tron-dark/50 rounded w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ContentSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-tron-dark/50 rounded w-1/4"></div>
      <div className="h-4 bg-tron-dark/50 rounded w-full"></div>
      <div className="h-4 bg-tron-dark/50 rounded w-5/6"></div>
      <div className="h-4 bg-tron-dark/50 rounded w-4/6"></div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-tron-grid border border-tron-cyan/30 rounded-lg p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-6 bg-tron-dark/50 rounded"></div>
        <div className="h-4 bg-tron-dark/50 rounded w-16"></div>
      </div>
      <div className="h-8 bg-tron-dark/50 rounded w-24 mb-2"></div>
      <div className="h-4 bg-tron-dark/50 rounded w-32"></div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-4 bg-tron-dark/50 rounded w-32 mb-2"></div>
        <div className="h-10 bg-tron-dark/50 rounded w-full"></div>
      </div>
      <div>
        <div className="h-4 bg-tron-dark/50 rounded w-40 mb-2"></div>
        <div className="h-10 bg-tron-dark/50 rounded w-full"></div>
      </div>
      <div>
        <div className="h-4 bg-tron-dark/50 rounded w-36 mb-2"></div>
        <div className="h-24 bg-tron-dark/50 rounded w-full"></div>
      </div>
      <div className="h-10 bg-tron-dark/50 rounded w-32"></div>
    </div>
  );
}
