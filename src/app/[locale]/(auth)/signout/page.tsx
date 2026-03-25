"use client";

import { useEffect } from "react";

import { signOut } from "next-auth/react";

export default function SignOutPage() {
  useEffect(() => {
    // Clear NextAuth session and redirect to login
    signOut({ callbackUrl: "/login", redirect: true });

    // Also clear local storage / session storage as a safety net
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();

      // Clear all cookies manually as a fallback
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
      });
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Signing out...</h1>
        <p className="text-muted-foreground">
          Please wait while we log you out and clean your session data.
        </p>
        <div className="mt-4 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      </div>
    </div>
  );
}
