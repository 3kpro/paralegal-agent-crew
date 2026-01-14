"use server";

import { stripe } from "@/lib/stripe";
import { auth, currentUser } from "@clerk/nextjs/server";
import { headers } from "next/headers";

export async function createCheckoutSession(priceId?: string, mode: 'payment' | 'subscription' = 'subscription') {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
        throw new Error("Unauthorized");
    }

    const host = headers().get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const origin = `${protocol}://${host}`;

    // Static Price IDs should be in .env.local
    // For this demonstration, we'll use a placeholder if not provided
    const session = await stripe.checkout.sessions.create({
        customer_email: user.emailAddresses[0]?.emailAddress,
        line_items: [
            {
                price: priceId || (mode === 'subscription' ? 'price_monthly_placeholder' : 'price_lifetime_placeholder'),
                quantity: 1,
            },
        ],
        mode: mode,
        success_url: `${origin}/dashboard?success=true`,
        cancel_url: `${origin}/pricing?canceled=true`,
        client_reference_id: userId,
        metadata: {
            clerkUserId: userId,
        },
    });

    return { url: session.url };
}
