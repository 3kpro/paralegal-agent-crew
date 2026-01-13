
import React from 'react';
import { Prompt } from '@/types/supabase';
import Link from 'next/link';

interface PromptCardProps {
  prompt: Prompt;
}

const CATEGORY_COLORS: Record<string, string> = {
  Marketing: 'bg-blue-100 text-blue-800 border-blue-200',
  'Content Creation': 'bg-purple-100 text-purple-800 border-purple-200',
  'Code & Development': 'bg-slate-100 text-slate-800 border-slate-200',
  'Business Operations': 'bg-green-100 text-green-800 border-green-200',
  'Creative Writing': 'bg-pink-100 text-pink-800 border-pink-200',
};

const GRADIENTS: Record<string, string> = {
  Marketing: 'from-blue-500 to-cyan-400',
  'Content Creation': 'from-purple-500 to-pink-500',
  'Code & Development': 'from-slate-700 to-slate-900',
  'Business Operations': 'from-emerald-500 to-teal-400',
  'Creative Writing': 'from-pink-500 to-rose-400',
};

export function PromptCard({ prompt }: PromptCardProps) {
  const categoryColor = CATEGORY_COLORS[prompt.category] || 'bg-gray-100 text-gray-800';
  const gradient = GRADIENTS[prompt.category] || 'from-indigo-500 to-purple-500';

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-slate-200/60 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900 dark:border-slate-800">
      
      {/* Top Gradient Bar */}
      <div className={`h-2 w-full bg-gradient-to-r ${gradient}`} />

      <div className="p-5 flex-grow">
        <div className="mb-3 flex items-center justify-between">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${categoryColor}`}>
              {prompt.category}
            </span>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                ${(prompt.price / 100).toFixed(2)}
            </span>
        </div>

        <h3 className="mb-2 text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
          {prompt.title}
        </h3>
        
        <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-400">
          {prompt.description}
        </p>
      </div>

      <div className="bg-slate-50/50 p-4 dark:bg-slate-800/50">
        <Link 
          href={`/prompt/${prompt.slug}`}
          className="block w-full rounded-lg bg-white border border-slate-200 py-2.5 text-center text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-indigo-600 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
