"use client";

import { useSession as useNextAuthSession } from "next-auth/react";

/**
 * Typed wrapper around next-auth's useSession.
 * Provides the session with proper role and user types.
 * AppSession, AppRole and SessionUser are globally defined.
 */
export function useSession() {
  const { data: session, status, update } = useNextAuthSession();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  const user = session?.user as SessionUser | undefined;

  return {
    session: session,
    user,
    role: user?.role,
    isLoading,
    isAuthenticated,
    isAdmin: user?.role === "admin",
    isAuditor: user?.role === "auditor",
    isCliente: user?.role === "cliente",
    update,
  };
}
