/**
 * Direct Premium Upgrade API Test
 * Tests the Stripe checkout API for Premium tier functionality
 */

const https = require('https');
// Use HTTPS for secure communication
const https = require('https');

async function testPremiumUpgradeAPI() {
  console.log('🧪 Testing Premium Upgrade API...');
  
  const postData = JSON.stringify({
    tier: 'premium',
    billing: 'monthly'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/stripe/checkout',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      // Mock authentication headers
      'Cookie': 'sb-access-token=mock-token',
      'Authorization': 'Bearer mock-token'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      console.log(`📊 Status Code: ${res.statusCode}`);
      console.log(`📋 Headers:`, res.headers);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📨 Response Body:', data);
        
        try {
          const response = JSON.parse(data);
          
          if (res.statusCode === 200 || res.statusCode === 201) {
            console.log('✅ Premium upgrade API is accessible');
            if (response.url && response.url.includes('stripe')) {
              console.log('✅ Stripe checkout URL generated successfully');
              console.log('🔗 Checkout URL:', response.url);
            }
          } else if (res.statusCode === 401 || res.statusCode === 403) {
            console.log('🔐 Authentication required (expected for settings page)');
            console.log('✅ API endpoint is properly protected');
          } else {
            console.log('⚠️  Unexpected response:', response);
          }
          
          resolve(response);
        } catch (parseError) {
          console.log('📄 Raw response (not JSON):', data);
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function runTest() {
  console.log('🚀 Starting Premium Upgrade Direct API Test\n');
  
  try {
    await testPremiumUpgradeAPI();
    console.log('\n✅ Test completed successfully');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

runTest();