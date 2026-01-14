"use server";

import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function getUserStatus() {
    const { userId } = await auth();

    if (!userId) {
        return "free";
    }

    const supabase = getSupabaseAdmin();

    try {
        const { data, error } = await supabase
            .from('users')
            .select('subscription_status')
            .eq('user_id', userId)
            .single();

        if (error || !data) {
            return "free";
        }

        return data.subscription_status;
    } catch (error) {
        return "free";
    }
}
