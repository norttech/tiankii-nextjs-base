import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

import { routing } from "@/lib/i18n/routing";
import { isPublicRoute, authMiddleware, i18nMiddleware } from "@/middlewares";

const { auth } = NextAuth(authConfig);

const localesPattern = new RegExp(`^/(${routing.locales.join("|")})(/?|$)`);

function stripLocale(pathname: string): string {
  return pathname.replace(localesPattern, "/") || "/";
}

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;

  const isApiRoute = pathname.startsWith("/api");
  const isStaticAsset = pathname.startsWith("/_next") || /\.\w+$/.test(pathname);

  if (isStaticAsset) return NextResponse.next();

  const pathWithoutLocale = isApiRoute ? pathname : stripLocale(pathname);

  if (!isPublicRoute(pathWithoutLocale)) {
    const authResult = authMiddleware(req);
    if (authResult) return authResult;
  }

  if (!isApiRoute) {
    return i18nMiddleware(req);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|[^/]+\\.[^/]+$).*)"],
};
