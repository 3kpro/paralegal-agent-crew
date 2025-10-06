// Quick test script to verify Premium Stripe API functionality
const axios = require('axios')

async function testPremiumUpgrade() {
  try {
    console.log('🧪 Testing Premium upgrade API...')
    
    const response = await axios.post('http://localhost:3000/api/stripe/checkout', {
      tier: 'premium',
      billingCycle: 'monthly'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    console.log('✅ Premium API Response Status:', response.status)
    console.log('✅ Premium API Response Data:', response.data)
    
    if (response.data.success && response.data.url) {
      console.log('🎉 Premium checkout URL created successfully!')
      console.log('💳 Stripe URL:', response.data.url)
    } else {
      console.log('❌ Premium checkout failed:', response.data.error)
    }
    
  } catch (error) {
    console.log('❌ Premium API Error:', error.response?.data || error.message)
    
    if (error.response?.status === 401) {
      console.log('🔒 Authentication required - this is expected for direct API call')
      console.log('✅ API endpoint is responding correctly')
    }
  }
}

testPremiumUpgrade()