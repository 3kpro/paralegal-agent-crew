import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = 'AIzaSyBwFeOnxvd41Gj1fQAKr5ai7SasRZaP07Q';

console.log('Testing Gemini API key...');
console.log('API Key:', apiKey.substring(0, 20) + '...');

const genAI = new GoogleGenerativeAI(apiKey);

// Try gemini-pro first
try {
  console.log('\n1. Testing gemini-pro...');
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const result = await model.generateContent('Say "test successful"');
  const response = await result.response;
  const text = response.text();
  console.log('✅ gemini-pro WORKS:', text);
} catch (error) {
  console.log('❌ gemini-pro FAILED:', error.message);
}

// Try gemini-1.5-flash
try {
  console.log('\n2. Testing gemini-1.5-flash...');
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent('Say "test successful"');
  const response = await result.response;
  const text = response.text();
  console.log('✅ gemini-1.5-flash WORKS:', text);
} catch (error) {
  console.log('❌ gemini-1.5-flash FAILED:', error.message);
}

// Try gemini-1.5-pro
try {
  console.log('\n3. Testing gemini-1.5-pro...');
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  const result = await model.generateContent('Say "test successful"');
  const response = await result.response;
  const text = response.text();
  console.log('✅ gemini-1.5-pro WORKS:', text);
} catch (error) {
  console.log('❌ gemini-1.5-pro FAILED:', error.message);
}

console.log('\nTest complete!');
