"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/xelora-logo-v3.png" alt="XELORA" className="w-10 h-10" />
            <span className="text-2xl font-bold text-white">XELORA</span>
          </Link>
          <Link
            href="/signup"
            className="px-6 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-lg font-semibold transition-colors"
          >
            Try Free
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              See XELORA in Action
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Watch how creators predict viral content in under 2 minutes
            </p>
          </div>

          {/* Video Container */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-800">
            <video
              controls
              autoPlay
              muted
              loop
              className="w-full aspect-video"
              poster="/demo-thumbnail.jpg"
            >
              <source src="/media/VIDEO/Xelora/demo_007.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Stats Below Video */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-coral-500 mb-2">87%</div>
              <div className="text-slate-300">Viral Prediction Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-coral-500 mb-2">6</div>
              <div className="text-slate-300">Platforms Supported</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-coral-500 mb-2">2min</div>
              <div className="text-slate-300">From Idea to Publish</div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to create viral content?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-coral-500 hover:bg-coral-600 text-white rounded-lg font-semibold text-lg transition-colors"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold text-lg transition-colors"
              >
                Learn More
              </Link>
            </div>
            <p className="text-slate-400 mt-4 text-sm">
              No credit card required • 5 free predictions/month
            </p>
          </div>

          {/* Product Hunt Badge (Optional) */}
          <div className="mt-12 text-center">
            <p className="text-slate-400 mb-4">Launching on Product Hunt</p>
            {/* Add Product Hunt badge here once launched */}
          </div>
        </div>
      </main>
    </div>
  );
}
