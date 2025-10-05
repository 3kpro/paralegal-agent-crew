import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { stripe, STRIPE_PRICES } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tier, billingCycle } = body // tier: 'pro' | 'premium', billingCycle: 'monthly' | 'yearly'

    if (!tier || !billingCycle) {
      return NextResponse.json({
        error: 'Missing required fields: tier and billingCycle'
      }, { status: 400 })
    }

    // Get the correct price ID
    const priceKey = `${tier.toUpperCase()}_${billingCycle.toUpperCase()}` as keyof typeof STRIPE_PRICES
    const priceId = STRIPE_PRICES[priceKey]

    if (!priceId) {
      return NextResponse.json({
        error: 'Invalid tier or billing cycle'
      }, { status: 400 })
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email || user.email,
        metadata: {
          supabase_user_id: user.id
        }
      })
      customerId = customer.id

      // Save customer ID to profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?canceled=true`,
      metadata: {
        supabase_user_id: user.id,
        tier: tier,
        billing_cycle: billingCycle
      },
      allow_promotion_codes: true,
    })

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url
    })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  }
}
