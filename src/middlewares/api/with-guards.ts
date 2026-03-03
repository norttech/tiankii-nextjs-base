/* eslint-disable @typescript-eslint/no-explicit-any */
import { type z } from "zod";
import { auth } from "@/auth";
import { type NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/utils/error-handler";

export type GuardContext<B = unknown> = {
  req: NextRequest;
  user?: SessionUser;
  body?: B;
};

export type GuardFunction = (ctx: GuardContext<any>) => Promise<Response | void>;

export interface GuardOptions<S extends z.ZodType = z.ZodType> {
  schema?: S;
  guards?: GuardFunction[];
}

/**
 * Guard: Validates that the user is authenticated.
 */
export const authGuard: GuardFunction = async (ctx) => {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized. A valid session is required.", code: "UNAUTHORIZED" },
      { status: 401 },
    );
  }
  ctx.user = session.user as SessionUser;
};

/**
 * Guard Factory: Validates the request body against a Zod schema.
 */
export const schemaGuard = (schema: z.ZodType): GuardFunction => {
  return async (ctx) => {
    const rawBody = await ctx.req.json();
    ctx.body = schema.parse(rawBody);
  };
};

/**
 * The Guard Composer (HOF).
 * Generic on the Zod schema so `ctx.body` is strongly typed as `z.infer<S>` in the handler.
 */
export function withGuards<S extends z.ZodType = z.ZodType>(
  options: GuardOptions<S>,
  handler: (
    ctx: GuardContext<z.infer<S>> & { user: SessionUser; body: z.infer<S> },
    ...args: any[]
  ) => Promise<Response>,
) {
  return async (req: NextRequest, ...args: any[]) => {
    const ctx: GuardContext<any> = { req };

    try {
      // 1. Always authenticate
      const authRes = await authGuard(ctx);
      if (authRes) return authRes;

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
        ...args,
      );
    } catch (error) {
      return handleApiError(error);
    }
  };
}
