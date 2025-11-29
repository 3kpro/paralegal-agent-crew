
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { calculateViralScore } from '../lib/viral-score';

const REAL_WORLD_DATA = [
  // Hacker News (Tech/Business Niche)
  { source: "Hacker News", title: "Migrating the main Zig repository from GitHub to Codeberg" },
  { source: "Hacker News", title: "Penpot: The Open-Source Figma" },
  { source: "Hacker News", title: "DIY NAS: 2026 Edition" },
  { source: "Hacker News", title: "Willis Whitfield: A simple man with a simple solution that changed the world" },
  { source: "Hacker News", title: "Voyager 1 is about to reach one light-day from Earth" },
  { source: "Hacker News", title: "Music eases surgery and speeds recovery, study finds" },
  { source: "Hacker News", title: "Coq: The World's Best Macro Assembler? [pdf] [2013]" },
  { source: "Hacker News", title: "G0-G3 corners, visualised: learn what \"Apple corners\" are" },
  { source: "Hacker News", title: "Principles of Vasocomputation" },
  { source: "Hacker News", title: "S&box is now an open source game engine" },

  // Google Trends (Mass Appeal)
  { source: "Google Trends", title: "walmart thanksgiving hours" },
  { source: "Google Trends", title: "national guard shot in dc" },
  { source: "Google Trends", title: "thanksgiving" },
  { source: "Google Trends", title: "hong kong fire" },
  { source: "Google Trends", title: "macy's parade" },
  { source: "Google Trends", title: "netflix" },
  { source: "Google Trends", title: "día de acción de gracias" },
  { source: "Google Trends", title: "monterrey - américa" },
  { source: "Google Trends", title: "rockets vs warriors" },
  { source: "Google Trends", title: "holly stranger things" },

  // Controls (Should be Low)
  { source: "Control", title: "My grocery list for tuesday" },
  { source: "Control", title: "Test post please ignore" },
  { source: "Control", title: "Meeting notes 2025-11-26" }
];

async function runValidation() {
  console.log("🧪 Validating Viral Score on 23 Real-World Examples");
  console.log("ℹ️  Condition: ZERO Volume/History (Testing Pure AI Prediction)\n");
  console.log("| Source | Score | Potential | Title |");
  console.log("|---|---|---|---|");

  for (const item of REAL_WORLD_DATA) {
    // Simulate "New" content with no history
    const input = {
      title: item.title,
      formattedTraffic: "0 searches",
      sources: ["manual_entry"],
      firstSeenAt: new Date()
    };

    try {
      const result = await calculateViralScore(input);
      const emoji = result.viralPotential === 'high' ? '🔥' : result.viralPotential === 'medium' ? '⚡' : '📉';
      
      // Pad source for alignment
      const source = item.source.padEnd(13, ' ');
      
      console.log(`| ${source} | **${result.viralScore}** ${emoji} | ${result.viralPotential.toUpperCase()} | ${item.title} |`);
      
      // Optional: Log reasoning for debugging if needed
      // console.log(`   > ${result.aiReasoning}\n`);
      
    } catch (e) {
      console.error(`Error processing ${item.title}:`, e);
    }
  }
}

runValidation().catch(console.error);
