
'use client';

import { useState, useMemo } from 'react';
import { PromptCard } from '@/components/ui/PromptCard';
import { MOCK_PROMPTS } from '@/lib/mockData';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  'Marketing',
  'Content Creation',
  'Code & Development',
  'Business Operations',
  'Creative Writing'
];

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high'>('newest');

  // Filter Logic
  const filteredPrompts = useMemo(() => {
    return MOCK_PROMPTS.filter((prompt) => {
      const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            prompt.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(prompt.category);

      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      // newest (mock date is same, so sorting by ID roughly)
      return b.id.localeCompare(a.id); 
    });
  }, [searchQuery, selectedCategories, sortBy]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 w-full border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500" />
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              PromptMarket
            </span>
          </Link>
          <div className="hidden md:flex gap-4 items-center">
              <Link href="/bundles" className="text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400">
                Bundles
              </Link>
              <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400">
                My Library
              </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-10 lg:flex-row">
          
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-24 space-y-8">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                </h3>
                <div className="mt-4 space-y-3">
                  {CATEGORIES.map((cat) => (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${selectedCategories.includes(cat) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white group-hover:border-indigo-400'}`}>
                        {selectedCategories.includes(cat) && <span className="text-white text-xs">✓</span>}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                      />
                      <span className={`text-sm ${selectedCategories.includes(cat) ? 'font-medium text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                        {cat}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input 
                  type="text" 
                  placeholder="Search prompts..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                />
              </div>
              
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                     <ArrowUpDown className="h-4 w-4" />
                </div>
                <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="h-10 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-8 text-sm font-medium text-slate-700 outline-none hover:border-slate-300 focus:border-indigo-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200"
                >
                    <option value="newest">Newest Arrivals</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {filteredPrompts.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPrompts.map((prompt) => (
                    <PromptCard key={prompt.id} prompt={prompt} />
                ))}
                </div>
            ) : (
                <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50">
                    <p className="text-slate-500">No prompts found matching your criteria.</p>
                    <button onClick={() => {setSearchQuery(''); setSelectedCategories([])}} className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-500">
                        Clear Filters
                    </button>
                </div>
            )}
            
          </div>
        </div>
      </main>
    </div>
  );
}
