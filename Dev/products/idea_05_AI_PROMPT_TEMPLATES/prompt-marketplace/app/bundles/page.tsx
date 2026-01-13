
'use client';

import { MOCK_BUNDLES } from '@/lib/mockData';
import { BundleCard } from '@/components/ui/BundleCard';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function BundlesPage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-20 dark:bg-slate-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400">
                <ArrowLeft className="h-4 w-4" /> Back to Library
            </Link>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              PromptMarket Bundles
            </span>
            <div className="w-20" /> {/* Spacer */}
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mx-auto max-w-2xl text-center mb-16">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                Premium Bundles
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
                Get more value with curated collections of our best prompts. Tailored for specific professionals.
            </p>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
            {MOCK_BUNDLES.map((bundle) => (
                <BundleCard key={bundle.id} bundle={bundle} />
            ))}
        </div>
      </main>
    </div>
  );
}
