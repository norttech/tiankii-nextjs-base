import { NextResponse, type NextRequest } from "next/server";

import { type Session } from "next-auth";

export function authMiddleware(
  req: NextRequest & { auth?: Session | null },
): NextResponse | undefined {
  const isLoggedIn = !!req.auth;

  if (!isLoggedIn) {
    const { pathname, search } = req.nextUrl;

    // API routes get a JSON 401 response
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized. A valid session is required." },
        { status: 401 },
      );
    }

    // Page routes get redirected to the custom login page.
    // i18nMiddleware will catch this new request and automatically attach the correct locale.
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname + search);

    return NextResponse.redirect(loginUrl);
  }

  return undefined; // Allow request to continue
}
