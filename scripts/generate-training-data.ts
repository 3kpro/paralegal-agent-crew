/**
 * SCRIPT: generate-training-data.ts
 *
 * PURPOSE:
 * Generates a synthetic training dataset for the Viral Score™ ML model.
 * It uses Google's Gemini AI to act as a domain expert, creating a diverse
 * set of trend examples with a "ground truth" viral score.
 *
 * This solves the "cold start" problem by creating a high-quality dataset
 * before collecting real user data.
 *
 * USAGE:
 * 1. Ensure GOOGLE_API_KEY is set in your .env file.
 * 2. Run from the root directory: `npx tsx ./scripts/generate-training-data.ts`
 *
 * OUTPUT:
 * A `training-data.csv` file in the `scripts/` directory, ready for upload
 * to a Vertex AI Dataset.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";
import { promises as fs } from "fs";
import path from "path";

// Load environment variables from .env file
config();

const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) {
  throw new Error("GOOGLE_API_KEY is not set in the environment variables.");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const SAMPLES_TO_GENERATE = 1000; // Generate 1000 examples for a robust dataset
const OUTPUT_FILE = path.join(__dirname, "training-data.csv");

/**
 * The Master Prompt
 * This prompt instructs Gemini to act as a social media expert and generate a
 * single, structured data point, including a ground-truth viral score and justification.
 */
const getMasterPrompt = (keyword: string): string => `
You are a panel of world-class social media strategists and data analysts.
Your task is to generate a single, realistic example of a trending topic related to "${keyword}".

Generate a diverse range of examples: some with high viral potential, some medium, and some low.

For the topic, provide the following attributes in a JSON object:
- "title": A realistic trend title (string).
- "traffic": An estimated search volume string (e.g., "55K searches", "1.2M searches").
- "sources": An array of strings representing where this trend is appearing (e.g., ["google", "twitter", "tiktok", "reddit"]). The number of sources should vary.
- "freshnessHours": A number representing how many hours ago this trend first appeared (e.g., 1.5, 24, 72).
- "groundTruthViralScore": Your expert prediction of the trend's viral score on a scale of 0-100. This is the most important field. Be realistic and critical. A score of 95 should be rare and exceptional. A score of 20 should be common for a weak trend.
- "justification": A brief (1-2 sentence) explanation for why you assigned that score, considering factors like volume, specificity, and audience interest.

Return ONLY the raw JSON object, with no markdown formatting or extra text.
`;

async function generateSingleSample(keyword: string): Promise<any> {
  try {
    const prompt = getMasterPrompt(keyword);
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Failed to generate or parse a sample:", error);
    return null; // Return null on failure to allow the script to continue
  }
}

async function main() {
  console.log(`Starting synthetic data generation for ${SAMPLES_TO_GENERATE} samples...`);
  const keywords = ["AI", "Marketing", "Productivity", "Finance", "Health", "Gaming"];
  const data = [];

  // Write CSV header
  const header = "title,traffic,sources,freshnessHours,groundTruthViralScore,justification\n";
  await fs.writeFile(OUTPUT_FILE, header);

  for (let i = 0; i < SAMPLES_TO_GENERATE; i++) {
    // Rotate keywords to get a diverse dataset
    const keyword = keywords[i % keywords.length];
    const sample = await generateSingleSample(keyword);

    if (sample) {
      // Sanitize data for CSV (e.g., wrap titles with quotes if they contain commas)
      const title = `"${sample.title.replace(/"/g, '""')}"`;
      const traffic = sample.traffic || "0 searches";
      const sources = `"${(sample.sources || []).join(",")}"`;
      const freshness = sample.freshnessHours || 24;
      const score = sample.groundTruthViralScore || 0;
      const justification = `"${(sample.justification || "").replace(/"/g, '""')}"`;

      const csvRow = `${title},${traffic},${sources},${freshness},${score},${justification}\n`;
      await fs.appendFile(OUTPUT_FILE, csvRow);

      data.push(sample);
    }

    // Log progress
    const progress = Math.round(((i + 1) / SAMPLES_TO_GENERATE) * 100);
    process.stdout.write(`Progress: ${progress}% (${i + 1}/${SAMPLES_TO_GENERATE})\r`);

    // Avoid hitting API rate limits
    if ((i + 1) % 60 === 0) {
        console.log(`\nPausing for 60 seconds to respect API rate limits...\n`);
        await new Promise(resolve => setTimeout(resolve, 60000));
    }
  }

  console.log(`\n\n✅ Generation complete!`);
  console.log(`Successfully generated ${data.length} samples.`);
  console.log(`Training data saved to: ${OUTPUT_FILE}`);
}

main().catch(console.error);