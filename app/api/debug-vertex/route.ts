
import { NextResponse } from 'next/server';
import { getGeminiModel } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // DIRECT MODEL LISTING DIAGNOSIS
    // Since we are getting 404s for specific models, let's ask the API what IS available.
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error("API Key not found in env vars");

    const listModelsUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    let availableModels = [];
    let listError = null;

    try {
      const listRes = await fetch(listModelsUrl);
      const listData = await listRes.json();
      
      if (!listRes.ok) {
        listError = listData;
      } else {
        availableModels = listData.models || [];
      }
    } catch (err: any) {
      listError = err.message;
    }

    // Try one known robust model just in case, but rely on listing for debug
    const fallbackModel = 'gemini-2.0-flash';
    let generationResult = null;
    try {
        const model = getGeminiModel(fallbackModel);
        if (model) {
            const res = await model.generateContent("Ping.");
            generationResult = (await res.response).text();
        }
    } catch (e: any) {
        generationResult = `Failed: ${e.message}`;
    }

    return NextResponse.json({
      status: 'diagnosis',
      version: "v5-list-models", // VERSION STAMP
      env_check: { has_api_key: !!apiKey },
      api_deployment: "Google AI Studio (API Key)",
      available_models_count: availableModels.length,
      available_models: availableModels.map((m: any) => m.name).slice(0, 10), // Show top 10
      list_models_error: listError,
      manual_generation_attempt: {
          model: fallbackModel,
          result: generationResult
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      version: "v5-list-models", // VERSION STAMP
      stack: error.stack,
      env_check: {
          has_api_key: !!process.env.GEMINI_API_KEY
      }
    }, { status: 500 });
  }
}
