/**
 * Viral DNA Enricher - FREE Gemini API (Zero Cost)
 *
 * Usage:
 *   npx tsx scripts/enrich-viral-data-free.ts
 *
 * Purpose:
 *   Takes raw viral headlines from Supabase and uses Google's FREE Gemini API
 *   to extract deep psychometric features ("Viral DNA").
 *
 * Cost: $0.00 (uses free tier Gemini API with API key authentication)
 *
 * REPLACEMENT FOR: enrich-viral-data-vertex.ts (which bills to Google Cloud)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Config
const MODEL_NAME = 'gemini-2.0-flash'; // FREE tier model
const BATCH_SIZE = 50; // Process in batches
const DELAY_MS = 4000; // 4 seconds between requests (respects 15 RPM free tier limit)

// Initialize Clients
const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('❌ Missing GOOGLE_API_KEY in .env.local');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: MODEL_NAME,
  generationConfig: {
    temperature: 0.4,
    responseMimeType: "application/json", // Ensures clean JSON output
  },
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper: Wait between API calls to respect rate limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function enrichViralData() {
  console.log('🧬 Starting Viral DNA Enrichment (FREE Gemini API)...');
  console.log(`📊 Model: ${MODEL_NAME}`);
  console.log(`⚡ Rate Limit: ${60000 / DELAY_MS} requests/minute`);

  // 1. Fetch Untagged Posts
  const { data: posts, error } = await supabase
    .from('viral_content_training')
    .select('id, title, content')
    .is('viral_dna', null) // Only process new ones
    .limit(BATCH_SIZE);

  if (error) {
    console.error('❌ Supabase Fetch Error:', error.message);
    return;
  }

  if (!posts || posts.length === 0) {
    console.log('✅ No untagged posts found. Database is fully enriched!');
    return;
  }

  console.log(`🔍 Processing ${posts.length} headlines...`);

  // 2. Loop and Enrich
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];

    try {
      console.log(`\n[${i + 1}/${posts.length}] 🧠 Analyzing: "${post.title.substring(0, 50)}..."`);

      const prompt = `
        Analyze this viral reddit headline and extract its "Viral DNA".
        Headline: "${post.title}"
        Content Snippet: "${post.content?.substring(0, 200) || ''}"

        Return strictly JSON with these keys:
        {
          "hook_type": "(Curiosity, Benefit, Fear, Story, How-to, List, Contrarian)",
          "emotion": "(Greed, Fear, Anger, Awe, Surprise, Hope)",
          "reading_level": "Grade 1-12",
          "mechanism": "Specific keywords or psychological trigger used",
          "score_logic": "Why this works in 1 sentence"
        }
      `;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Parse JSON (responseMimeType ensures it's already clean)
      const viralDna = JSON.parse(text);

      // 3. Save Back to DB
      const { error: updateError } = await supabase
        .from('viral_content_training')
        .update({ viral_dna: viralDna })
        .eq('id', post.id);

      if (updateError) {
        console.error(`  ❌ Save failed for ${post.id}:`, updateError.message);
        errorCount++;
      } else {
        console.log(`  ✨ Enriched! Type: ${viralDna.hook_type}, Emotion: ${viralDna.emotion}`);
        successCount++;
      }

      // Rate limit delay (except for last item)
      if (i < posts.length - 1) {
        await delay(DELAY_MS);
      }

    } catch (err: any) {
      console.error(`  ❌ Analysis Failed:`, err.message);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Enrichment Complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Total: ${posts.length}`);
  console.log(`💰 Cost: $0.00 (FREE tier)`);
  console.log('='.repeat(50));
}

enrichViralData();
