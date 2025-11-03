import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, RateLimitPresets } from "@/lib/rate-limit";

// Profile update validation schema
const profileUpdateSchema = z
  .object({
    full_name: z.string().min(1).max(100).optional(),
    bio: z.string().max(500, "Bio must be 500 characters or less").optional(),
    website: z.string().url("Invalid website URL").optional().or(z.literal("")),
    linkedin_url: z
      .string()
      .url("Invalid LinkedIn URL")
      .optional()
      .or(z.literal("")),
    facebook_url: z
      .string()
      .url("Invalid Facebook URL")
      .optional()
      .or(z.literal("")),
    twitter_handle: z.string().max(15).optional(),
  })
  .strict(); // Reject unknown fields

export async function GET(request: Request) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(request, RateLimitPresets.STANDARD);
    if (rateLimitResult) return rateLimitResult;

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(request, RateLimitPresets.STANDARD);
    if (rateLimitResult) return rateLimitResult;

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validation = profileUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid profile data",
          details: validation.error.issues.map(
            (e) => `${e.path.join(".")}: ${e.message}`,
          ),
        },
        { status: 400 },
      );
    }

    const updates = validation.data;

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile: data,
    });
  } catch (error: any) {
    console.error("Profile PUT error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper function to validate URLs (DEPRECATED - using Zod now)
function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    // Check if it's a relative URL (starts with /)
    if (url.startsWith("/")) return true;
    // Check if it's a domain without protocol
    if (url.match(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}/))
      return true;
    return false;
  }
}
