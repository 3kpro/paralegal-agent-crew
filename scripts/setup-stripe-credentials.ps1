Write-Host "🔐 Setting up Stripe environment variables in Vercel..." -ForegroundColor Cyan

# Function to add a secret to Vercel
function Add-VercelSecret {
    param (
        [string]$name,
        [string]$value,
        [string[]]$environments = @("production", "preview", "development")
    )
    
    foreach ($env in $environments) {
        Write-Host "Adding $name to $env environment..."
        if ($value) {
            vercel env rm $name $env -y 2>$null
            echo $value | vercel env add $name $env
        }
        else {
            Write-Host "⚠️ No value provided for $name" -ForegroundColor Yellow
        }
    }
}

Write-Host "Adding Stripe secrets to Vercel environments..." -ForegroundColor Green

# Add Stripe API keys
Add-VercelSecret "STRIPE_SECRET_KEY" $env:STRIPE_SECRET_KEY
Add-VercelSecret "STRIPE_WEBHOOK_SECRET" $env:STRIPE_WEBHOOK_SECRET

# Add Price IDs
Add-VercelSecret "STRIPE_PRO_MONTHLY_PRICE_ID" $env:STRIPE_PRO_MONTHLY_PRICE_ID
Add-VercelSecret "STRIPE_PRO_YEARLY_PRICE_ID" $env:STRIPE_PRO_YEARLY_PRICE_ID
Add-VercelSecret "STRIPE_PREMIUM_MONTHLY_PRICE_ID" $env:STRIPE_PREMIUM_MONTHLY_PRICE_ID
Add-VercelSecret "STRIPE_PREMIUM_YEARLY_PRICE_ID" $env:STRIPE_PREMIUM_YEARLY_PRICE_ID

Write-Host "✅ SETUP COMPLETE!" -ForegroundColor Green
Write-Host "Next steps:"
Write-Host "1. Run 'vercel --prod' to deploy with new environment variables"
Write-Host "2. Run 'vercel env ls' to verify all variables are set correctly"
Write-Host "3. Set up webhook endpoint in Stripe dashboard:"
Write-Host "   URL: $(vercel env pull .env.local 2>&1 | Select-String -Pattern "NEXT_PUBLIC_APP_URL" | ForEach-Object { $_.ToString().Split("=")[1].Trim() })/api/stripe/webhook"
Write-Host "   Events to listen for:"
Write-Host "   - checkout.session.completed"
Write-Host "   - customer.subscription.updated"
Write-Host "   - customer.subscription.deleted"
Write-Host "   - invoice.payment_failed"