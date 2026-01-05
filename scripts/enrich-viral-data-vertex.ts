
/**
 * Viral DNA Enricher - Vertex AI (Burn Credits for Value)
 * 
 * Usage:
 *   npx tsx scripts/enrich-viral-data-vertex.ts
 * 
 * Purpose:
 *   Takes raw viral headlines from Supabase and uses Google's Vertex AI (Gemini Pro)
 *   to extract deep psychometric features ("Viral DNA").
 *   This converts temporary Cloud Credits into permanent proprietary data.
 */

import { VertexAI } from '@google-cloud/vertexai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Config
const PROJECT_ID = '3kpro-gemini'; // Your credit-funded project
const LOCATION = 'u-central1';
const MODEL_NAME = 'gemini-1.5-pro-preview-0409'; // Use specific powerful model

// Initialize Clients
const vertexAi = new VertexAI({ project: PROJECT_ID, location: LOCATION });
const model = vertexAi.getGenerativeModel({ model: MODEL_NAME });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function enrichViralData() {
  console.log('🧬 Starting Viral DNA Enrichment (Vertex AI)...');

  // 1. Fetch Untagged Posts
  // We look for posts that don't have 'viral_dna' yet
  const { data: posts, error } = await supabase
    .from('viral_content_training')
    .select('id, title, content')
    .is('viral_dna', null) // Only process new ones
    .limit(50); // Process in batches to monitor

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
  for (const post of posts) {
    try {
      console.log(`🧠 Analyzing: "${post.title.substring(0, 50)}..."`);
      
      const prompt = `
        Analyze this viral reddit headline and extract its "Viral DNA".
        Headline: "${post.title}"
        Content Snippet: "${post.content?.substring(0, 200) || ''}"

        Return strictly JSON with these keys:
        - hook_type: (Curiosity, Benefit, Fear, Story, How-to, List, Contrarian)
        - emotion: (Greed, Fear, Anger, Awe, Surprise, Hope)
        - reading_level: (Grade 1-12)
        - mechanism: (Specific keywords or psychological trigger used)
        - score_logic: (Why this works in 1 sentence)
      `;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.candidates?.[0].content.parts[0].text;

      // Clean JSON (Markdown strip)
      const cleanJson = text?.replace(/```json/g, '').replace(/```/g, '').trim();
      
      if (cleanJson) {
        const viralDna = JSON.parse(cleanJson);

        // 3. Save back to DB
        const { error: updateError } = await supabase
          .from('viral_content_training')
          .update({ viral_dna: viralDna }) // Assuming you added this JSONB column
          .eq('id', post.id);

        if (updateError) {
          console.error(`  ❌ Save failed for ${post.id}:`, updateError.message);
        } else {
          console.log(`  ✨ Enriched! Type: ${viralDna.hook_type}, Emotion: ${viralDna.emotion}`);
        }
      }

    } catch (err: any) {
      console.error(`  ❌ Analysis Failed:`, err.message);
    }
  }
}

enrichViralData();
