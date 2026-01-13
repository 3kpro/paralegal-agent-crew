import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin for user verification
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { priceId, mode, userId, returnUrl } = await request.json();

    if (!priceId || !userId) {
      return NextResponse.json({ error: 'Missing priceId or userId' }, { status: 400 });
    }

    // Get user email
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (userError || !user || !user.email) {
       return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has a customer ID in profiles
    const { data: profile } = await supabaseAdmin
       .from('profiles')
       .select('stripe_customer_id')
       .eq('id', userId)
       .single();

    let customerId = profile?.stripe_customer_id;

    // If no customer ID, create one
    if (!customerId) {
       const customer = await stripe.customers.create({
          email: user.email,
          metadata: { userId: userId }
       });
       customerId = customer.id;

       // Save to profile
       await supabaseAdmin
          .from('profiles')
          .update({ stripe_customer_id: customerId })
          .eq('id', userId);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode, // 'subscription' or 'payment'
      success_url: `${returnUrl}?success=true`,
      cancel_url: `${returnUrl}?canceled=true`,
      metadata: {
         userId: userId
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
