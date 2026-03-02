import { PUBLIC_PATHS } from "@/lib/config/routes";

export { PUBLIC_PATHS };

export function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;

  for (const path of PUBLIC_PATHS) {
    if (path.endsWith("*")) {
      const prefix = path.slice(0, -1);
      if (pathname.startsWith(prefix)) return true;
    }
  }

  return false;
}
