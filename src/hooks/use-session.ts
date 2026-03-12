"use client";

import { useSession as useNextAuthSession } from "next-auth/react";

export function useSession() {
  const { data: session, status, update } = useNextAuthSession();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  const user = session?.user as SessionUser | undefined;
  const onboardingCompleted = session?.user?.onboardingCompleted ?? false;

  return {
    session: session,
    user,
    isLoading,
    isAuthenticated,
    onboardingCompleted,
    update,
  };
}
