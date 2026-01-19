import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.error('❌ Error: No API key found!');
  console.error('Set GOOGLE_GENERATIVE_AI_API_KEY or GOOGLE_API_KEY environment variable');
  process.exit(1);
}

console.log('Testing different model names...\n');

const genAI = new GoogleGenerativeAI(apiKey);

const modelsToTest = [
  'gemini-2.0-flash',
  'gemini-pro',
  'models/gemini-2.0-flash',
  'models/gemini-1.5-pro',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro-latest'
];

for (const modelName of modelsToTest) {
  try {
    console.log('Testing:', modelName);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Hi');
    const response = await result.response;
    console.log('✅ SUCCESS:', modelName, '\n');
    break; // Stop at first success
  } catch (error) {
    console.log('❌ Failed:', error.message.substring(0, 100) + '...\n');
  }
}
