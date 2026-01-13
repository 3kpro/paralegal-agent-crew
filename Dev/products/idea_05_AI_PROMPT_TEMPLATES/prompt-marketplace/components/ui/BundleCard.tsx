
import React, { useState } from 'react';
import { Bundle } from '@/lib/mockData'; // Or types/supabase if fully updated
import { Check, Loader2, Package } from 'lucide-react';

interface BundleCardProps {
  bundle: Bundle;
}

export function BundleCard({ bundle }: BundleCardProps) {
  const [loading, setLoading] = useState(false);

  const onCheckout = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            bundleId: bundle.id,
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
    <div className="relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 transition-transform hover:-translate-y-1">
      
      <div className="flex-1 p-8">
        <h3 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
           <Package className="h-6 w-6 text-indigo-500" />
           {bundle.name}
        </h3>
        <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
           {bundle.description}
        </p>
        
        <div className="mt-6 flex items-baseline gap-x-1">
          <span className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            ${(bundle.price / 100).toFixed(0)}
          </span>
          <span className="text-sm font-semibold leading-6 text-slate-600 dark:text-slate-400">Save 20%</span>
        </div>

        <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
           {bundle.items?.map((item) => (
             <li key={item} className="flex gap-x-3">
               <Check className="h-5 w-5 flex-none text-indigo-600" aria-hidden="true" />
               {item}
             </li>
           ))}
           <li className="flex gap-x-3">
                <Check className="h-5 w-5 flex-none text-indigo-600" aria-hidden="true" />
                Lifetime Access & Updates
           </li>
        </ul>
      </div>

      <div className="bg-slate-50 p-6 dark:bg-slate-800/50">
        <button
          onClick={onCheckout}
          disabled={loading}
          className="w-full block rounded-lg bg-indigo-600 px-3 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
        >
          {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'Get Bundle'}
        </button>
      </div>
    </div>
  );
}
