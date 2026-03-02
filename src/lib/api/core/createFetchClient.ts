import { apiFetch } from "./apiFetch";

export type ApiCaller = <T>(path: string, options?: RequestInit) => Promise<T>;

export function createPrivateApiFactory(
  getToken: () => string | undefined | Promise<string | undefined>
) {
  return function (baseUrl: string): ApiCaller {
    return async function <T>(path: string, options?: RequestInit) {
      const token = await getToken();

      const headers = new Headers(options?.headers);
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return apiFetch<T>(path, {
        ...options,
        baseUrl,
        headers,
      });
    };
  };
}

export function createPublicApiFactory() {
  return function (baseUrl: string): ApiCaller {
    return async function <T>(path: string, options?: RequestInit) {
      return apiFetch<T>(path, {
        ...options,
        baseUrl,
      });
    };
  };
}
