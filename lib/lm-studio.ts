/**
 * LM Studio Integration
 * Connects to local LM Studio instance for free AI content generation
 *
 * Server: IBM P51 @ http://10.10.10.105:1234
 * Models: Mistral 7B, Llama 3.1 8B, Deepseek Coder 6.7B
 */

export interface LMStudioConfig {
  baseUrl: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface LMStudioResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Call LM Studio for content generation
 * Note: Mistral 7B doesn't support "system" role, only "user" and "assistant"
 */
export async function generateWithLMStudio(
  prompt: string,
  config?: Partial<LMStudioConfig>,
): Promise<string> {
  const defaultConfig: LMStudioConfig = {
    baseUrl: process.env.LM_STUDIO_URL || "http://10.10.10.105:1234",
    model: process.env.LM_STUDIO_MODEL || "mistral-7b-instruct-v0.3",
    temperature: 0.7,
    maxTokens: 2000,
  };

  const finalConfig = { ...defaultConfig, ...config };

  try {
    const response = await fetch(`${finalConfig.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: finalConfig.model,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: finalConfig.temperature,
        max_tokens: finalConfig.maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`LM Studio API error: ${response.status} ${error}`);
    }

    const data: LMStudioResponse = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error("No response from LM Studio");
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("LM Studio generation error:", error);
    throw error;
  }
}

/**
 * Check if LM Studio is available
 */
export async function checkLMStudioHealth(
  baseUrl: string = "http://10.10.10.105:1234",
): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl}/v1/models`, {
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    return response.ok;
  } catch (error) {
    console.error("LM Studio health check failed:", error);
    return false;
  }
}

/**
 * Get available models from LM Studio
 */
export async function getLMStudioModels(
  baseUrl: string = "http://10.10.10.105:1234",
): Promise<string[]> {
  try {
    const response = await fetch(`${baseUrl}/v1/models`);
    const data = await response.json();
    return data.data.map((model: any) => model.id);
  } catch (error) {
    console.error("Failed to fetch LM Studio models:", error);
    return [];
  }
}

/**
 * Generate Twitter thread using LM Studio
 */
export async function generateTwitterThread(
  topic: string,
  trendData?: string,
): Promise<string> {
  const context = trendData
    ? `Based on this trending topic: "${trendData}"\n\n`
    : "";

  const prompt = `${context}You are a content marketing expert who writes viral Twitter threads. Create a compelling thread about: ${topic}

CRITICAL RULES:
- Write EXACTLY 5-7 tweets
- Each tweet MUST be under 280 characters (count carefully!)
- Number format: 1/X, 2/X, etc. (where X is total tweets)
- NO generic advice - give SPECIFIC, actionable insights
- NO clichés like "game-changer" or "revolutionize"

STRUCTURE:
Tweet 1: Bold hook or surprising stat (make them STOP scrolling)
Tweet 2-5: Specific insights with examples or data
Tweet 6: Key takeaway or actionable tip
Tweet 7: Strong CTA + 1-2 relevant hashtags

TONE: Direct, confident, helpful. Like a friend who actually knows what they're talking about.

Write each tweet on a new line with blank lines between them.`;

  return await generateWithLMStudio(prompt, { maxTokens: 1500 });
}

/**
 * Generate LinkedIn post using LM Studio
 */
export async function generateLinkedInPost(
  topic: string,
  trendData?: string,
): Promise<string> {
  const context = trendData
    ? `Based on this trending topic: "${trendData}"\n\n`
    : "";

  const prompt = `${context}You are a LinkedIn thought leader who writes posts that get thousands of engagements. Create a compelling post about: ${topic}

CRITICAL RULES:
- First sentence MUST hook readers immediately (question, bold statement, or surprising fact)
- NO corporate jargon or buzzwords
- Use personal stories or specific examples
- Break into short, scannable paragraphs (2-3 sentences max)
- Include numbers, stats, or concrete data when possible
- 1200-1500 characters total

STRUCTURE:
Line 1: Attention-grabbing hook
Line 2-3: The problem or opportunity (be specific)
Middle: 3 key insights with examples (use bullet points or line breaks for clarity)
End: Thought-provoking question or clear CTA
Hashtags: 3-5 relevant hashtags

TONE: Professional but human. Share insights like you're having coffee with a colleague, not presenting to a boardroom.

Format: Write as a complete LinkedIn post ready to copy-paste.`;

  return await generateWithLMStudio(prompt, { maxTokens: 1000 });
}

/**
 * Generate email newsletter using LM Studio
 */
export async function generateEmailNewsletter(
  topic: string,
  trendData?: string,
): Promise<{ subject: string; preview: string; body: string }> {
  const context = trendData
    ? `Based on this trending topic: "${trendData}"\n\n`
    : "";

  const prompt = `${context}You are an email marketing expert who writes emails that get 40%+ open rates. Create a newsletter about: ${topic}

CRITICAL RULES:
- Subject line: Create curiosity or urgency (max 50 characters)
- Preview text: Continue the intrigue from subject (max 100 characters)
- NO generic openings like "Hope this email finds you well"
- Use "you" language (not "we" or "I")
- Include specific numbers or data points
- Short paragraphs (2-3 sentences max)

STRUCTURE:
Subject: Curiosity-driven or benefit-focused (e.g., "The 1 thing 90% of creators miss" or "Your content strategy is backwards")
Preview: Extend the hook or tease the solution
Body:
- Line 1-2: Hook that validates their problem or sparks curiosity
- 3-4 specific, actionable insights (use bullets or line breaks)
- Quick win they can implement today
- Clear CTA (what to do next)

TONE: Helpful friend who's sharing insider knowledge. Direct, specific, no fluff.

Format your response EXACTLY as:
SUBJECT: [subject line]
PREVIEW: [preview text]
BODY: [email body]`;

  const response = await generateWithLMStudio(prompt, { maxTokens: 1200 });

  // Parse response
  const subjectMatch = response.match(/SUBJECT:\s*(.+)/i);
  const previewMatch = response.match(/PREVIEW:\s*(.+)/i);
  const bodyMatch = response.match(/BODY:\s*([\s\S]+)/i);

  return {
    subject: subjectMatch?.[1]?.trim() || "Untitled Newsletter",
    preview: previewMatch?.[1]?.trim() || "",
    body: bodyMatch?.[1]?.trim() || response,
  };
}
