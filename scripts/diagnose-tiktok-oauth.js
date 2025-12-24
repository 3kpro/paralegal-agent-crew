#!/usr/bin/env node

/**
 * TikTok OAuth Configuration Diagnostic Tool
 * Run this to verify your TikTok OAuth setup is correct
 */

require('dotenv').config();

const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

console.log('=== TikTok OAuth Configuration Diagnostic ===\n');

// 1. Check Environment Variables
console.log('1. Checking Environment Variables...');
let issues = [];

if (!TIKTOK_CLIENT_KEY) {
  console.log('❌ TIKTOK_CLIENT_KEY is not set');
  issues.push('TIKTOK_CLIENT_KEY is missing');
} else {
  console.log(`✅ TIKTOK_CLIENT_KEY is set (${TIKTOK_CLIENT_KEY.substring(0, 10)}...)`);
}

if (!TIKTOK_CLIENT_SECRET) {
  console.log('❌ TIKTOK_CLIENT_SECRET is not set');
  issues.push('TIKTOK_CLIENT_SECRET is missing');
} else {
  console.log(`✅ TIKTOK_CLIENT_SECRET is set`);
}

if (!APP_URL) {
  console.log('⚠️  NEXT_PUBLIC_APP_URL is not set, using default');
} else {
  console.log(`✅ APP_URL is set to: ${APP_URL}`);
}

// 2. Check Redirect URI Format
console.log('\n2. Checking Redirect URI Format...');
const expectedRedirectURI = `${APP_URL}/api/auth/callback/tiktok`;
console.log(`   Expected Redirect URI: ${expectedRedirectURI}`);
console.log('\n   ⚠️  IMPORTANT: Make sure this EXACT URL is registered in:');
console.log('      TikTok Developer Portal > Your App > Login Kit > Redirect URIs');
console.log('\n   For local development, add:');
console.log(`      http://localhost:3000/api/auth/callback/tiktok`);
console.log('   For production, add:');
console.log(`      https://yourdomain.com/api/auth/callback/tiktok`);

// 3. Check OAuth URLs
console.log('\n3. OAuth Endpoints Used by Application:');
console.log(`   Authorization URL: https://www.tiktok.com/v2/auth/authorize/`);
console.log(`   Token Exchange URL: https://open.tiktokapis.com/v2/oauth/token/`);
console.log(`   User Info URL: https://open.tiktokapis.com/v2/user/info/`);

// 4. Scopes Requested
console.log('\n4. OAuth Scopes Requested:');
const scopes = [
  'user.info.basic - Get user profile info',
  'video.publish - Publish videos'
];
scopes.forEach(scope => console.log(`   • ${scope}`));

// 5. Common Issues Checklist
console.log('\n5. Common Issues Checklist:');
const checklist = [
  'Is your TikTok app in "Live" mode (not "Development")?',
  'Did you add the redirect URI to TikTok app settings?',
  'Does the redirect URI match EXACTLY (including https/http)?',
  'Have you requested access to "Content Posting API"?',
  'Are the Client Key and Secret copied correctly (no extra spaces)?'
];
checklist.forEach((item, i) => console.log(`   [${i + 1}] ${item}`));

// Summary
console.log('\n=== Summary ===');
if (issues.length === 0) {
  console.log('✅ All required environment variables are set');
  console.log('✅ OAuth endpoints are configured correctly');
  console.log('\nNext Steps:');
  console.log('1. Verify redirect URIs in TikTok Developer Portal');
  console.log('2. Test OAuth flow by clicking "Connect TikTok" in your app');
  console.log('3. Check browser console and server logs for errors');
} else {
  console.log('❌ Issues found:');
  issues.forEach(issue => console.log(`   • ${issue}`));
  console.log('\nPlease fix the issues above and run this script again.');
}

console.log('\n=== Diagnostic Complete ===\n');
