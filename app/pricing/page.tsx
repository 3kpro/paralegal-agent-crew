import React from 'react';
import Link from 'next/link';
import { TIER_LIMITS } from '@/lib/stripe';
import { CheckoutButton } from '@/components/CheckoutButton';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Check, ArrowRight } from 'lucide-react';

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

  const tiers = [
    {
      name: 'Free',
      price: '0',
      description: 'Perfect for getting started and trying out the platform.',
      features: [
        `${TIER_LIMITS.free.campaignsPerMonth} campaigns/month`,
        `${TIER_LIMITS.free.trendSearches} trend searches/day`,
        'Viral Score™ + Viral DNA™',
        'Standard AI generation',
      ],
      cta: 'Current Plan',
      variant: 'free'
    },
    {
      name: 'Pro',
      price: '29',
      description: 'For professionals and small teams.',
      popular: true,
      features: [
        'Unlimited campaigns/month',
        'Unlimited trend searches/day',
        'Priority AI generation',
        'Advanced content controls',
        `${TIER_LIMITS.pro.storageGB}GB storage`,
        'Priority support',
      ],
      cta: 'Upgrade to Pro',
      variant: 'pro'
    },
    {
      name: 'Premium',
      price: '99',
      description: 'For businesses needing maximum power.',
      features: [
        'Everything in Pro, plus:',
        'White-label XELORA™',
        'Custom Viral Score™ models',
        `${TIER_LIMITS.premium.storageGB}GB storage`,
        '24/7 priority support',
        'API access & webhooks',
      ],
      cta: 'Upgrade to Premium',
      variant: 'premium'
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary selection:text-primary-foreground">
      <Navigation />
      
      <main className="flex-1 pt-32 pb-20 relative overflow-hidden">
        {/* Background with Grid Pattern */}
        <div 
          className="absolute inset-0 z-0 bg-grid-pattern opacity-10" 
          style={{ maskImage: "linear-gradient(to bottom, black 40%, transparent 100%)" }} 
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground uppercase tracking-tighter">
              Subscription <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/40">Architecture.</span>
            </h1>
            <p className="text-xl text-muted-foreground font-medium">Choose the allocation that fits your operational scale.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            {tiers.map((tier) => (
              <div 
                key={tier.name}
                className={`relative p-10 bg-black/40 backdrop-blur-sm flex flex-col group transition-colors hover:bg-white/[0.02] ${tier.popular ? 'z-10 bg-white/[0.03]' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-white opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.3)]"></div>
                )}
                
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold uppercase tracking-tight text-foreground">{tier.name}</h3>
                    {tier.popular && (
                      <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 bg-white text-black rounded">Popular</span>
                    )}
                  </div>
                  <div className="flex items-baseline mt-4">
                    <span className="text-4xl font-bold text-foreground tracking-tighter">${tier.price}</span>
                    <span className="ml-2 text-muted-foreground text-sm uppercase tracking-widest font-bold">/mo</span>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground font-medium leading-relaxed">{tier.description}</p>
                </div>

                <ul className="space-y-4 mb-12 flex-grow">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="w-4 h-4 text-foreground mr-3 shrink-0 mt-0.5 opacity-60" />
                      <span className="text-sm text-gray-300 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  {tier.variant === 'free' ? (
                    <button
                      disabled={currentTier === 'free'}
                      className="w-full h-12 rounded bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest font-bold text-muted-foreground disabled:opacity-50 transition-all hover:bg-white/10"
                    >
                      {currentTier === 'free' ? 'Active Allocation' : 'Switch to Free'}
                    </button>
                  ) : (
                    <CheckoutButton
                      tier={tier.variant as any}
                      billingCycle="monthly"
                      disabled={currentTier === tier.variant && isActive}
                      className="w-full h-12 bg-white text-black hover:bg-white/90 transition-all font-bold uppercase tracking-widest text-[10px] rounded flex items-center justify-center gap-2"
                    >
                      {currentTier === tier.variant && isActive ? 'Active Node' : tier.cta}
                      {currentTier !== tier.variant && <ArrowRight className="w-3 h-3" />}
                    </CheckoutButton>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-24 text-center p-12 border border-white/10 bg-black/40 backdrop-blur-md rounded-2xl max-w-2xl mx-auto shadow-xl">
             <h3 className="text-2xl font-bold text-foreground mb-4 uppercase tracking-tight">Enterprise Node</h3>
             <p className="text-muted-foreground text-sm font-medium mb-10 leading-relaxed">Contact us for custom multi-seat allocations, private deployments, and high-density performance requirements.</p>
             <div className="flex flex-col sm:flex-row gap-6 justify-center">
               <a
                 href="mailto:support@3kpro.services"
                 className="inline-flex items-center gap-3 px-10 py-5 bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-bold uppercase tracking-widest text-[10px]"
               >
                 Contact Operations <ArrowRight className="w-4 h-4" />
               </a>
               <Link href="/dashboard" className="inline-flex items-center gap-3 px-10 py-5 text-muted-foreground hover:text-white transition-all font-bold uppercase tracking-widest text-[10px]">
                 Back to Dashboard
               </Link>
             </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
