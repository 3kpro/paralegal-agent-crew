import { VertexAI } from '@google-cloud/vertexai';

// Debug info
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('GOOGLE_API_KEY present:', !!process.env.GOOGLE_API_KEY);

// AI Models
export const AI_MODEL_TEXT = 'gemini-2.0-flash';
export const AI_MODEL_IMAGE = 'imagen-4.0-generate-001';

// Initialize Gemini - using Vertex AI to support enterprise credits
const getAiClient = () => {
  // Vertex AI uses ADC (Application Default Credentials), so explicit API key isn't strictly needed 
  // if gcloud auth is done or GOOGLE_APPLICATION_CREDENTIALS is set.
  // However, we verify we're in a valid environment.
  
  console.log(`[Vertex Config] Initializing Vertex AI for project: kpro-gemini`);

  return new VertexAI({
    project: 'kpro-gemini',
    location: 'us-central1'
  });
};

export const aiConfig = {
  // Text generation for product descriptions, marketing content, etc.
  generateText: async (prompt: string) => {
    try {
      const ai = getAiClient();
      const model = ai.getGenerativeModel({ model: AI_MODEL_TEXT });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      const candidates = result.response.candidates;
      const text = candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error('No text generated');
      }
      
      return text;
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      throw new Error(error.message || 'Failed to generate text');
    }
  },

  // Generate product campaign images
  generateImage: async (prompt: string, style?: string) => {
    // TODO: Implement proper Image Generation client (e.g. via separate API or Vertex SDK)
    // The GoogleGenerativeAI SDK (Gemini) does not currently support `generateImages` in this way.
    console.warn("generateImage not fully implemented for this SDK version");
    throw new Error("Image generation not supported in current configuration");
    /* 
    try {
      const ai = getAiClient();
      const imagePrompt = `Create a marketing image for: ${prompt}
Style: ${style || 'Modern and professional'}
Requirements:
- High quality, visually appealing composition
- Suitable for social media and marketing materials
- Clean, professional aesthetic
- Brand-appropriate imagery
- No text overlay (will be added separately)
- Optimized for digital display`;

      // Placeholder for actual implementation
      // const response = await ai.models.generateImages({...}) 
      
      throw new Error('No images generated');
    } catch (error: any) {
      console.error('Image Generation Error:', error);
      throw new Error(error.message || 'Failed to generate image');
    }
    */
  },

  // Generate social media variations
  generateSocialContent: async (prompt: string, platform: string) => {
    try {
      const ai = getAiClient();
      const socialPrompt = `Create a ${platform}-optimized post for: ${prompt}
Requirements:
- Match ${platform}'s best practices and format
- Include relevant hashtags if appropriate
- Engaging and shareable content
- Clear call-to-action
- Professional tone
- Optimized for ${platform}'s character limits and format`;

      const model = ai.getGenerativeModel({ model: AI_MODEL_TEXT });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: socialPrompt }] }]
      });
      const candidates = result.response.candidates;
      const text = candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error('No text generated');
      }
      
      return text;
    } catch (error: any) {
      console.error('Social Content Generation Error:', error);
      throw new Error(error.message || 'Failed to generate social content');
    }
  },
};