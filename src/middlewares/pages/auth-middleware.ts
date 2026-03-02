import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Session } from "next-auth";

export function authMiddleware(
  req: NextRequest & { auth?: Session | null },
): NextResponse | undefined {
  const isLoggedIn = !!req.auth;

  if (!isLoggedIn) {
    const { pathname } = req.nextUrl;

    // API routes get a JSON 401 response
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized. A valid session is required." },
        { status: 401 },
      );
    }

    // Page routes get redirected to sign-in
    return NextResponse.redirect(new URL("/api/auth/signin", req.nextUrl));
  }

  return undefined; // Allow request to continue
}
