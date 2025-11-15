'use client';

import React from 'react';

interface CheckoutButtonProps {
  tier: 'pro' | 'premium';
  billingCycle: 'monthly' | 'yearly';
  disabled?: boolean;
  children: React.ReactNode;
}

export function CheckoutButton({
  tier,
  billingCycle,
  disabled = false,
  children
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleCheckout = async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier,
          billingCycle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error: unknown) {
      console.error('Checkout error:', error);
      // Show the actual error message from the API
      const message = error instanceof Error ? error.message : 'Failed to start checkout. Please try again.';
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={disabled || isLoading}
      className="mt-8 block w-full rounded-lg bg-coral-500 px-3 py-2 text-center text-sm font-semibold text-white shadow-lg hover:bg-coral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
}