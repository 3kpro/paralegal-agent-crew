import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config(); // Fallback to .env

import { createClient } from "@supabase/supabase-js";

// Environment check
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("❌ Missing Supabase URL or Key in .env");
  process.exit(1);
}

const supabase = createClient(url, key);

const CAMPAIGNS = [
  { name: "Winter Product Launch", type: "full", status: "published" },
  { name: "Tech Demo Series", type: "trending", status: "completed" },
  { name: "Weekly Newsletter Promo", type: "single", status: "scheduled" },
  { name: "Viral Video Test", type: "uploaded", status: "published" },
  { name: "Brand Awareness Q4", type: "full", status: "published" },
];

async function seedAnalytics() {
  console.log('🌱 Starting Analytics Seed...');

  // 1. Get the active user (who owns 'Campaign03' or similar)
  const { data: campaigns } = await supabase.from('campaigns').select('user_id').eq('name', 'Campaign03').limit(1);
  
  let userId;
  if (campaigns && campaigns.length > 0) {
      userId = campaigns[0].user_id;
      console.log(`🎯 Found active user via 'Campaign03': ${userId}`);
  } else {
      // Fallback to first user
      const { data: { users } } = await supabase.auth.admin.listUsers();
      if (!users || users.length === 0) {
        console.error("❌ No users found.");
        return;
      }
      userId = users[0].id;
      console.log(`👤 Using first user found: ${userId}`);
  }

  // 2. Create Campaigns
  const campaignIds: string[] = [];
  
  for (const camp of CAMPAIGNS) {
    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        user_id: userId,
        name: camp.name,
        // type: camp.type, // Column likely missing in DB
        status: camp.status,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        total_views: 0, // Will update later
        total_engagement: 0
      })
      .select()
      .single();

    if (error) {
       console.error(`⚠️ Failed to create campaign ${camp.name}:`, error.message);
    } else {
       console.log(`✅ Created ${camp.name}`);
       campaignIds.push(data.id);
    }
  }

  // 3. Generate 30 Days of History
  console.log('📊 Generating 30 days of analytics...');
  
  const today = new Date();
  const analyticsRows = [];

  for (const campaignId of campaignIds) {
    let totalViews = 0;
    let totalClicks = 0;
    
    // Create a base "vitality" for the campaign (some perform better)
    const vitality = Math.random() + 0.5; // 0.5 to 1.5 multiplier

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Random daily stats with trend (increasing slightly over time)
      const baseViews = Math.floor(Math.random() * 500 * vitality);
      const trendFactor = 1 + ((30 - i) / 30); // Newer dates get more traffic
      const views = Math.floor(baseViews * trendFactor);
      
      const likes = Math.floor(views * (Math.random() * 0.1)); // 10% engagement
      const shares = Math.floor(views * (Math.random() * 0.05));
      const comments = Math.floor(views * (Math.random() * 0.02));
      const clicks = Math.floor(views * (Math.random() * 0.08));

      totalViews += views;
      totalClicks += clicks;

      analyticsRows.push({
        campaign_id: campaignId,
        user_id: userId,
        platform: 'twitter', // Defaulting to twitter for seed
        tracked_at: dateStr, // Schema uses tracked_at
        impressions: views, // Schema uses impressions, not views
        clicks,
        likes,
        shares,
        comments,
        reach: Math.floor(views * 1.2),
        engagement_rate: 2.5
      });
    }

    // Update Campaign Totals
    await supabase.from('campaigns').update({
       total_views: totalViews,
       total_clicks: totalClicks,
       total_engagement: Math.floor(totalViews * 0.15)
    }).eq('id', campaignId);
  }

  // Bulk insert analytics
  // Batched to avoid request size limits
  const batchSize = 100;
  for (let i = 0; i < analyticsRows.length; i += batchSize) {
    const batch = analyticsRows.slice(i, i + batchSize);
    const { error } = await supabase.from('campaign_analytics').insert(batch);
    if (error) console.error("❌ Error inserting batch:", error.message);
  }

  console.log(`✨ Successfully seeded ${analyticsRows.length} analytics rows!`);
}

seedAnalytics().catch(console.error);
