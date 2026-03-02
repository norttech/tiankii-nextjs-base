import { NextResponse } from "next/server";

/**
 * Public health-check endpoint.
 * Returns a simple pong response with timestamp.
 */
export async function GET() {
  return NextResponse.json({
    message: "pong",
    timestamp: new Date().toISOString(),
    status: "healthy",
  });
}
