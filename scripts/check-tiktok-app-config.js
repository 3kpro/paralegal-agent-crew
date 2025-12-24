#!/usr/bin/env node

/**
 * TikTok App Configuration Checker
 * Helps verify your TikTok Developer App settings
 */

const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;

console.log('=== TikTok App Configuration Checklist ===\n');

console.log('📋 Required Configuration in TikTok Developer Portal:\n');

console.log('1. App Status');
console.log('   Go to: https://developers.tiktok.com/');
console.log('   → Your App → Overview');
console.log('   Status should be: ✅ Live (not Development)');

console.log('\n2. Login Kit Enabled');
console.log('   Go to: https://developers.tiktok.com/');
console.log('   → Your App → Login Kit');
console.log('   ✅ Login Kit should be enabled/installed');

console.log('\n3. Redirect URIs Configured');
console.log('   Go to: https://developers.tiktok.com/');
console.log('   → Your App → Login Kit → Redirect URIs');
console.log('   Must include (EXACT match, no trailing slash):');
console.log('   • http://localhost:3000/api/auth/callback/tiktok');
console.log('   • https://yourdomain.com/api/auth/callback/tiktok');

console.log('\n4. Scopes Approved');
console.log('   Go to: https://developers.tiktok.com/');
console.log('   → Your App → Scopes');
console.log('   Currently requesting scope:');
console.log('   • user.info.basic - Should be ✅ Approved (auto-added for Login Kit apps)');

console.log('\n⚠️  Additional Scopes (Optional):');
console.log('   For video publishing, you need:');
console.log('   • video.publish - Requires Content Posting API approval (3-7 days)');
console.log('   • Apply at: https://developers.tiktok.com/doc/content-posting-api-get-started/');

console.log('\n🔍 Common Issues:\n');

const issues = [
  {
    check: 'App in Development mode',
    solution: 'Change to Live mode in TikTok Developer Portal'
  },
  {
    check: 'Redirect URI mismatch',
    solution: 'Match EXACT URL in portal (no trailing slash, correct http/https)'
  },
  {
    check: 'Scope not approved',
    solution: 'Check Scopes tab - user.info.basic should be auto-approved'
  },
  {
    check: 'Missing Login Kit',
    solution: 'Add Login Kit product to your app'
  },
  {
    check: 'Error: "scope" parameter issue',
    solution: 'Your app may not have user.info.basic scope enabled'
  }
];

issues.forEach((issue, i) => {
  console.log(`[${i+1}] ${issue.check}`);
  console.log(`    Solution: ${issue.solution}`);
  console.log('');
});

console.log('📝 Current OAuth URL Configuration:\n');

if (TIKTOK_CLIENT_KEY) {
  const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${TIKTOK_CLIENT_KEY}&scope=user.info.basic&response_type=code&redirect_uri=${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback/tiktok&state=random`;
  console.log('Authorization URL (first 150 chars):');
  console.log(authUrl.substring(0, 150) + '...');
  console.log('');
  console.log('✅ TIKTOK_CLIENT_KEY is configured');
} else {
  console.log('❌ TIKTOK_CLIENT_KEY not found in environment');
  console.log('   Add to .env.local:');
  console.log('   TIKTOK_CLIENT_KEY=your_client_key_here');
}

console.log('\n🚀 Next Steps:\n');
console.log('1. Go to TikTok Developer Portal and verify all items above');
console.log('2. If any items are missing, configure them');
console.log('3. Wait 1-2 minutes after changing Redirect URIs');
console.log('4. Try connecting TikTok again in your app');

console.log('\n📚 Helpful Links:\n');
console.log('• TikTok Developer Portal: https://developers.tiktok.com/');
console.log('• Login Kit Web Guide: https://developers.tiktok.com/doc/login-kit-web/');
console.log('• Scopes Reference: https://developers.tiktok.com/doc/tiktok-api-scopes');
console.log('• Content Posting API: https://developers.tiktok.com/doc/content-posting-api-get-started/');

console.log('\n=== Configuration Checklist Complete ===\n');
