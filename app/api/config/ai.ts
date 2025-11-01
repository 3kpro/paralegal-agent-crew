import { GoogleGenAI } from '@google/genai';

// Debug info
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('GOOGLE_API_KEY present:', !!process.env.GOOGLE_API_KEY);

// AI Models
export const AI_MODEL_TEXT = 'gemini-2.5-flash';
export const AI_MODEL_IMAGE = 'imagen-4.0-generate-001';

// Initialize Gemini - using Google AI endpoints (not Vertex AI) to support API Key authentication
const getAiClient = () => {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY environment variable not set");
  }
  // Removed `vertexai: true` to use Google AI endpoints which support API Key authentication
  return new GoogleGenAI({ 
    apiKey: process.env.GOOGLE_API_KEY
  });
};

export const aiConfig = {
  // Text generation for product descriptions, marketing content, etc.
  generateText: async (prompt: string) => {
    try {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: AI_MODEL_TEXT,
        contents: { 
          role: 'user', 
          parts: [{ text: prompt }] 
        }
      });
      return response.text;
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      throw new Error(error.message || 'Failed to generate text');
    }
  },

  // Generate product campaign images
  generateImage: async (prompt: string, style?: string) => {
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

      const response = await ai.models.generateImages({
        model: AI_MODEL_IMAGE,
        prompt: imagePrompt,
        config: { 
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1'
        }
      });
      
      // Return base64 encoded image
      if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0]?.image?.imageBytes) {
        return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
      } else {
        throw new Error('No images generated');
      }
    } catch (error: any) {
      console.error('Image Generation Error:', error);
      throw new Error(error.message || 'Failed to generate image');
    }
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

      const response = await ai.models.generateContent({
        model: AI_MODEL_TEXT,
        contents: { 
          role: 'user', 
          parts: [{ text: socialPrompt }] 
        }
      });
      return response.text;
    } catch (error: any) {
      console.error('Social Content Generation Error:', error);
      throw new Error(error.message || 'Failed to generate social content');
    }
  },
};