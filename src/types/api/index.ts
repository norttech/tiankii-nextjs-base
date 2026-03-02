// ─── Error response ───────────────────────────────────────────────────────────
export interface ApiErrorResponse {
  error: string;
  details?: Record<string, unknown>;
  code?: string;
}

// ─── Success response ─────────────────────────────────────────────────────────
export interface ApiSuccessResponse<T = unknown> {
  data: T;
  message?: string;
}
