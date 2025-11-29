const Stripe = require('stripe');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load .env.local manually to ensure we get the values
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const stripe = new Stripe(envConfig.STRIPE_SECRET_KEY.trim());

async function listPrices() {
    try {
        console.log('Fetching products and prices...');
        const products = await stripe.products.list({ active: true, expand: ['data.default_price'] });
        const prices = await stripe.prices.list({ active: true, limit: 100, expand: ['data.product'] });

        console.log('\n--- FOUND PRODUCTS & PRICES ---');

        prices.data.forEach(price => {
            const productName = price.product.name;
            const amount = price.unit_amount / 100;
            const currency = price.currency.toUpperCase();
            const interval = price.recurring ? price.recurring.interval : 'one-time';

            console.log(`Product: ${productName}`);
            console.log(`  Price ID: ${price.id}`);
            console.log(`  Amount: ${amount} ${currency} (${interval})`);
            console.log('---');
        });

    } catch (error) {
        console.error('Error fetching prices:', error.message);
    }
}

listPrices();
