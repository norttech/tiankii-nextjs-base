"use client";

import { type ReactNode, useState } from "react";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Client-side providers wrapper.
 * Add ThemeProvider, etc. here as the project grows.
 */
export function Providers({ children }: ProvidersProps) {
  // useState ensures each request gets its own QueryClient instance
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>{children}</SessionProvider>
    </QueryClientProvider>
  );
}
