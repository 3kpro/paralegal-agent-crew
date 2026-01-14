"use server";

import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function getAnalysisHistory() {
    const { userId } = await auth();

    if (!userId) {
        return { success: false, error: "Unauthorized" };
    }

    const supabase = getSupabaseAdmin();

    try {
        const { data, error } = await supabase
            .from('analyses')
            .select('*, users(subscription_status)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching history:", error);
            throw new Error("Failed to fetch analysis history");
        }

        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
