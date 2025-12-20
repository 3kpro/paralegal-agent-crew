import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Facebook/Instagram Data Deletion Callback (Root Level)
 * Alternative endpoint at /data-deletion for Facebook compliance
 * Some platforms prefer root-level paths over /api/ paths
 */

function parseSignedRequest(signedRequest: string, appSecret: string) {
  const [encodedSig, payload] = signedRequest.split(".");

  const jsonPayload = Buffer.from(payload, "base64").toString("utf8");
  const data = JSON.parse(jsonPayload);

  const expectedSig = crypto
    .createHmac("sha256", appSecret)
    .update(payload)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const actualSig = encodedSig.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

  if (expectedSig !== actualSig) {
    throw new Error("Invalid signature");
  }

  return data;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData();
    const signedRequest = body.get("signed_request") as string;

    if (!signedRequest) {
      return NextResponse.json(
        { error: "Missing signed_request parameter" },
        { status: 400 }
      );
    }

    const appSecret = process.env.FACEBOOK_APP_SECRET;
    if (!appSecret) {
      console.error("FACEBOOK_APP_SECRET not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const data = parseSignedRequest(signedRequest, appSecret);
    const userId = data.user_id;

    console.log(`Data deletion request received for user: ${userId}`);

    const confirmationCode = crypto.randomBytes(16).toString("hex");
    const statusUrl = `${process.env.NEXT_PUBLIC_APP_URL}/data-deletion-status/${confirmationCode}`;

    return NextResponse.json({
      url: statusUrl,
      confirmation_code: confirmationCode,
    });
  } catch (error) {
    console.error("Data deletion callback error:", error);
    return NextResponse.json(
      { error: "Failed to process data deletion request" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: "Facebook/Instagram Data Deletion Callback",
      status: "active",
      endpoint: "https://xelora.app/data-deletion",
    },
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    }
  );
}
