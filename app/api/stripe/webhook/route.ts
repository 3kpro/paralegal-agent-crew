import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    // Verify webhook signature
    let event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const supabase = await createClient()

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any

        // Get metadata from session
        const userId = session.metadata.supabase_user_id
        const tier = session.metadata.tier // 'pro' or 'premium'
        const billingCycle = session.metadata.billing_cycle

        // Get subscription details
        const subscriptionId = session.subscription
        const customerId = session.customer

        // Update user profile with subscription
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            subscription_tier: tier,
            subscription_status: 'active',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_started_at: new Date().toISOString(),
            // Set AI tools limit based on tier
            ai_tools_limit: tier === 'pro' ? 3 : 999,
          })
          .eq('id', userId)

        if (profileError) {
          console.error('Error updating profile:', profileError)
          return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
        }

        console.log(`✅ Subscription activated for user ${userId}: ${tier} (${billingCycle})`)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any

        // Find user by Stripe customer ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', subscription.customer)
          .single()

        if (!profile) {
          console.error('Profile not found for customer:', subscription.customer)
          break
        }

        // Update subscription status
        const status = subscription.status // active, past_due, canceled, etc.

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            subscription_status: status,
            // If canceled or past_due, downgrade to free tier
            ...(status === 'canceled' || status === 'past_due' ? {
              subscription_tier: 'free',
              ai_tools_limit: 1,
              subscription_ended_at: new Date().toISOString()
            } : {})
          })
          .eq('id', profile.id)

        if (updateError) {
          console.error('Error updating subscription:', updateError)
        }

        console.log(`📝 Subscription updated for customer ${subscription.customer}: ${status}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any

        // Find user by Stripe customer ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', subscription.customer)
          .single()

        if (!profile) {
          console.error('Profile not found for customer:', subscription.customer)
          break
        }

        // Downgrade to free tier
        const { error: downgradeError } = await supabase
          .from('profiles')
          .update({
            subscription_tier: 'free',
            subscription_status: 'canceled',
            ai_tools_limit: 1,
            stripe_subscription_id: null,
            subscription_ended_at: new Date().toISOString()
          })
          .eq('id', profile.id)

        if (downgradeError) {
          console.error('Error downgrading user:', downgradeError)
        }

        console.log(`❌ Subscription canceled for customer ${subscription.customer}`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any

        // Find user by Stripe customer ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('stripe_customer_id', invoice.customer)
          .single()

        if (!profile) {
          console.error('Profile not found for customer:', invoice.customer)
          break
        }

        // Update status to past_due
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'past_due'
          })
          .eq('id', profile.id)

        console.log(`⚠️ Payment failed for customer ${invoice.customer}`)
        // TODO: Send email notification to user
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
