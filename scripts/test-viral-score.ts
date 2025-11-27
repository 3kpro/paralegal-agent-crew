
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { calculateViralScore } from '../lib/viral-score';

async function runTest() {
  console.log("🧪 Testing Viral Score Algorithm (AI-First Mode)...\n");

  const testCases = [
    {
      name: "Mega Trend (High Volume)",
      input: {
        title: "Super Bowl 2025 Halftime Show",
        formattedTraffic: "5M+ searches",
        sources: ["google", "twitter", "reddit", "news"],
        firstSeenAt: new Date(Date.now() - 1000 * 60 * 60)
      }
    },
    {
      name: "AI Generated Idea (Zero Volume, High Potential)",
      input: {
        title: "How to use AI for Content Marketing",
        formattedTraffic: "0 searches",
        sources: ["gemini-ai"],
        firstSeenAt: new Date()
      }
    }
  ];

  for (const test of testCases) {
    const result = await calculateViralScore(test.input);
    console.log(`📋 Case: ${test.name}`);
    console.log(`   Input: "${test.input.title}"`);
    console.log(`   🏆 Score: ${result.viralScore}/100 (${result.viralPotential})`);
    console.log(`   📊 Factors: Volume=${result.viralFactors.volume}, MultiSource=${result.viralFactors.multiSource}, Freshness=${result.viralFactors.freshness}, Keywords=${result.viralFactors.keywordBoost}, AI=${result.viralFactors.aiAnalysis}`);
    if (result.aiReasoning) console.log(`   🤖 AI Reasoning: ${result.aiReasoning}`);
    console.log("---------------------------------------------------\n");
  }
}

runTest().catch(console.error);
