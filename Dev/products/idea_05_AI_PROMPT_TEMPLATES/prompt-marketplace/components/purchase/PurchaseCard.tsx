
'use client';

import { useState, useEffect } from 'react';
import { Prompt } from '@/types/supabase';
import { Loader2 } from 'lucide-react';

interface PurchaseCardProps {
  prompt: Prompt;
}

export function PurchaseCard({ prompt }: PurchaseCardProps) {
  const [loading, setLoading] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    // Check if dev mode is enabled via URL parameter
    const params = new URLSearchParams(window.location.search);
    setIsDevMode(params.get('dev') === 'true');
  }, []);

  const onCheckout = async () => {
    try {
      setLoading(true);

      // Dev mode: Skip Stripe and go directly to dashboard
      if (isDevMode) {
        // Store purchased prompt ID in localStorage
        const purchased = JSON.parse(localStorage.getItem('purchasedPrompts') || '[]');
        if (!purchased.includes(prompt.id)) {
          purchased.push(prompt.id);
          localStorage.setItem('purchasedPrompts', JSON.stringify(purchased));
        }

        setTimeout(() => {
          window.location.href = '/dashboard?success=true';
        }, 500);
        return;
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            promptId: prompt.id,
        })
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
        console.error('Checkout error:', error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 text-center">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">One-Time Price</p>
            <div className="mt-2 flex items-baseline justify-center gap-1">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                    ${(prompt.price / 100).toFixed(2)}
                </span>
                <span className="text-slate-500">USD</span>
            </div>
        </div>

        <div className="space-y-4">
            <button
                onClick={onCheckout}
                disabled={loading}
                className="w-full flex items-center justify-center rounded-xl bg-indigo-600 py-4 text-center text-lg font-bold text-white shadow-md transition-transform hover:scale-[1.02] hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (isDevMode ? 'Get Instant Access (DEV)' : 'Buy Now')}
            </button>
            <p className="text-center text-xs text-slate-400">
                {isDevMode ? '🔧 Dev Mode: No payment required' : 'Secure payment via Stripe • Instant Access'}
            </p>
        </div>

        <hr className="my-6 border-slate-100 dark:border-slate-800" />

        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
                <span>Format</span>
                <span className="font-medium text-slate-900 dark:text-white">Markdown</span>
            </div>
            <div className="flex justify-between">
                <span>Copy-Paste Ready</span>
                <span className="font-medium text-slate-900 dark:text-white">Yes</span>
            </div>
            <div className="flex justify-between">
                <span>Lifetime Access</span>
                <span className="font-medium text-slate-900 dark:text-white">Yes</span>
            </div>
        </div>
    </div>
  );
}
