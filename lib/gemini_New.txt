
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

let genAIInstance: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI | null {
  // Return existing instance if it's already created
  if (genAIInstance) {
    return genAIInstance;
  }

  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("[Gemini Client] API Key is missing. The application will not be able to connect to the Gemini service.");
    // In a production environment, fail fast to ensure the server doesn't run in a critically broken state.
    if (process.env.NODE_ENV === 'production') {
      throw new Error("CRITICAL: Gemini API Key is not configured on the server.");
    }
    return null;
  }

  console.log("[Gemini Client] Initializing GoogleGenerativeAI client.");
  genAIInstance = new GoogleGenerativeAI(apiKey);
  return genAIInstance;
}

/**
 * Gets a configured Gemini model instance.
 * @param modelName The name of the model to use (e.g., 'gemini-2.0-flash').
 * @param useJsonMode Enables JSON output mode for reliable, structured data.
 * @returns A GenerativeModel instance or null if the client could not be initialized.
 */
export function getGeminiModel(modelName: string = 'gemini-1.5-flash', useJsonMode: boolean = false): GenerativeModel | null {
  const client = getClient();
  if (!client) {
    return null;
  }

  return client.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.4,
      // Use JSON response type for predictable, parsable output
      ...(useJsonMode && { responseMimeType: "application/json" }),
    },
  });
}
