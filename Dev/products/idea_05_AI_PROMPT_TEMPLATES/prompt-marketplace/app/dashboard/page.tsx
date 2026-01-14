'use client';

import { useState, useEffect } from 'react';
import { MOCK_PROMPTS } from '@/lib/mockData';
import { PurchasedPromptCard } from '@/components/dashboard/PurchasedPromptCard';
import { Prompt } from '@/types/supabase';
import { Package } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [purchasedPrompts, setPurchasedPrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    // Get purchased prompt IDs from localStorage
    const purchased = JSON.parse(localStorage.getItem('purchasedPrompts') || '[]');

    // If no purchases yet, show default prompts (Facebook and Instagram)
    const defaultPrompts = ['1', '7']; // IDs of Facebook Ad Copy and Instagram Caption prompts
    const promptIds = purchased.length > 0 ? purchased : defaultPrompts;

    // Filter MOCK_PROMPTS to only show purchased ones
    const filtered = MOCK_PROMPTS.filter(prompt => promptIds.includes(prompt.id));
    setPurchasedPrompts(filtered);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 dark:bg-slate-950">
       <nav className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Link href="/" className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              PromptMarket
            </Link>
            <div className="flex items-center gap-4">
                 <Link href="/library" className="text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400">
                    Browse Library
                 </Link>
                 <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500" />
            </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Library</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
                Access and manage your collection of premium AI prompts.
            </p>
        </div>

        {purchasedPrompts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {purchasedPrompts.map((prompt) => (
                    <PurchasedPromptCard key={prompt.id} prompt={prompt} />
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="mb-4 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                    <Package className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">No prompts purchased yet</h3>
                <p className="mt-1 text-slate-500">Explore the marketplace to find your first prompt.</p>
                <Link
                    href="/library"
                    className="mt-6 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 hover:shadow-md transition-all"
                >
                    Browse Prompts
                </Link>
            </div>
        )}
      </main>
    </div>
  );
}
