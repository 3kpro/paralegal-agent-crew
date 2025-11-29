import React from 'react';
import { TIER_LIMITS } from '@/lib/stripe';
import { CheckoutButton } from '@/components/CheckoutButton';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/pricing');
  }

  // Get current subscription tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single();

  const currentTier = profile?.subscription_tier || 'free';
  const isActive = true;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <a
              href="/"
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">3K</span>
              </div>
               <span className="text-xl font-bold text-white">
                 TrendPulse
               </span>
            </a>
            <div className="flex items-center space-x-4">
              <a
                href="/dashboard"
                className="text-gray-300 hover:text-white transition-colors"
              >
                ← Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Simple, transparent pricing</h2>
          <p className="mt-4 text-lg text-gray-300">Choose the plan that's right for you</p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:grid sm:grid-cols-3 sm:gap-6 sm:space-y-0 lg:mx-auto lg:max-w-5xl">
          {/* Free Tier */}
          <div className="divide-y divide-gray-700/50 rounded-lg border-2 border-gray-700/50 shadow-xl bg-[#343a40] hover:border-coral-500/50 transition-all">
            <div className="p-6">
              <h3 className="text-lg font-semibold leading-6 text-white">Free</h3>
              <p className="mt-4 text-sm text-gray-300">Perfect for getting started and trying out the platform.</p>
              <p className="mt-8">
                <span className="text-4xl font-bold tracking-tight text-white">$0</span>
                <span className="text-base font-medium text-gray-400">/mo</span>
              </p>
              <button
                disabled={currentTier === 'free'}
                className="mt-8 block w-full rounded-lg bg-gray-600 px-3 py-2 text-center text-sm font-semibold text-white shadow hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {currentTier === 'free' ? 'Current Plan' : 'Downgrade to Free'}
              </button>
            </div>
            <div className="px-6 pt-6 pb-8">
              <h4 className="text-sm font-medium text-white">TrendPulse™ Access:</h4>
              <ul className="mt-6 space-y-4">
                <li className="flex items-center space-x-3">
                  <span className="text-coral-400">✓</span>
                  <span className="text-sm text-gray-300">{TIER_LIMITS.free.campaignsPerMonth} trend campaigns/month</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="text-coral-400">✓</span>
                  <span className="text-sm text-gray-300">{TIER_LIMITS.free.trendSearches} trend searches/day</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="text-coral-400">✓</span>
                  <span className="text-sm text-gray-300">Viral Score™ predictions</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="text-gray-500">○</span>
                  <span className="text-sm text-gray-500">Social platforms (coming soon)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Pro Tier */}
          <div className="divide-y divide-gray-700/50 rounded-lg border-2 border-coral-500/50 shadow-2xl shadow-coral-500/20 bg-[#343a40] transform scale-105">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold leading-6 text-white">Pro</h3>
                <span className="text-xs px-2 py-1 bg-coral-500/20 border border-coral-500/30 rounded-full text-coral-300 font-semibold">POPULAR</span>
              </div>
              <p className="mt-4 text-sm text-gray-300">For professionals and small teams.</p>
              <p className="mt-8">
                <span className="text-4xl font-bold tracking-tight text-white">$29</span>
                <span className="text-base font-medium text-gray-400">/mo</span>
              </p>
              <CheckoutButton
                tier="pro"
                billingCycle="monthly"
                disabled={currentTier === 'pro' && isActive}
              >
                {currentTier === 'pro' && isActive ? 'Current Plan' : 'Upgrade to Pro'}
              </CheckoutButton>
            </div>
            <div className="px-6 pt-6 pb-8">
              <h4 className="text-sm font-medium text-white">Everything in Free, plus:</h4>
              <ul className="mt-6 space-y-4">
                <li className="flex items-center space-x-3">
                  <span className="text-coral-400">✓</span>
                  <span className="text-sm text-gray-300">Unlimited trend campaigns</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="text-coral-400">✓</span>
                  <span className="text-sm text-gray-300">Unlimited trend searches</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="text-coral-400">✓</span>
                  <span className="text-sm text-gray-300">Advanced Viral Score™ analytics</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="text-coral-400">✓</span>
                  <span className="text-sm text-gray-300">{TIER_LIMITS.pro.storageGB}GB storage</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="text-coral-400">✓</span>
                  <span className="text-sm text-gray-300">Priority support</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Premium Tier */}
          <div className="divide-y divide-gray-700/50 rounded-lg border-2 border-gray-700/50 shadow-xl bg-[#343a40] hover:border-coral-500/50 transition-all">
            <div className="p-6">
              <h3 className="text-lg font-semibold leading-6 text-white">Premium</h3>
              <p className="mt-4 text-sm text-gray-300">For businesses needing maximum power.</p>
              <p className="mt-8">
                <span className="text-4xl font-bold tracking-tight text-white">$99</span>
                <span className="text-base font-medium text-gray-400">/mo</span>
              </p>
              <CheckoutButton
                tier="premium"
                billingCycle="monthly"
                disabled={currentTier === 'premium' && isActive}
              >
                {currentTier === 'premium' && isActive ? 'Current Plan' : 'Upgrade to Premium'}
              </CheckoutButton>
            </div>
            <div className="px-6 pt-6 pb-8">
              <h4 className="text-sm font-medium text-white">Everything in Pro, plus:</h4>
              <ul className="mt-6 space-y-4">
                <li className="flex items-center space-x-3">
                  <span className="text-coral-400">✓</span>
                  <span className="text-sm text-gray-300">White-label TrendPulse™</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="text-coral-400">✓</span>
                  <span className="text-sm text-gray-300">Custom Viral Score™ models</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="text-coral-400">✓</span>
                  <span className="text-sm text-gray-300">{TIER_LIMITS.premium.storageGB}GB storage</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="text-coral-400">✓</span>
                  <span className="text-sm text-gray-300">24/7 priority support</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="text-coral-400">✓</span>
                  <span className="text-sm text-gray-300">API access & webhooks</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center bg-[#343a40] border-2 border-gray-700/50 rounded-xl p-8 max-w-2xl mx-auto">
          <h3 className="text-lg font-medium text-white">Need a custom plan?</h3>
          <p className="mt-4 text-sm text-gray-300">Contact us for enterprise pricing and custom solutions.</p>
          <a
            href="mailto:support@3kpro.services"
            className="mt-6 inline-block rounded-lg bg-coral-500 px-6 py-3 text-base font-medium text-white hover:bg-coral-600 transition-colors shadow-lg"
          >
            Contact Sales
          </a>
        </div>
      </div>
    </div>
  );
}