
import { NextResponse } from 'next/server';
import { getGeminiModel } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const serviceAccountVar = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    const model = getGeminiModel('gemini-1.5-flash');

    if (!model) {
       return NextResponse.json({ 
        status: 'error', 
        message: 'Failed to initialize Vertex AI client',
        env_check: {
            has_service_account_json: !!serviceAccountVar,
            json_length: serviceAccountVar ? serviceAccountVar.length : 0
        }
       }, { status: 500 });
    }

    // Try a simple generation
    const result = await model.generateContent("Say 'Vertex AI is working' if you can read this.");
    const response = await result.response;
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

    return NextResponse.json({
      status: 'success',
      model_response: text,
      env_check: {
          has_service_account_json: !!serviceAccountVar,
          note: "If success, project ID matched credentials."
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      stack: error.stack,
      env_check: {
          has_service_account_json: !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON
      }
    }, { status: 500 });
  }
}
