import createMiddleware from "next-intl/middleware";

import { routing } from "@/lib/i18n/routing";

/**
 * i18n Middleware
 *
 * Injects the appropriate locale into the request for Next.js App Router
 * based on the user's preferred language, and handles prefix routing.
 */
export const i18nMiddleware = createMiddleware(routing);
