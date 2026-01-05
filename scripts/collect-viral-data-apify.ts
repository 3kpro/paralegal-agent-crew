
/**
 * Viral Data Collector - Apify Integration (Safe & Legal Mode)
 * 
 * Usage: 
 *   npx tsx scripts/collect-viral-data-apify.ts
 * 
 * Prerequisites:
 *   - APIFY_API_TOKEN in .env.local
 * 
 * Purpose:
 *   Uses Apify's "Reddit Scraper" Actor to fetch high-performing content without 
 *   risking IP bans or legal issues. This is the "Production Ready" method.
 */

import { ApifyClient } from 'apify-client';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Configuration
const SUBREDDITS = [
  'entrepreneur', 'marketing', 'technology', 'business', 
  'startups', 'productivity', 'copywriting', 'socialmedia',
  'content_marketing', 'smallbusiness',
  'sidehustle', 'growthhacking', 'SaaS', 'blitzscaling' // Extended list for max value
];

// Initialize Clients
const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function runApifyCollector() {
  if (!process.env.APIFY_API_TOKEN) {
    console.error('❌ Missing APIFY_API_TOKEN. Please add it to your .env.local file.');
    console.log('👉 Get one for free at https://console.apify.com/settings/integrations');
    process.exit(1);
  }

  console.log('🚀 Starting Apify Collector (Safe Mode)...');

  // 1. Loop through subreddits and run the actor for each
  for (const sub of SUBREDDITS) {
    // Input for "fatihtahta/reddit-scraper-search-fast"
    // Requires specific schema: { subredditName: "string", ... }
    const actorInput = {
      subredditName: sub,
      subredditSort: "top",
      subredditTimeframe: "month",
      maxPosts: 50,
      scrapeComments: false
    };

    try {
      console.log(`⏳ Sending job to Apify cloud for r/${sub}...`);
      const run = await apifyClient.actor('fatihtahta/reddit-scraper-search-fast').call(actorInput);

      console.log(`✅ Job finished for r/${sub}! Fetching results...`);

      // 2. Fetch Results
      const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
      
      // 3. Transform & Save
      const validPosts = items
        .filter((post: any) => post.upVotes > 50 && post.title?.length > 10)
        .map((post: any) => ({
          external_id: post.id || post.url.split('/').slice(-2, -1)[0],
          title: post.title,
          content: post.body?.substring(0, 5000) || '',
          score: post.upVotes,
          comment_count: post.numberOfComments || 0,
          source: 'reddit',
          sub_source: post.subredditName || sub,
          url: post.url,
          viral_type: 'top_month_apify',
          published_at: post.createdAt ? new Date(post.createdAt).toISOString() : new Date().toISOString(),
          created_at: new Date().toISOString()
        }));

      if (validPosts.length > 0) {
        console.log(`💾 Saving ${validPosts.length} posts from r/${sub}...`);
        const { error } = await supabase
          .from('viral_content_training')
          .upsert(validPosts, { onConflict: 'source,external_id' });
        
        if (error) console.error('❌ DB Save Error:', error.message);
      }
    } catch (err: any) {
      console.error(`❌ Error scraping r/${sub}:`, err.message);
    }
  }
  console.log('🏆 Apify Collection Complete!');
}

runApifyCollector().catch(console.error);
