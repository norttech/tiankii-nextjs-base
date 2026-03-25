import { PUBLIC_PAGES, PUBLIC_API_ROUTES, ANONYMOUS_PAGES } from "@/lib/config/routes";

export { PUBLIC_PAGES, PUBLIC_API_ROUTES, ANONYMOUS_PAGES };

export function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_PAGES.includes(pathname)) return true;

  for (const path of PUBLIC_API_ROUTES) {
    if (path.endsWith("*")) {
      const prefix = path.slice(0, -1);
      if (pathname.startsWith(prefix)) return true;
    } else if (path === pathname) {
      return true;
    }
  }

  return false;
}

export function isAnonymousRoute(pathname: string): boolean {
  if (ANONYMOUS_PAGES.includes(pathname)) return true;

  for (const path of ANONYMOUS_PAGES) {
    if (path.endsWith("*")) {
      const prefix = path.slice(0, -1);
      if (pathname.startsWith(prefix)) return true;
    }
  }

  return false;
}
