import { Metadata } from "next";
import LaunchpadGuard from "./launchpad-guard";

export const metadata: Metadata = {
  title: "Launchpad | TrendPulse",
  description: "Marketing Automation Command Center",
};

export default function LaunchpadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LaunchpadGuard>
      <div className="flex flex-col min-h-screen bg-gray-900 text-white">
        <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-coral-500 to-purple-600 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                  Launchpad
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">Mission Control</span>
              </div>
            </div>
          </div>
        </div>
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {children}
        </main>
      </div>
    </LaunchpadGuard>
  );
}
