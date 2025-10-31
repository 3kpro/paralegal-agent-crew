import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    env: {
      hasGoogleKey: !!process.env.GOOGLE_API_KEY,
      googleKeyLength: process.env.GOOGLE_API_KEY?.length || 0,
      hasEncryptionKey: !!process.env.ENCRYPTION_KEY,
      encryptionKeyLength: process.env.ENCRYPTION_KEY?.length || 0,
      encryptionKeyValid: process.env.ENCRYPTION_KEY?.length === 64,
    },
    deployment: {
      vercelEnv: process.env.VERCEL_ENV,
      vercelUrl: process.env.VERCEL_URL,
    },
  });
}
