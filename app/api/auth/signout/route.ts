import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Clear all auth-related cookies
  const cookieStore = await cookies();
  cookieStore.getAll().forEach(cookie => {
    if (cookie.name.includes('auth') || cookie.name.includes('supabase')) {
      cookieStore.delete(cookie.name);
    }
  });

  return NextResponse.json({ success: true });
}
