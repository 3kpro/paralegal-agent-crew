"use client";

import { useState } from "react";
import { Check, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";

// Replace these with your actual Stripe Price IDs
const PRICES = {
   monthly: "price_1Q...", // e.g. price_1QmX...
   lifetime: "price_1Q..." // e.g. price_1QmY...
};

export default function PricingPage() {
   const [loading, setLoading] = useState<string | null>(null);

   const handleCheckout = async (priceId: string, mode: 'subscription' | 'payment') => {
      setLoading(priceId);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
         toast.error("Please log in to upgrade.");
         window.location.href = '/login';
         return;
      }

      try {
         const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               priceId,
               mode,
               userId: user.id,
               returnUrl: window.location.origin
            })
         });

         const data = await response.json();
         if (data.url) {
            window.location.href = data.url;
         } else {
            throw new Error(data.error);
         }
      } catch (error: any) {
         toast.error(error.message || "Failed to start checkout");
         setLoading(null);
      }
   };

   return (
      <div className="container max-w-5xl mx-auto py-20 px-6">
         <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-xl text-muted-foreground">Choose the plan that fits your needs.</p>
         </div>

         <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Monthly Plan */}
            <Card className="border-border hover:border-primary/50 transition-colors">
               <CardHeader>
                  <CardTitle className="text-2xl">Monthly</CardTitle>
                  <CardDescription>Perfect for consistent usage</CardDescription>
                  <div className="mt-4">
                     <span className="text-4xl font-bold">$9</span>
                     <span className="text-muted-foreground">/mo</span>
                  </div>
               </CardHeader>
               <CardContent className="space-y-4">
                  <ul className="space-y-2">
                     <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Unlimited Invoices</li>
                     <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> All Templates</li>
                     <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Email Delivery</li>
                     <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Priority Support</li>
                  </ul>
               </CardContent>
               <CardFooter>
                  <Button 
                     className="w-full" 
                     onClick={() => handleCheckout(PRICES.monthly, 'subscription')}
                     disabled={!!loading}
                  >
                     {loading === PRICES.monthly && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                     Subscribe Monthly
                  </Button>
               </CardFooter>
            </Card>

            {/* Lifetime Deal */}
            <Card className="border-primary shadow-lg shadow-primary/10 relative overflow-hidden">
               <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-bl-lg">
                  LIFETIME DEAL
               </div>
               <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                     Lifetime
                     <Zap className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  </CardTitle>
                  <CardDescription>Pay once, own it forever</CardDescription>
                  <div className="mt-4">
                     <span className="text-4xl font-bold">$79</span>
                     <span className="text-muted-foreground">/one-time</span>
                  </div>
               </CardHeader>
               <CardContent className="space-y-4">
                  <ul className="space-y-2">
                     <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> <strong>Everything in Monthly</strong></li>
                     <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> No Recurring Fees</li>
                     <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Future Updates Included</li>
                     <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> VIP Badge</li>
                  </ul>
               </CardContent>
               <CardFooter>
                  <Button 
                     className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700" 
                     onClick={() => handleCheckout(PRICES.lifetime, 'payment')}
                     disabled={!!loading}
                  >
                     {loading === PRICES.lifetime && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                     Get Lifetime Access
                  </Button>
               </CardFooter>
            </Card>
         </div>
      </div>
   );
}
