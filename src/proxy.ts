import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import { isPublicRoute, authMiddleware } from "@/middlewares";

const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;

  // 1. Public routes bypass all checks
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // 2. Auth gate
  const authResult = authMiddleware(req);
  if (authResult) return authResult;

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
