import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = 'AIzaSyBwFeOnxvd41Gj1fQAKr5ai7SasRZaP07Q';

console.log('Testing different model names...\n');

const genAI = new GoogleGenerativeAI(apiKey);

const modelsToTest = [
  'gemini-pro',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'models/gemini-pro',
  'models/gemini-1.5-flash',
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
