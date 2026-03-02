import { NextResponse } from "next/server";
import { ZodError } from "zod";

export interface ApiErrorResponse {
  error: string;
  details?: Record<string, unknown>;
  code?: string;
}

export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  console.error("[API Error]:", error);

  // 1. Zod Validation Errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: error.flatten().fieldErrors,
        code: "VALIDATION_ERROR",
      },
      { status: 400 },
    );
  }

  // 2. Custom App Errors (can be expanded later for Prisma, etc.)
  if (error instanceof Error) {
    // Handle specific error messages or types here
    if (error.message.includes("not found")) {
      return NextResponse.json({ error: error.message, code: "NOT_FOUND" }, { status: 404 });
    }

    if (error.message.includes("Forbidden") || error.message.includes("permission")) {
      return NextResponse.json({ error: error.message, code: "FORBIDDEN" }, { status: 403 });
    }

    // Default Error Object
    return NextResponse.json({ error: error.message, code: "INTERNAL_ERROR" }, { status: 500 });
  }

  // 3. Fallback for unknown errors
  return NextResponse.json(
    { error: "An unexpected error occurred", code: "UNKNOWN_ERROR" },
    { status: 500 },
  );
}
