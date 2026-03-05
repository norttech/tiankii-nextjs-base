import { z } from "zod";

const buildEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export const buildEnv = buildEnvSchema.parse(process.env);

const serverEnvSchema = z.object({
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required (NextAuth secret key)"),
  DATABASE_URL: z
    .string()
    .url("DATABASE_URL must be a valid URL")
    .refine((url) => url.startsWith("postgresql://"), {
      message: "DATABASE_URL must be a PostgreSQL connection string",
    }),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type Env = ServerEnv;

function createEnv(): ServerEnv {
  const isBuildPhase =
    process.env.NEXT_IS_BUILD === "true" ||
    !!process.env.CI ||
    process.env.npm_lifecycle_event === "build";

  if (isBuildPhase) {
    return process.env as unknown as ServerEnv;
  }

  const result = serverEnvSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Environment validation failed:");
    console.error(JSON.stringify(result.error.flatten().fieldErrors, null, 2));
    throw new Error(
      "Invalid environment configuration. Make sure all required variables are set in your container environment.",
    );
  }

  return result.data;
}

export const env = createEnv();
