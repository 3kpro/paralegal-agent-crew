import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/contentflow/templates - List user's content templates
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const platform = searchParams.get("platform");
    const limit = parseInt(searchParams.get("limit") || "50");

    let query = supabase
      .from("content_templates")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq("category", category);
    }

    if (platform) {
      query = query.contains("platforms", [platform]);
    }

    const { data: templates, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch templates" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      templates: templates || [],
      count: templates?.length || 0,
    });
  } catch (error: any) {
    console.error("Templates API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/contentflow/templates - Create new content template
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const {
      name,
      content,
      category = "general",
      platforms = [],
      variables = [],
      description = "",
    } = body;

    // Validation
    if (!name || !content) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, content" },
        { status: 400 },
      );
    }

    // Validate platforms if provided
    const validPlatforms = [
      "twitter",
      "linkedin",
      "facebook",
      "instagram",
      "tiktok",
      "reddit",
      "youtube",
    ];
    if (platforms.length > 0) {
      const invalidPlatforms = platforms.filter(
        (p: string) => !validPlatforms.includes(p),
      );
      if (invalidPlatforms.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid platforms: ${invalidPlatforms.join(", ")}`,
          },
          { status: 400 },
        );
      }
    }

    // Insert template
    const { data: template, error } = await supabase
      .from("content_templates")
      .insert({
        user_id: user.id,
        name,
        content,
        category,
        platforms: platforms.length > 0 ? platforms : ["twitter", "linkedin"],
        variables,
        description,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create template" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Template created successfully",
      template,
    });
  } catch (error: any) {
    console.error("Create template API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
