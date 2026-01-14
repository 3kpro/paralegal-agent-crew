import { stripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        if (!userId) {
            return new NextResponse("User ID not found in session", { status: 400 });
        }

        // Determine status based on mode
        const status = session.mode === 'subscription' ? 'pro_monthly' : 'pro_lifetime';

        // Update user in database
        const { error } = await supabase
            .from("users")
            .update({
                subscription_status: status,
                subscription_id: subscriptionId || null,
                customer_id: customerId,
                updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);

        if (error) {
            console.error("Error updating user subscription:", error);
            return new NextResponse("Database update failed", { status: 500 });
        }
    }

    return new NextResponse(null, { status: 200 });
}
