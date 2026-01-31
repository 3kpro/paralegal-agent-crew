
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

// Initialize Google AI Client (Server-side only)
// Uses API Key for simplicity and reliability, bypassing Vertex AI complexity
const getClient = (): GoogleGenerativeAI | null => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    console.error("Missing GEMINI_API_KEY");
    return null;
  }

  return new GoogleGenerativeAI(apiKey);
};

export { GenerativeModel };

/**
 * Retrieves a Gemini model instance via Vertex AI.
 *
 * @param modelName The model ID to use (e.g., 'gemini-2.0-flash').
 * @param useJsonMode Enables JSON output mode for reliable, structured data.
 * @returns A GenerativeModel instance or null if the client could not be initialized.
 */
export function getGeminiModel(modelName: string = 'gemini-2.0-flash', useJsonMode: boolean = false): GenerativeModel | null {
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
