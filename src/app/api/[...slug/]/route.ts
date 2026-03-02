import { NextResponse } from "next/server";

/**
 * Catch-all API route to handle undefined /api/* paths.
 * Ensures API consumers always receive a consistent JSON 404 error.
 */
export async function GET() {
  return createNotFoundResponse();
}

export async function POST() {
  return createNotFoundResponse();
}

export async function PUT() {
  return createNotFoundResponse();
}

export async function PATCH() {
  return createNotFoundResponse();
}

export async function DELETE() {
  return createNotFoundResponse();
}

function createNotFoundResponse() {
  return NextResponse.json(
    {
      error: "API endpoint not found",
      code: "NOT_FOUND",
    },
    { status: 404 },
  );
}
