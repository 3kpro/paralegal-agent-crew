"use server";

import { geminiModel } from '@/lib/gemini';
import { ANALYSIS_SYSTEM_PROMPT } from '@/lib/prompts';
import { z } from 'zod';

// Zod schema for validation (mirroring the Prompt JSON structure)
const RiskSchema = z.object({
  category: z.enum(["Payment Terms", "Liability", "IP", "Termination", "Non-Compete", "Scope", "Other"]),
  severity: z.enum(["Critical", "Medium", "Low"]),
  clause: z.string(),
  issue: z.string(),
  suggestion: z.string(),
});

const AnalysisResponseSchema = z.object({
  risks: z.array(RiskSchema),
  summary: z.string(),
});

export type AnalysisResponse = z.infer<typeof AnalysisResponseSchema>;
export type AnalysisActionState = {
    success: boolean;
    data?: AnalysisResponse;
    error?: string;
};

export async function analyzeContractText(contractText: string): Promise<AnalysisActionState> {
  if (!contractText || contractText.length < 50) {
    return { success: false, error: "Contract text is too short to analyze." };
  }

  try {
    const prompt = `${ANALYSIS_SYSTEM_PROMPT}\n\nAnalyze the following contract text:\n\n${contractText}`;
    
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Attempt to parse JSON from the response
    const rawData = JSON.parse(text);
    
    // Validate with Zod
    const validatedData = AnalysisResponseSchema.parse(rawData);

    return {
        success: true,
        data: validatedData
    };

  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    
    let errorMessage = "Failed to analyze contract.";
    if (error instanceof z.ZodError) {
        errorMessage = "AI output validation failed. The response format was incorrect.";
    } else if (error.message?.includes("GEMINI_API_KEY")) {
        errorMessage = "API Configuration Error. Please check GEMINI_API_KEY.";
    }
    
    return { success: false, error: errorMessage };
  }
}
