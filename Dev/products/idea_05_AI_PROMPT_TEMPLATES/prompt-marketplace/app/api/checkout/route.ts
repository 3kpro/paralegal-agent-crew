
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { MOCK_PROMPTS, MOCK_BUNDLES } from '@/lib/mockData';

export async function POST(req: Request) {
  try {
    const { promptId, bundleId } = await req.json();

    let productItem;
    let type;

    if (promptId) {
      productItem = MOCK_PROMPTS.find((p) => p.id === promptId);
      type = 'prompt';
    } else if (bundleId) {
      productItem = MOCK_BUNDLES.find((b) => b.id === bundleId);
      type = 'bundle';
    }

    if (!productItem) {
      return new NextResponse('Item not found', { status: 404 });
    }

    // If Stripe is not configured, return error
    // Users should use dev mode with ?dev=true for testing
    if (!stripe) {
      return new NextResponse('Payment system not configured. Use ?dev=true for testing.', { status: 503 });
    }

    const itemName = 'title' in productItem ? productItem.title : productItem.name;

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: itemName,
              description: productItem.description,
              metadata: {
                [type === 'prompt' ? 'promptId' : 'bundleId']: productItem.id,
              },
            },
            unit_amount: productItem.price, 
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}?canceled=true`,
      metadata: {
        [type === 'prompt' ? 'promptId' : 'bundleId']: productItem.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[STRIPE_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
