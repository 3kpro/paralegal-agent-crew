
'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Search, SlidersHorizontal, Sparkles, Zap } from 'lucide-react';
import { MOCK_PROMPTS } from '@/lib/mockData';
import { PromptCard } from '@/components/ui/PromptCard';

export default function LandingPage() {
  const featuredPrompts = MOCK_PROMPTS.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 font-sans dark:bg-slate-950">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500" />
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              PromptMarket
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/library" className="text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400">
              Library
            </Link>
            <Link href="/bundles" className="text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400">
              Bundles
            </Link>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
            <Link href="/dashboard" className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">
              My Library
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32">
          {/* Background decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
             <div className="absolute top-[20%] left-[10%] h-72 w-72 rounded-full bg-purple-500/20 blur-[100px]" />
             <div className="absolute top-[30%] right-[10%] h-96 w-96 rounded-full bg-indigo-500/20 blur-[100px]" />
          </div>

          <div className="relative mx-auto max-w-7xl px-6 text-center">
            <div className="mx-auto max-w-3xl">
              <div className="mb-8 inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-600 dark:border-indigo-900/50 dark:bg-indigo-900/30 dark:text-indigo-300">
                <Sparkles className="mr-2 h-4 w-4" />
                Now with 50+ New Premium Prompts
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl lg:text-7xl">
                Unlock the Full Potential of <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">Geneartive AI</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
                Stop struggling with vague outputs. Access a curated marketplace of battle-tested prompts for Marketing, Coding, Writing, and Business.
              </p>
              <div className="mt-10 flex items-center justify-center gap-4">
                <Link 
                  href="/library"
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 hover:bg-indigo-700 hover:shadow-indigo-500/40"
                >
                  <Search className="h-4 w-4" />
                  Browse Prompts
                </Link>
                <Link 
                  href="/bundles"
                  className="flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-slate-700 shadow-lg shadow-slate-200/50 transition-all hover:scale-105 hover:bg-slate-50 dark:bg-slate-800 dark:text-white dark:shadow-slate-900/50"
                >
                  View Bundles <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Categories / Value Prop */}
        <section className="py-24 bg-white dark:bg-slate-900/50">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-12 lg:grid-cols-3">
              <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 mb-6">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Instant Results</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Don't waste hours tweaking. Our prompts are engineered to deliver high-quality outputs on the first try.
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 mb-6">
                  <SlidersHorizontal className="h-6 w-6" />
                </div>
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Expert Curated</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Each prompt is crafted by domain experts in marketing, coding, and creative writing to ensure relevance.
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600 mb-6">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Verified Quality</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  We verify every prompt against multiple AI models (GPT-4, Claude, etc.) to guarantee consistency.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Prompts */}
        <section className="py-24">
           <div className="mx-auto max-w-7xl px-6">
              <div className="flex items-end justify-between mb-12">
                 <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Featured Prompts</h2>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">Top picks from our community of creators.</p>
                 </div>
                 <Link href="/library" className="hidden sm:flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    View all <ArrowRight className="h-4 w-4" />
                 </Link>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                 {featuredPrompts.map(prompt => (
                    <PromptCard key={prompt.id} prompt={prompt} />
                 ))}
              </div>

              <div className="mt-12 text-center sm:hidden">
                 <Link href="/library" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    View all prompts &rarr;
                 </Link>
              </div>
           </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
           <div className="mx-auto max-w-7xl px-6">
              <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-24 shadow-2xl sm:px-24">
                 
                 <div className="absolute top-0 left-0 w-full h-full opacity-30">
                    <div className="absolute right-0 top-0 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/2 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500 blur-[100px]" />
                 </div>

                 <div className="relative text-center">
                    <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                       Ready to supercharge your workflow?
                    </h2>
                    <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-300">
                       Join thousands of professionals using our prompts to write better code, create engaging content, and grow their businesses.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                       <Link href="/library" className="rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-slate-900 shadow-sm hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                          Get Started Now
                       </Link>
                       <Link href="/bundles" className="text-sm font-semibold leading-6 text-white hover:text-slate-200">
                          View Pricing <span aria-hidden="true">→</span>
                       </Link>
                    </div>
                 </div>
              </div>
           </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-950">
         <div className="mx-auto max-w-7xl px-6 text-center text-sm text-slate-500">
            <p>&copy; 2026 PromptMarket. All rights reserved.</p>
         </div>
      </footer>
    </div>
  );
}
