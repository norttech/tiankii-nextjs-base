import { NextResponse } from "next/server";

import NextAuth from "next-auth";

import { authConfig } from "./auth.config";

import { routing } from "@/lib/i18n/routing";
import { logger } from "@/lib/logger";
import { isPublicRoute, isAnonymousRoute, authMiddleware, i18nMiddleware } from "@/middlewares";

const { auth } = NextAuth(authConfig);

// Matches locale prefixes like /en, /es, /en/, /es/
const localesPattern = new RegExp(`^/(${routing.locales.join("|")})(/?|$)`);

/**
 * Removes the locale prefix for consistent route matching.
 * Example: "/en/assets" -> "/assets", "/es" -> "/"
 */
function stripLocale(pathname: string): string {
  return pathname.replace(localesPattern, "/") || "/";
}

/**
 * Extracts the locale prefix from a pathname.
 * Example: "/en/assets" -> "en", "/assets" -> ""
 */
function extractLocale(pathname: string): string {
  const match = pathname.match(localesPattern);
  return match ? match[1]! : "";
}

/**
 * Adds locale prefix to a path if locale exists.
 * Example: ("/onboarding", "en") -> "/en/onboarding", ("/login", "") -> "/login"
 */
function getLocalizedPath(path: string, locale: string): string {
  return locale ? `/${locale}${path}` : path;
}

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;

  // ── 1. Route Classification ───────────────────────────────────────────────
  const isApiRoute = pathname.startsWith("/api");
  // API routes have no locale. For page routes, strip the locale for consistent matching.
  const pathWithoutLocale = isApiRoute ? pathname : stripLocale(pathname);
  const locale = isApiRoute ? "" : extractLocale(pathname);

  const isPublic = isPublicRoute(pathWithoutLocale);
  const isAnonymous = isApiRoute ? false : isAnonymousRoute(pathWithoutLocale);
  const isProtected = !isPublic && !isAnonymous;

  // ── 2. Authentication Enforcement ─────────────────────────────────────────
  if (isProtected) {
    try {
      const authResult = authMiddleware(req);
      if (authResult) {
        return authResult;
      }
    } catch (error) {
      logger.error("Auth middleware error", error);
      const loginUrl = new URL(getLocalizedPath("/login", locale), req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── 3. API Route Bypass ───────────────────────────────────────────────────
  // API routes don't require session redirects or i18n logic, so we exit early.
  if (isApiRoute) {
    return NextResponse.next();
  }

  // ── 4. Session-Based Redirects ────────────────────────────────────────────
  // Only applies to authenticated users on page routes.
  const session = req.auth;

  if (session?.user && !isPublic) {
    const isOnboardingRoute = pathWithoutLocale === "/onboarding";
    const hasCompletedOnboarding = session.user.onboardingCompleted === true;

    // Scenario A: User hasn't completed onboarding.
    if (!hasCompletedOnboarding && !isOnboardingRoute) {
      const url = req.nextUrl.clone();
      url.pathname = getLocalizedPath("/onboarding", locale);
      return NextResponse.redirect(url);
    }

    // Scenario B: User is fully onboarded and tries to access an anonymous page
    // (/, /login, /register) or the /onboarding page itself.
    // Send them to their dashboard instead.
    if (hasCompletedOnboarding && (isAnonymous || isOnboardingRoute)) {
      const url = req.nextUrl.clone();
      url.pathname = getLocalizedPath("/", locale); // TODO: change to dashboard
      return NextResponse.redirect(url);
    }
  }

  // ── 5. i18n Middleware ───────────────────────────────────────────────────
  // Handles locale detection and URL normalization (adds /en or /es prefix when
  // missing) and sets the correct locale headers for next-intl to read.
  return i18nMiddleware(req);
});

// Runs on all routes except Next.js internals and static files.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|_next/data|robots\\.txt|sitemap\\.xml).*)",
  ],
};
