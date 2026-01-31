import { getGeminiModel } from '@/lib/gemini';

// Debug info
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('API Key present:', !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY));

// AI Models
export const AI_MODEL_TEXT = 'gemini-2.0-flash';
export const AI_MODEL_IMAGE = 'imagen-4.0-generate-001';

export const aiConfig = {
  // Text generation for product descriptions, marketing content, etc.
  generateText: async (prompt: string) => {
    try {
      // Use JSON mode = false for general text generation
      const model = getGeminiModel(AI_MODEL_TEXT, false);
      
      if (!model) {
        throw new Error('Failed to initialize Gemini model (check API configuration)');
      }

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      
      const candidates = result.response.candidates;
      const text = candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error('No text generated from Gemini');
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
  },

  // Generate social media variations
  generateSocialContent: async (prompt: string, platform: string) => {
    try {
      const socialPrompt = `Create a ${platform}-optimized post for: ${prompt}
Requirements:
- Match ${platform}'s best practices and format
- Include relevant hashtags if appropriate
- Engaging and shareable content
- Clear call-to-action
- Professional tone
- Optimized for ${platform}'s character limits and format`;

      const model = getGeminiModel(AI_MODEL_TEXT, false);

      if (!model) {
         throw new Error('Failed to initialize Gemini model');
      }

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