"use server";

import { getSupabaseAdmin } from "@/lib/supabase";

export async function getTemplates() {
    const supabase = getSupabaseAdmin();

    try {
        const { data, error } = await supabase
            .from('templates')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching templates:", error);
            throw new Error("Failed to fetch templates");
        }

        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
