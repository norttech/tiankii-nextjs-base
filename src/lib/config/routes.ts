/**
 * Security Route Configuration
 *
 * Defines paths that are accessible without authentication.
 * Add new public pages or API routes here.
 */

/**
 * Anonymous pages. Accessible by non-authenticated users.
 * Authenticated users will be redirected to the dashboard (/assets).
 */
export const ANONYMOUS_PAGES: string[] = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

/**
 * Public pages accessible by anonymous users.
 */
export const PUBLIC_PAGES: string[] = [];

/**
 * Public API routes that bypass authentication.
 */
export const PUBLIC_API_ROUTES: string[] = [
  "/api/auth/*",
  "/api/ping",
  // "/api/public/*",
];
