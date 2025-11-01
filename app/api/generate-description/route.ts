import { NextResponse } from 'next/server';
import { aiConfig } from '../config/ai';

export async function POST(req: Request) {
  try {
    const {
      name,
      url,
      customDescription,
      presentationStyle = 'professional',
      focusPoints = [],
      highlightPrice = false,
      includeTestimonials = false,
    } = await req.json();

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Product name is required' },
        { status: 400 }
      );
    }

    // Construct the prompt
    const prompt = `Generate a compelling product description for an online campaign.

Product Details:
- Name: ${name}
- URL: ${url}
${customDescription ? `- Custom Description: ${customDescription}` : ''}
- Style: ${presentationStyle}
${focusPoints.length > 0 ? `- Key Focus Points: ${focusPoints.join(', ')}` : ''}
${highlightPrice ? '- Include pricing highlights' : ''}
${includeTestimonials ? '- Include space for testimonials' : ''}

Requirements:
1. Write in a ${presentationStyle} tone
2. Focus on benefits and value proposition
3. Include relevant features and applications
4. Make it engaging and conversion-focused
5. Keep it concise but comprehensive
6. Use persuasive language that resonates with the target audience
7. Highlight unique selling points
8. Include a clear call to action

Format the description to be social media friendly.`;

    // Log API key status (safely)
    console.log('API Key present:', !!process.env.GOOGLE_API_KEY);
    console.log('API Key length:', process.env.GOOGLE_API_KEY?.length);

    // Generate description using Gemini
    const description = await aiConfig.generateText(prompt);

    return NextResponse.json({
      success: true,
      description: description?.trim() || '',
      provider: 'gemini' // We're now using Gemini exclusively
    });

  } catch (error: any) {
    console.error('Error generating product description:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate description',
      },
      { status: 500 }
    );
  }
}