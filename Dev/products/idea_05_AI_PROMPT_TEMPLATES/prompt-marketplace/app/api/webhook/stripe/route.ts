
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import Stripe from 'stripe';

export async function POST(req: Request) {
  // If Stripe is not configured, webhooks won't work anyway
  if (!stripe) {
    return new NextResponse('Stripe not configured', { status: 503 });
  }

  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === 'checkout.session.completed') {
    // Fulfill the purchase
    const promptId = session.metadata?.promptId;
    const bundleId = session.metadata?.bundleId;
    const userId = session.metadata?.userId || 'guest-user-id'; // Fallback
    const amountPaid = session.amount_total || 0;
    const paymentId = session.payment_intent as string;

    if (promptId || bundleId) {
       // Insert into Supabase (only if configured)
       if (supabaseAdmin) {
         const { error } = await (supabaseAdmin as any).from('purchases').insert({
           user_id: userId, // This assumes user exists in profiles or we handle guest
           prompt_id: promptId || null,
           bundle_id: bundleId || null,
           amount_paid: amountPaid,
           stripe_payment_id: paymentId,
         });

         if (error) {
           console.error('Error inserting purchase:', error);
         }
       } else {
         console.log('Supabase not configured - purchase not recorded');
       }
    }
  }

  return new NextResponse(null, { status: 200 });
}
