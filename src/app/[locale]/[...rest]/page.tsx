import { notFound } from "next/navigation";

/**
 * Catch-all route for any undefined page under [locale].
 * Triggers the not-found.tsx error boundary.
 */
export default function CatchAllPage() {
  notFound();
}
