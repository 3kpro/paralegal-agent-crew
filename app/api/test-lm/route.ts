import { NextRequest, NextResponse } from "next/server";

// nosemgrep: Local development file for LM Studio testing - HTTP is expected for local development
const LM_STUDIO_URL = "http://10.10.10.105:1234";

export async function GET() {
  try {
    const response = await fetch(`${LM_STUDIO_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemma-3-4b",
        messages: [
          {
            role: "user",
            content: "Say hello in 5 words or less",
          },
        ],
        max_tokens: 20,
        temperature: 0.1,
      }),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        status: "error",
        message: `LM Studio API error: ${response.status}`,
        error: errorText,
      });
    }

    const data = await response.json();
    return NextResponse.json({
      status: "success",
      message: "LM Studio connected successfully",
      response: data.choices[0]?.message?.content || "No response",
      full_response: data,
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: "Failed to connect to LM Studio",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
