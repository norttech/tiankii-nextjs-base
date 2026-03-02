/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/auth";
import { type NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/utils/error-handler";
import type { SessionUser } from "@/types";
import type { AppRole } from "@/auth.config";
import { type ZodSchema } from "zod";

export type GuardContext = {
  req: NextRequest;
  user?: SessionUser;
  body?: any;
};

export type GuardFunction = (ctx: GuardContext) => Promise<Response | void>;

export interface GuardOptions {
  roles?: AppRole[];
  schema?: ZodSchema;
  guards?: GuardFunction[];
}

/**
 * Transforms the raw session user into an extended SessionUser object.
 */
function transformUser(rawUser: any): SessionUser {
  const role = rawUser.role as AppRole;
  return {
    ...rawUser,
    isAdmin: role === "admin",
    isAuditor: role === "auditor",
    isCliente: role === "cliente",
  };
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
  ctx.user = transformUser(session.user);
};

/**
 * Guard Factory: Validates that the user has one of the required roles.
 */
export const roleGuard = (allowedRoles: AppRole[]): GuardFunction => {
  return async (ctx) => {
    if (!ctx.user) return; // Should be preceded by authGuard
    if (!allowedRoles.includes((ctx.user as any).role)) {
      throw new Error(`Forbidden. Required roles: ${allowedRoles.join(", ")}`);
    }
  };
};

/**
 * Guard Factory: Validates the request body against a Zod schema.
 */
export const schemaGuard = (schema: ZodSchema): GuardFunction => {
  return async (ctx) => {
    const rawBody = await ctx.req.json();
    ctx.body = schema.parse(rawBody);
  };
};

/**
 * The Guard Composer (HOF)
 * Wraps an API handler with centralized error handling and a chain of guards.
 */
export function withGuards(
  options: GuardOptions,
  handler: (ctx: Required<GuardContext>) => Promise<Response>,
) {
  return async (req: NextRequest) => {
    const ctx: GuardContext = { req };

    try {
      // 1. Run internal standard guards first if specified in options
      if (options.roles) {
        const res = await authGuard(ctx);
        if (res) return res;

        const resRole = await roleGuard(options.roles)(ctx);
        if (resRole) return resRole;
      } else {
        // Just auth if no specific roles but we want a user object
        const res = await authGuard(ctx);
        if (res) return res;
      }

      // 2. Run schema validation if specified
      if (options.schema) {
        await schemaGuard(options.schema)(ctx);
      }

      // 3. Run any additional custom guards
      if (options.guards) {
        for (const guard of options.guards) {
          const res = await guard(ctx);
          if (res) return res; // Short-circuit if guard returns a Response
        }
      }

      // 4. Execute the final handler
      return await handler(ctx as Required<GuardContext>);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
