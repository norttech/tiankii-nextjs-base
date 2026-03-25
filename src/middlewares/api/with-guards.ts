/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest } from "next/server";

import { type z } from "zod";

import { auth } from "@/auth";
import { handleApiError, UnauthorizedError } from "@/lib/utils/error-handler";

// ─── Context Types ────────────────────────────────────────────────────────────

/** Base context passed through every guard and into the handler. */
export type GuardContext<B = unknown> = {
  req: NextRequest;
  user?: SessionUser;
  body?: B;
};

export type GuardFunction = (_ctx: GuardContext<any>) => Promise<Response | void>;

export interface GuardOptions<S extends z.ZodType = z.ZodType> {
  schema?: S;
  guards?: GuardFunction[];
}

// ─── Built-in Guards ──────────────────────────────────────────────────────────

/**
 * Guard: Validates that the user is authenticated.
 * Throws `UnauthorizedError` so the central error handler returns a consistent response.
 */
export const authGuard: GuardFunction = async (ctx) => {
  const session = await auth();
  if (!session?.user) {
    throw new UnauthorizedError();
  }
  ctx.user = session.user as SessionUser;
};

/**
 * Guard Factory: Validates the request body against a Zod schema.
 * The Zod `.parse()` throws a `ZodError` which `handleApiError` already formats.
 */
export const schemaGuard = (schema: z.ZodType): GuardFunction => {
  return async (ctx) => {
    try {
      const rawBody = await ctx.req.json();
      ctx.body = schema.parse(rawBody);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error("Request body is required and must be valid JSON.", { cause: error });
      }
      throw error;
    }
  };
};

// ─── The Guard Composer (HOF) ─────────────────────────────────────────────────

/**
 * Generic guard composer for any authorized endpoint.
 * Always authenticates, optionally validates body, runs custom guards, then the handler.
 */
export function withGuards<S extends z.ZodType = z.ZodType>(
  options: GuardOptions<S>,
  handler: (
    _ctx: GuardContext<z.infer<S>> & { user: SessionUser; body: z.infer<S> },
    ..._args: any[]
  ) => Promise<Response>,
) {
  return async (req: NextRequest, ..._args: any[]) => {
    const ctx: GuardContext<any> = { req };

    try {
      // 1. Always authenticate
      await authGuard(ctx);

      // 2. Run schema validation if specified
      if (options.schema) {
        await schemaGuard(options.schema)(ctx);
      }

      // 3. Run any additional custom guards
      if (options.guards) {
        for (const guard of options.guards) {
          const res = await guard(ctx);
          if (res) return res;
        }
      }

      // 4. Execute the final handler
      return await handler(
        ctx as GuardContext<z.infer<S>> & { user: SessionUser; body: z.infer<S> },
        ..._args,
      );
    } catch (error) {
      return handleApiError(error);
    }
  };
}
