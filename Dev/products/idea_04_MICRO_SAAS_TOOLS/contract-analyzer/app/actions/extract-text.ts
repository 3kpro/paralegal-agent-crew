"use server";

import { parseDocument } from "@/lib/document-parser";

export type AnalysisResult = {
  success: boolean;
  text?: string;
  error?: string;
};

export async function extractContractText(formData: FormData): Promise<AnalysisResult> {
  const file = formData.get("file") as File;

  if (!file) {
    return { success: false, error: "No file provided" };
  }

  try {
    const { text } = await parseDocument(file);
    
    // Basic validation to ensure it looks like a contract ( MVP check )
    if (text.length < 50) {
        return { success: false, error: "Document appears to be empty or too short." };
    }

    return { success: true, text };
  } catch (error: any) {
    console.error("Extraction error:", error);
    return { success: false, error: error.message || "Failed to extract text from document." };
  }
}
