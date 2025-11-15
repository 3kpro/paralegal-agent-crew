"use client";

import TrendDiscovery from "../../components/TrendDiscovery";

export default function TrendGenPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button
              onClick={() => (window.location.href = "/#top")}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">3K</span>
              </div>
              <span className="text-xl font-bold text-white">
                Content Cascade AI
              </span>
            </button>
            <div className="flex items-center space-x-4">
              <a
                href="/"
                className="text-gray-300 hover:text-white transition-colors"
              >
                ← Back to Home
              </a>
              <a href="/signup" className="px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-lg transition-colors">
                Sign Up
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-12">
        <TrendDiscovery />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900/95 border-t border-gray-700 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          <p>&copy; 2025 3K Pro Services. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
