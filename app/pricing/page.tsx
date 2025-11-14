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

  // Get current subscription info
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single();

  const currentTier = profile?.subscription_tier || 'free';
  const isActive = true; // TODO: Check Stripe subscription status when implemented

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Simple, transparent pricing</h2>
          <p className="mt-4 text-lg text-gray-600">Choose the plan that's right for you</p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:grid sm:grid-cols-3 sm:gap-6 sm:space-y-0 lg:mx-auto lg:max-w-4xl">
          {/* Free Tier */}
          <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold leading-6 text-gray-900">Free</h3>
              <p className="mt-4 text-sm text-gray-500">Perfect for getting started and trying out the platform.</p>
              <p className="mt-8">
                <span className="text-4xl font-bold tracking-tight text-gray-900">$0</span>
                <span className="text-base font-medium text-gray-500">/mo</span>
              </p>
              <button
                disabled={currentTier === 'free'}
                className="mt-8 block w-full rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentTier === 'free' ? 'Current Plan' : 'Downgrade to Free'}
              </button>
            </div>
            <div className="px-6 pt-6 pb-8">
              <h4 className="text-sm font-medium text-gray-900">What's included:</h4>
              <ul className="mt-6 space-y-4">
                <li className="flex space-x-3">
                  <span className="text-sm text-gray-500">{TIER_LIMITS.free.campaignsPerMonth} campaigns per month</span>
                </li>
                <li className="flex space-x-3">
                  <span className="text-sm text-gray-500">{TIER_LIMITS.free.aiTools} AI tool</span>
                </li>
                <li className="flex space-x-3">
                  <span className="text-sm text-gray-500">{TIER_LIMITS.free.socialPlatforms} social platforms</span>
                </li>
                <li className="flex space-x-3">
                  <span className="text-sm text-gray-500">{TIER_LIMITS.free.storageGB}GB storage</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Pro Tier */}
          <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold leading-6 text-gray-900">Pro</h3>
              <p className="mt-4 text-sm text-gray-500">For professionals and small teams.</p>
              <p className="mt-8">
                <span className="text-4xl font-bold tracking-tight text-gray-900">$29</span>
                <span className="text-base font-medium text-gray-500">/mo</span>
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
              <h4 className="text-sm font-medium text-gray-900">Everything in Free, plus:</h4>
              <ul className="mt-6 space-y-4">
                <li className="flex space-x-3">
                  <span className="text-sm text-gray-500">Unlimited campaigns</span>
                </li>
                <li className="flex space-x-3">
                  <span className="text-sm text-gray-500">{TIER_LIMITS.pro.aiTools} AI tools</span>
                </li>
                <li className="flex space-x-3">
                  <span className="text-sm text-gray-500">Unlimited social platforms</span>
                </li>
                <li className="flex space-x-3">
                  <span className="text-sm text-gray-500">{TIER_LIMITS.pro.storageGB}GB storage</span>
                </li>
                <li className="flex space-x-3">
                  <span className="text-sm text-gray-500">Priority support</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Premium Tier */}
          <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold leading-6 text-gray-900">Premium</h3>
              <p className="mt-4 text-sm text-gray-500">For businesses needing maximum power.</p>
              <p className="mt-8">
                <span className="text-4xl font-bold tracking-tight text-gray-900">$99</span>
                <span className="text-base font-medium text-gray-500">/mo</span>
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
              <h4 className="text-sm font-medium text-gray-900">Everything in Pro, plus:</h4>
              <ul className="mt-6 space-y-4">
                <li className="flex space-x-3">
                  <span className="text-sm text-gray-500">Unlimited everything</span>
                </li>
                <li className="flex space-x-3">
                  <span className="text-sm text-gray-500">Unlimited AI tools</span>
                </li>
                <li className="flex space-x-3">
                  <span className="text-sm text-gray-500">{TIER_LIMITS.premium.storageGB}GB storage</span>
                </li>
                <li className="flex space-x-3">
                  <span className="text-sm text-gray-500">24/7 priority support</span>
                </li>
                <li className="flex space-x-3">
                  <span className="text-sm text-gray-500">Custom integrations</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-lg font-medium text-gray-900">Need a custom plan?</h3>
          <p className="mt-4 text-sm text-gray-500">Contact us for enterprise pricing and custom solutions.</p>
          <a
            href="mailto:support@3kpro.services"
            className="mt-6 inline-block rounded-md bg-gray-900 px-4 py-2 text-base font-medium text-white hover:bg-gray-800"
          >
            Contact Sales
          </a>
        </div>
      </div>
    </div>
  );
}