import { NextResponse } from "next/server";

export async function GET() {
  console.log("Test Ping Hit");
  return NextResponse.json({ message: "Pong", timestamp: Date.now() });
}
