"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background px-4 text-center">
      <div className="space-y-6">
        <h1 className="text-8xl font-bold tracking-tighter text-foreground sm:text-9xl">404</h1>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Page not found</h2>
          <p className="text-muted-foreground max-w-[500px] mx-auto">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been removed, renamed, or didn&apos;t exist in the first place.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/">
              Return Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <button onClick={() => window.history.back()}>
              Go Back
            </button>
          </Button>
        </div>
      </div>
    </div>
  );
}
