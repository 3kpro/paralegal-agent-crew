
/**
 * Viral Data Collector - Reddit Scraper
 * 
 * Usage: 
 *   npx tsx scripts/collect-viral-data.ts --mode=backfill
 *   npx tsx scripts/collect-viral-data.ts --mode=daily
 * 
 * Purpose:
 *   Scrapes high-performing headlines from Reddit to train the Viral Score™ algorithm.
 *   - Backfill: Fetches "Top of All Time" (The "Structural Brain")
 *   - Daily: Fetches "Top of Day" (The "Topical Brain")
 */

import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Configuration
const SUBREDDITS = [
  'entrepreneur',
  'marketing', 
  'technology',
  'business', 
  'startups',
  'productivity',
  'copywriting',
  'socialmedia',
  'content_marketing',
  'smallbusiness'
];

const BATCH_SIZE = 100;
const DELAY_MS = 2000; // Respect Reddit API limits

// Initialize Supabase (Service Role required for writing to training table)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  ups: number;
  num_comments: number;
  url: string;
  created_utc: number;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchSubredditPosts(subreddit: string, listing: 'top' | 'hot', timeFilter: 'all' | 'day' = 'day') {
  const url = `https://www.reddit.com/r/${subreddit}/${listing}.json`;
  const params = {
    limit: 100,
    t: listing === 'top' ? timeFilter : undefined
  };

  try {
    console.log(`📥 Fetching r/${subreddit} (${listing}/${timeFilter})...`);
    const response = await axios.get(url, { 
      params,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    return response.data?.data?.children?.map((child: any) => child.data) || [];
  } catch (error: any) {
    console.error(`❌ Error fetching r/${subreddit}:`, error.message);
    return [];
  }
}

async function saveToDatabase(posts: RedditPost[], subreddit: string, type: 'top_all_time' | 'top_day') {
  if (posts.length === 0) return;

  const validPosts = posts.filter(p => p.ups > 50 && p.title.length > 10); // Basic quality filter

  const rows = validPosts.map(post => ({
    external_id: post.id,
    title: post.title,
    content: post.selftext?.substring(0, 5000), // Truncate generous limit
    score: post.ups,
    comment_count: post.num_comments,
    source: 'reddit',
    sub_source: `r/${subreddit}`,
    url: post.url,
    viral_type: type,
    published_at: new Date(post.created_utc * 1000).toISOString(),
    created_at: new Date().toISOString()
  }));

  const { error } = await supabase
    .from('viral_content_training')
    .upsert(rows, { onConflict: 'source,external_id' }); // Prevent duplicates

  if (error) {
    console.error(`❌ DB Insert Error for r/${subreddit}:`, error.message);
  } else {
    console.log(`✅ Saved ${rows.length} posts from r/${subreddit}`);
  }
}

async function runCollector() {
  const args = process.argv.slice(2);
  const mode = args.find(arg => arg.startsWith('--mode='))?.split('=')[1] || 'daily';

  console.log(`🚀 Starting Viral Data Collector (Mode: ${mode})`);

  for (const subreddit of SUBREDDITS) {
    if (mode === 'backfill') {
      // Fetch Top of All Time
      const topPosts = await fetchSubredditPosts(subreddit, 'top', 'all');
      await saveToDatabase(topPosts, subreddit, 'top_all_time');
      await sleep(DELAY_MS);
    } 
    
    if (mode === 'daily' || mode === 'backfill') {
      // Fetch Rising/Hot for "Topical Brain"
      const hotPosts = await fetchSubredditPosts(subreddit, 'hot');
      await saveToDatabase(hotPosts, subreddit, 'top_day');
      await sleep(DELAY_MS);
    }
  }

  console.log('🏁 Collection Complete');
}

runCollector();
