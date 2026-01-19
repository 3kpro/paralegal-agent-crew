
import { VertexAI, GenerativeModel } from '@google-cloud/vertexai';

// Initialize Vertex AI Client
// This automatically uses Application Default Credentials (ADC) locally
// and Service Account credentials in production
const getClient = (): VertexAI | null => {
  try {
    const project = 'kpro-gemini';
    const location = 'us-central1';
    
    // In Vercel/Production, we need to pass credentials explicitly via env var
    // because there is no file-system access to ADC.
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    
    if (serviceAccountJson) {
      try {
        const credentials = JSON.parse(serviceAccountJson);
        const resolvedProject = credentials.project_id || project;
        
        return new VertexAI({
          project: resolvedProject,
          location,
          googleAuthOptions: {
            credentials
          }
        });
      } catch (parseError) {
        console.error("Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON", parseError);
        // Fallback to ADC if parsing fails (unlikely in prod if var exists)
      }
    }

    // Default to ADC (works locally with gcloud auth)
    return new VertexAI({
      project,
      location
    });
  } catch (error) {
    console.error("Error initializing Vertex AI client:", error);
    return null;
  }
};

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
