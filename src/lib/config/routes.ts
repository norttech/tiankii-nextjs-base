/**
 * Security Route Configuration
 *
 * Defines paths that are accessible without authentication.
 * Add new public pages or API routes here.
 */

/**
 * Public pages accessible by anonymous users.
 */
export const PUBLIC_PAGES: string[] = [
  "/",
  // "/login",
  // "/register",
];

/**
 * Public API routes that bypass authentication.
 */
export const PUBLIC_API_ROUTES: string[] = [
  "/api/auth/*",
  "/api/ping",
  // "/api/public/*",
];

/**
 * Combined list of all public paths.
 * Used by the middleware to bypass authentication checks.
 */
export const PUBLIC_PATHS: string[] = [...PUBLIC_PAGES, ...PUBLIC_API_ROUTES];
