import { NextResponse } from 'next/server';
import { getGeminiModel } from '@/lib/gemini';

export async function GET() {
  try {
    console.log('Testing Gemini API connection...');
    console.log('API Key present:', !!process.env.GOOGLE_API_KEY);
    console.log('API Key prefix:', process.env.GOOGLE_API_KEY?.substring(0, 4));
    
    // Test with the centralized helper to verify Vertex AI connectivity
    const modelName = 'gemini-2.0-flash';
    const model = getGeminiModel(modelName);
    
    if (!model) {
      throw new Error(`Failed to initialize ${modelName} via Vertex AI`);
    }

    const prompt = 'Say "Hello, this is a test of Vertex AI!"';
    
    console.log(`Sending prompt to ${modelName} via Vertex AI...`);
    const result = await model.generateContent(prompt);
    
    // Vertex AI response parsing
    const candidates = result.response.candidates;
    const text = candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error("No text content in Vertex AI response");
    }
    
    return NextResponse.json({
      success: true,
      message: 'Vertex AI (Gemini) API test successful',
      testResponse: text,
      model: modelName
    });

  } catch (error: any) {
    console.error('API test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'API test failed',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}