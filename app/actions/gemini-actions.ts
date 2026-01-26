'use server';

import { getGeminiModel } from '@/lib/gemini';
import { calculateLocalViralScore } from '@/lib/viral-score-heuristic';

import { fetchDriveFileContent } from '@/lib/google-drive';
import { PromoteData } from '@/app/(portal)/campaigns/create/types';

export interface ViralVariation {
  type: 'provocative' | 'data' | 'story' | 'educational' | 'sales';
  title: string;
  content: string;
  score: number;
}

export async function generateSuperchargeVariations(baseContent: string, topic?: string): Promise<ViralVariation[]> {
  const model = getGeminiModel('gemini-2.0-flash', true);
  if (!model) {
      console.warn("Gemini client not available, returning empty variations");
      return []; 
  }

  const prompt = `
    You are a viral social media expert.
    Task: Generate 3 distinct variations of the following post content to maximize viral potential on LinkedIn/Twitter.
    
    Context/Topic: ${topic || 'General Business'}
    Original Content: "${baseContent}"

    Variations required:
    1. Provocative (Controversial, polarising, strong opinion)
    2. Data-Backed (Uses statistics, "78% of...", research findings)
    3. Storyteller (Personal narrative, "I lost everything...", hero's journey)

    Return a JSON object with a "variations" array. Each variation must have:
    - "type": "provocative" | "data" | "story"
    - "title": Short descriptive title (e.g. "The Provocative Hook")
    - "content": The full post text. Use viral formatting (line breaks, hooks).
    - "score": Predicted viral score (0-100) based on quality. High outliers allowed.

    JSON Schema:
    {
      "variations": [
        { "type": "provocative", "title": "...", "content": "...", "score": 95 }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedText = responseText.replace(/```json\n|\n```/g, '').replace(/```/g, '');
    const data = JSON.parse(cleanedText);
    return data.variations || [];
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return [];
  }
}

export async function calculateRealViralScore(content: string): Promise<number> {
    const model = getGeminiModel('gemini-2.0-flash', true);
    if (!model) {
        return calculateLocalViralScore(content);
    }

    const prompt = `
        Analyze the viral potential of this social media post text.
        
        Post: "${content}"

        Rate it from 0-100 based on:
        1. Hook strength (Does it stop the scroll?)
        2. Value density (Is it actionable?)
        3. Formatting (Is it scannable?)
        4. Emotional resonance

        Return JSON: { "score": number, "reasoning": string }
    `;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleanedText = responseText.replace(/```json\n|\n```/g, '').replace(/```/g, '');
        const data = JSON.parse(cleanedText);
        return data.score || 0;
    } catch (error) {
        console.error("Gemini Scoring Error:", error);
        return calculateLocalViralScore(content);
    }
}

export async function generatePromoteCampaign(data: PromoteData): Promise<ViralVariation[]> {
  const model = getGeminiModel('gemini-2.0-flash', true);
  if (!model) {
      console.warn("Gemini client not available");
      return []; 
  }

  const promptText = `
    You are a world-class direct response copywriter.
    Task: Create a high-converting social media campaign for the following product/offer.
    
    PRODUCT DETAILS:
    - Name: ${data.productName} (${data.productType})
    - Description: ${data.description}
    - Target Audience: ${data.targetAudience}
    - Campaign Angle: ${data.contentFocus}
    - Key Features: ${data.keyFeatures.join(', ')}
    - USPs: ${data.uniqueSellingPoints.join(', ')}
    ${data.websiteUrl ? `- Landing Page: ${data.websiteUrl}` : ''}
    
    INSTRUCTIONS:
    1. Analyze the provided context files (if any) to match the brand voice and extract specific details.
    2. Generate 3 distinct high-viral-potential variations.
    
    VARIATIONS REQUIRED:
    1. The Hook (Provocative/Curiosity gap)
    2. The Value/Education (Data-backed or "How-to")
    3. The Story/Sales (Social proof or problem/solution)
    
    Return a JSON object with a "variations" array. Each variation must have:
    - "type": "provocative" | "data" | "story"
    - "title": Short descriptive title
    - "content": The full post text. Use viral formatting. Include 3-5 relevant hashtags.
    - "score": Predicted viral score (0-100)
    
    JSON Schema:
    { "variations": [ { "type": "provocative", "title": "...", "content": "...", "score": 95 } ] }
  `;

  const parts: any[] = [promptText];

  // Fetch and attach Drive files if available
  if (data.driveFiles && data.driveFiles.length > 0 && data.accessToken) {
    console.log(`Fetching ${data.driveFiles.length} files from Drive...`);
    for (const file of data.driveFiles) {
       console.log(`Fetching file: ${file.name} (${file.mimeType})`);
       const result = await fetchDriveFileContent(file.id, data.accessToken, file.mimeType);
       
       if (result.success && result.data) {
           parts.push({
               inlineData: {
                   mimeType: result.mimeType,
                   data: result.data.toString('base64')
               }
           });
       } else {
           console.warn(`Failed to fetch Drive file ${file.id}: ${result.error}`);
           parts[0] += `\n[System Note: Failed to retrieve file context for: ${file.name}]`;
       }
    }
  } else if (data.driveFiles && data.driveFiles.length > 0 && !data.accessToken) {
      console.warn("Drive files present but no access token provided.");
      parts[0] += `\n[System Warning: User selected Drive files but access token was missing. Generate based on provided text only.]`;
  }

  try {
    const result = await model.generateContent(parts);
    const responseText = result.response.text();
    const cleanedText = responseText.replace(/```json\n|\n```/g, '').replace(/```/g, '');
    const json = JSON.parse(cleanedText);
    return json.variations || [];
  } catch (error) {
    console.error("Gemini Promote Generation Error:", error);
    return [];
  }
}

