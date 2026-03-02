"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Unhandled App Error:", error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background px-4 text-center">
      <div className="flex max-w-md flex-col items-center space-y-6">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Something went wrong!</h2>
          <p className="text-muted-foreground">
            {error.message ||
              "An unexpected error occurred while processing your request. Please try again later."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full pt-4">
          <Button onClick={() => reset()} size="lg" className="w-full sm:w-auto">
            Try Again
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="/">Return Home</Link>
          </Button>
        </div>

        {error.digest && (
          <p className="text-xs text-muted-foreground opacity-50 mt-8">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
