"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";

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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-coral-500/10 border border-coral-500/30 rounded-full mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-coral-500"></span>
              </span>
              <span className="text-sm font-medium text-coral-400">Viral DNA 2.0</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              Decode the DNA of Viral Content
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              See exactly <span className="text-coral-400 font-semibold">WHY</span> content goes viral - the Hook, the Emotion, the Value
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

          {/* Viral DNA Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center p-6 rounded-xl bg-[#00C7F2]/10 border border-[#00C7F2]/30">
              <div className="text-4xl font-bold text-[#00C7F2] mb-2">Hook</div>
              <div className="text-slate-300">How it grabs attention</div>
              <div className="text-xs text-slate-400 mt-2">Contrarian, Secret, Story, News</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-[#A17CF9]/10 border border-[#A17CF9]/30">
              <div className="text-4xl font-bold text-[#A17CF9] mb-2">Emotion</div>
              <div className="text-slate-300">What it triggers</div>
              <div className="text-xs text-slate-400 mt-2">Fear, Greed, Curiosity, Awe</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <div className="text-4xl font-bold text-amber-500 mb-2">Value</div>
              <div className="text-slate-300">What you gain</div>
              <div className="text-xs text-slate-400 mt-2">Status, Money, Time, Knowledge</div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Stop guessing. Start engineering.
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-coral-500 hover:bg-coral-600 text-white rounded-lg font-semibold text-lg transition-colors"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" weight="duotone" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold text-lg transition-colors"
              >
                Learn More
              </Link>
            </div>
            <p className="text-slate-400 mt-4 text-sm">
              No credit card required • Decode unlimited Viral DNA
            </p>
          </div>

          {/* Tagline */}
          <div className="mt-12 text-center">
            <p className="text-slate-500 text-lg italic">
              "Every viral post has DNA. We decode it."
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
