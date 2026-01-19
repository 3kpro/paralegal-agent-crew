import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import fs from 'fs';

// Manually load .env.local because dotenv/config defaults to .env
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envConfig = require('dotenv').parse(fs.readFileSync(envLocalPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

async function testGemini() {
  console.log('--- Gemini API Diagnostic Test (Final Verification) ---');
  
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ ERROR: No API Key found.');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = 'gemini-2.0-flash';

  console.log(`\nTesting model: ${modelName}`);

  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Say "SUCCESS"');
    const response = await result.response;
    const text = response.text();
    
    console.log(`\n✅ SUCCESS: ${modelName} is working!`);
    console.log(`Response: ${text.trim()}`);
    
  } catch (error: any) {
    console.error('\n❌ FAILED');
    console.error(error);
  }
}

testGemini();
