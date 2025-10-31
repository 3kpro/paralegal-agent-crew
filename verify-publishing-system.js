/**
 * Publishing System Verification Script
 * Tests the current state of social accounts and scheduled posts
 *
 * Usage:
 *   node verify-publishing-system.js
 *
 * Prerequisites:
 *   - User must be logged in to the application
 *   - Browser cookies with Supabase auth session required
 *
 * Note:
 *   This script requires authentication. To use it, you must:
 *   1. Log in to the application at http://localhost:3000/login
 *   2. Copy your Supabase auth token from browser cookies
 *   3. This script is mainly for debugging with database access
 *
 * Alternative:
 *   Use the web UI at /contentflow to check publishing status
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hvcmidkylzrhmrwyigqr.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2Y21pZGt5bHpyaG1yd3lpZ3FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NTI2NTEsImV4cCI6MjA3NTEyODY1MX0.3HNj-ktNjtM42bh6Ac5wGBKXiOLcNrN0S4ohazJpEdc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyPublishingSystem() {
  console.log('\n🔍 PUBLISHING SYSTEM VERIFICATION\n');
  console.log('='.repeat(60));

  try {
    // Check authentication
    console.log('\n📋 Step 1: Checking Authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('❌ No authenticated user found');
      console.log('   Please log in to the application first');
      return;
    }

    console.log('✅ User authenticated:', user.email);
    console.log('   User ID:', user.id);

    // Check social accounts
    console.log('\n📋 Step 2: Checking Social Accounts...');
    const { data: socialAccounts, error: accountsError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id);

    if (accountsError) {
      console.log('❌ Error fetching social accounts:', accountsError.message);
    } else if (!socialAccounts || socialAccounts.length === 0) {
      console.log('⚠️  No social accounts connected');
      console.log('   Go to /social-accounts to connect accounts');
    } else {
      console.log(`✅ Found ${socialAccounts.length} social account(s):`);
      socialAccounts.forEach(account => {
        console.log(`   • ${account.platform.toUpperCase()}: @${account.account_handle || account.platform_username}`);
        console.log(`     - Status: ${account.is_active ? 'ACTIVE' : 'INACTIVE'}`);
        console.log(`     - Connected: ${new Date(account.connected_at).toLocaleDateString()}`);
        console.log(`     - Token exists: ${account.access_token ? 'YES' : 'NO'}`);
        console.log(`     - Token length: ${account.access_token?.length || 0} chars`);
      });
    }

    // Check scheduled posts
    console.log('\n📋 Step 3: Checking Scheduled Posts...');
    const { data: scheduledPosts, error: postsError } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (postsError) {
      console.log('❌ Error fetching scheduled posts:', postsError.message);
    } else if (!scheduledPosts || scheduledPosts.length === 0) {
      console.log('⚠️  No scheduled posts found');
      console.log('   Create a campaign to generate posts');
    } else {
      console.log(`✅ Found ${scheduledPosts.length} recent post(s):`);

      const statusCounts = scheduledPosts.reduce((acc, post) => {
        acc[post.status] = (acc[post.status] || 0) + 1;
        return acc;
      }, {});

      console.log('   Status breakdown:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   • ${status}: ${count}`);
      });

      console.log('\n   Recent posts:');
      scheduledPosts.slice(0, 3).forEach((post, idx) => {
        console.log(`   ${idx + 1}. [${post.status.toUpperCase()}] ${post.platform} - ${post.title?.substring(0, 40) || 'Untitled'}...`);
        console.log(`      ID: ${post.id}`);
        if (post.status === 'failed') {
          console.log(`      ❌ Error: ${post.failed_reason}`);
        }
        if (post.status === 'published' && post.platform_url) {
          console.log(`      🔗 URL: ${post.platform_url}`);
        }
      });
    }

    // Check campaigns
    console.log('\n📋 Step 4: Checking Campaigns...');
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id, title, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (campaignsError) {
      console.log('❌ Error fetching campaigns:', campaignsError.message);
    } else if (!campaigns || campaigns.length === 0) {
      console.log('⚠️  No campaigns found');
    } else {
      console.log(`✅ Found ${campaigns.length} recent campaign(s):`);
      campaigns.forEach((campaign, idx) => {
        console.log(`   ${idx + 1}. [${campaign.status}] ${campaign.title}`);
        console.log(`      ID: ${campaign.id}`);
        console.log(`      Created: ${new Date(campaign.created_at).toLocaleDateString()}`);
      });
    }

    // Summary and recommendations
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 SYSTEM STATUS SUMMARY:');

    const hasAuth = !!user;
    const hasSocialAccounts = socialAccounts && socialAccounts.length > 0;
    const hasActiveSocialAccounts = socialAccounts?.some(acc => acc.is_active);
    const hasScheduledPosts = scheduledPosts && scheduledPosts.length > 0;
    const hasCampaigns = campaigns && campaigns.length > 0;

    console.log(`   Authentication: ${hasAuth ? '✅' : '❌'}`);
    console.log(`   Social Accounts: ${hasSocialAccounts ? '✅' : '⚠️'}`);
    console.log(`   Active Accounts: ${hasActiveSocialAccounts ? '✅' : '⚠️'}`);
    console.log(`   Scheduled Posts: ${hasScheduledPosts ? '✅' : '⚠️'}`);
    console.log(`   Campaigns: ${hasCampaigns ? '✅' : '⚠️'}`);

    console.log('\n💡 RECOMMENDATIONS:');
    if (!hasSocialAccounts) {
      console.log('   1. Connect at least one social media account');
      console.log('      → Visit http://localhost:3000/social-accounts');
    }
    if (!hasCampaigns) {
      console.log('   2. Create a campaign to generate content');
      console.log('      → Visit http://localhost:3000/campaigns/new');
    }
    if (hasScheduledPosts && hasSocialAccounts) {
      const testablePost = scheduledPosts.find(p => p.status === 'scheduled' || p.status === 'failed');
      if (testablePost) {
        console.log('   3. Ready to test publishing!');
        console.log(`      → Post ID to test: ${testablePost.id}`);
        console.log('      → Visit http://localhost:3000/contentflow and click "Publish Now"');
      }
    }

    console.log('\n' + '='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    console.error(error.stack);
  }
}

// Run verification
verifyPublishingSystem().catch(console.error);
