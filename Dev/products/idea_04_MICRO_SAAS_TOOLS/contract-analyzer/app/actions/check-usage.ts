"use server";

import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function checkUserUsage() {
    const { userId } = await auth();

    if (!userId) {
        return { success: false, error: "Unauthorized" };
    }

    const supabase = getSupabaseAdmin();

    try {
        // Get user data
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('subscription_status')
            .eq('user_id', userId)
            .single();

        if (userError && userError.code !== 'PGRST116') { // PGRST116 is "not found"
            throw new Error(userError.message);
        }

        // If user is pro, unlimited
        if (user?.subscription_status === 'pro_monthly' || user?.subscription_status === 'pro_lifetime') {
            return { success: true, canAnalyze: true, status: user.subscription_status };
        }

        // Otherwise, count analyses
        const { count, error: countError } = await supabase
            .from('analyses')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (countError) throw new Error(countError.message);

        const freeLimit = 1;
        const currentCount = count || 0;

        return { 
            success: true, 
            canAnalyze: currentCount < freeLimit, 
            count: currentCount, 
            limit: freeLimit,
            status: user?.subscription_status || 'free'
        };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
