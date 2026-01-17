import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { issueType, subject, message, email } = body;

    // Validate required fields
    if (!issueType || !subject || !message || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user info if logged in
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Format issue type for display
    const issueLabels: Record<string, string> = {
      bug: "Bug Report",
      question: "Question",
      feature: "Feature Request",
      billing: "Billing",
      account: "Account",
      other: "Other",
    };
    const issueLabel = issueLabels[issueType] || issueType;

    // Send to Web3Forms
    const web3Response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        access_key: "3ac337df-1baf-4b0b-a320-638e3e1917b2",
        subject: `[XELORA] [${issueLabel}] ${subject}`,
        from_name: "XELORA Support Form",
        replyto: email,
        message: `
═══════════════════════════════════════════════════
  XELORA SUPPORT REQUEST
═══════════════════════════════════════════════════

TYPE:     ${issueLabel}
FROM:     ${email}
SUBJECT:  ${subject}

───────────────────────────────────────────────────
  USER DETAILS
───────────────────────────────────────────────────
User ID:    ${user?.id || "Guest (not logged in)"}
Account:    ${user?.email || "N/A"}

───────────────────────────────────────────────────
  MESSAGE
───────────────────────────────────────────────────

${message}

═══════════════════════════════════════════════════
Sent via XELORA Support Form
https://getxelora.com/support
        `.trim(),
      }),
    });

    const result = await web3Response.json();
    console.log("Web3Forms response:", result);

    if (!result.success) {
      console.error("Web3Forms error:", result);
      return NextResponse.json(
        { error: result.message || "Failed to send message", details: result },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Support form error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send support request" },
      { status: 500 }
    );
  }
}
