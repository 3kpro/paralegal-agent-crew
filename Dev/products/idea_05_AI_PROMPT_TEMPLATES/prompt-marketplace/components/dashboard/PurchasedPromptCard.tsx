
'use client';

import { useState } from 'react';
import { Prompt } from '@/types/supabase';
import { Copy, Download, FileText, Check } from 'lucide-react';

interface PurchasedPromptCardProps {
  prompt: Prompt;
}

export function PurchasedPromptCard({ prompt }: PurchasedPromptCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.full_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([prompt.full_text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${prompt.slug}.txt`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element); // Clean up
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-100 p-6 dark:border-slate-800">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
               <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
               Purchased
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {prompt.title}
            </h3>
            <p className="text-sm text-slate-500">{prompt.category}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
             <FileText className="h-5 w-5 text-slate-400" />
          </div>
        </div>
      </div>

      <div className="bg-slate-50/50 p-6 dark:bg-slate-950/50">
        <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 font-mono text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <div className="max-h-32 overflow-y-auto whitespace-pre-wrap scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
             {prompt.full_text}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy Text'}
          </button>
          
          <button
            onClick={handleDownload}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
