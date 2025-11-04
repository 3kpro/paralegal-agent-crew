import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  try {
    console.log('Testing Gemini API connection...');
    console.log('API Key present:', !!process.env.GOOGLE_API_KEY);
    console.log('API Key prefix:', process.env.GOOGLE_API_KEY?.substring(0, 4));
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
    
    try {
      // Test with a simple prompt - use gemini-1.5-flash like in production
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = 'Say "Hello, this is a test!"';
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return NextResponse.json({
        success: true,
        message: 'Gemini API test successful',
        testResponse: text
      });
    } catch (modelError: any) {
      console.error('Model operation failed:', modelError);
      return NextResponse.json({
        success: false,
        error: 'Model operation failed',
        details: modelError.message,
        stack: modelError.stack
      }, { status: 500 });
    }
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