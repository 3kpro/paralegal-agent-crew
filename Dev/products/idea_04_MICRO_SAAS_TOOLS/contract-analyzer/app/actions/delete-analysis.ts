"use server";

import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function deleteAnalysis(id: string) {
    const { userId } = await auth();

    if (!userId) {
        return { success: false, error: "Unauthorized" };
    }

    const supabase = getSupabaseAdmin();

    try {
        const { error } = await supabase
            .from('analyses')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) {
            throw new Error(error.message);
        }

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
