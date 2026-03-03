import { z } from "zod";

const envSchema = z.object({
  // ─── NextAuth ────────────────────────────────────────────────────────────
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  AUTH_URL: z.url("AUTH_URL must be a valid URL").optional(),

  // ─── Database ─────────────────────────────────────────────────────────────
  DATABASE_URL: z.url("DATABASE_URL must be a valid connection string"),

  // ─── App ─────────────────────────────────────────────────────────────────
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // ─── External APIs (add as needed per project) ────────────────────────────
  // API_BASE_URL: z.url("API_BASE_URL must be a valid URL"),
});

/**
 * Parsed and validated environment variables.
 * Import `env` instead of `process.env` throughout the app.
 * This throws at startup if any required variable is missing.
 */
export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
