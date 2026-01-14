"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { AnalysisResponse } from "./analyze-contract";

export async function saveAnalysis(data: {
    fileName: string;
    fileType: string;
    analysisResults: AnalysisResponse;
}) {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
        return { success: false, error: "Unauthorized" };
    }

    const supabase = getSupabaseAdmin();

    try {
        // 1. Ensure user exists in our database
        // We use an upsert to keep it simple
        const { error: userError } = await supabase
            .from('users')
            .upsert({
                user_id: userId,
                email: user.emailAddresses[0]?.emailAddress,
                full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });

        if (userError) {
            console.error("Error syncing user:", userError);
            throw new Error("Failed to sync user profile");
        }

        // 2. Calculate a simple risk score (MVP logic)
        // High = 30, Medium = 10, Low = 5
        const risks = data.analysisResults.risks;
        let score = 100;
        risks.forEach(r => {
            if (r.severity === 'Critical') score -= 30;
            if (r.severity === 'Medium') score -= 10;
            if (r.severity === 'Low') score -= 5;
        });
        const finalScore = Math.max(0, score);

        // 3. Save the analysis
        const { data: analysis, error: analysisError } = await supabase
            .from('analyses')
            .insert({
                user_id: userId,
                file_name: data.fileName,
                file_type: data.fileType,
                risk_score: finalScore,
                risks_detected: risks,
                summary: data.analysisResults.summary,
            })
            .select()
            .single();

        if (analysisError) {
            console.error("Error saving analysis:", analysisError);
            throw new Error("Failed to save analysis to history");
        }

        return { success: true, data: analysis };

    } catch (error: any) {
        console.error("Save analysis failed:", error);
        return { success: false, error: error.message };
    }
}
