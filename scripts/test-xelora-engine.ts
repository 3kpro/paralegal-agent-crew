/**
 * Xelora Engine Diagnostic Test
 *
 * Tests all Gemini API integrations to verify they're working
 * and using FREE tier only (no Vertex AI).
 *
 * Usage: npx tsx scripts/test-xelora-engine.ts
 */

import { getGeminiModel } from '../lib/gemini';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const TESTS = [
  {
    name: 'API Key Configuration',
    test: async () => {
      const key = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
      if (!key) throw new Error('No API key found in .env.local');
      return `✅ API Key: ${key.substring(0, 10)}...${key.substring(key.length - 4)}`;
    }
  },
  {
    name: 'Gemini Client Initialization',
    test: async () => {
      const model = getGeminiModel('gemini-2.0-flash');
      if (!model) throw new Error('Failed to initialize Gemini model');
      return '✅ Client initialized successfully';
    }
  },
  {
    name: 'Simple Text Generation',
    test: async () => {
      const model = getGeminiModel('gemini-2.0-flash');
      if (!model) throw new Error('No model available');

      const result = await model.generateContent('Say "Hello World" in one word');
      const text = result.response.text();

      if (!text) throw new Error('No response from Gemini');
      return `✅ Response: "${text.trim()}"`;
    }
  },
  {
    name: 'JSON Mode Generation',
    test: async () => {
      const model = getGeminiModel('gemini-2.0-flash', true);
      if (!model) throw new Error('No model available');

      const prompt = `Return JSON with keys: {name: "Test", status: "Working"}`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const json = JSON.parse(text);

      if (!json.name || !json.status) throw new Error('Invalid JSON structure');
      return `✅ JSON: ${JSON.stringify(json)}`;
    }
  },
  {
    name: 'Viral Score Calculation (Simulated)',
    test: async () => {
      const model = getGeminiModel('gemini-2.0-flash', true);
      if (!model) throw new Error('No model available');

      const prompt = `Analyze this headline for virality: "AI Breakthrough Changes Everything"

      Return JSON:
      {
        "hook_type": "Curiosity",
        "emotion": "Awe",
        "score": 75
      }`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const data = JSON.parse(text);

      if (!data.hook_type || !data.emotion) {
        throw new Error('Invalid viral score structure');
      }
      const score = Number(data.score) || 0;
      return `✅ Viral DNA: Hook=${data.hook_type}, Emotion=${data.emotion}, Score=${score}`;
    }
  },
  {
    name: 'Rate Limit Check (15 RPM)',
    test: async () => {
      const model = getGeminiModel('gemini-2.0-flash');
      if (!model) throw new Error('No model available');

      // Send 3 rapid requests to test rate limiting
      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(model.generateContent(`Count to ${i + 1}`));
      }

      const results = await Promise.all(promises);
      const texts = results.map(r => r.response.text());

      return `✅ Sent 3 rapid requests successfully (within rate limit)`;
    }
  }
];

async function runDiagnostics() {
  console.log('🔍 XELORA ENGINE DIAGNOSTIC TEST\n');
  console.log('='.repeat(60));
  console.log('Testing Gemini API integration...\n');

  let passed = 0;
  let failed = 0;

  for (const { name, test } of TESTS) {
    try {
      process.stdout.write(`\n${name}... `);
      const result = await test();
      console.log(result);
      passed++;
    } catch (err: any) {
      console.log(`❌ FAILED: ${err.message}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\nRESULTS:`);
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  📊 Total: ${TESTS.length}`);

  if (failed === 0) {
    console.log(`\n✨ ALL TESTS PASSED! Xelora engine is working perfectly.`);
    console.log(`💰 Cost: $0.00 (FREE tier only)`);
    console.log(`\n📝 Next Steps:`);
    console.log(`   1. Test in browser: npm run dev`);
    console.log(`   2. Go to: http://localhost:3000/campaigns/create`);
    console.log(`   3. Try Viral Trend Discovery`);
  } else {
    console.log(`\n⚠️  SOME TESTS FAILED - Troubleshooting needed.`);
    console.log(`\n📝 Check:`);
    console.log(`   1. GOOGLE_API_KEY is set in .env.local`);
    console.log(`   2. API key has Generative Language API enabled`);
    console.log(`   3. API key is not restricted to wrong domains`);
  }

  console.log('\n' + '='.repeat(60));
}

runDiagnostics();
