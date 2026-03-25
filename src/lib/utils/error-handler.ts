import { NextResponse } from "next/server";

import { ZodError } from "zod";

import { logger } from "@/lib/logger";
import type { ApiErrorResponse } from "@/types/api";

// ─── Typed App Error Classes ──────────────────────────────────────────────────

export class AppError extends Error {
  constructor(
    message: string,
    public readonly _statusCode: number = 500,
    public readonly _code: string = "INTERNAL_ERROR",
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized. A valid session is required.") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed") {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409, "CONFLICT");
    this.name = "ConflictError";
  }
}

// ─── Central API Error Handler ────────────────────────────────────────────────

const log = logger.child("api");

export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  log.error("Unhandled API error", error);

  // 1. Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: error.flatten().fieldErrors as Record<string, unknown>,
        code: "VALIDATION_ERROR",
      },
      { status: 400 },
    );
  }

  // 2. Typed App errors — use statusCode directly
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error._code },
      { status: error._statusCode },
    );
  }

  // 3. Generic JS errors (fallback string matching removed — use AppError subclasses)
  if (error instanceof Error) {
    return NextResponse.json({ error: error.message, code: "INTERNAL_ERROR" }, { status: 500 });
  }

  // 4. Unknown
  return NextResponse.json(
    { error: "An unexpected error occurred", code: "UNKNOWN_ERROR" },
    { status: 500 },
  );
}
