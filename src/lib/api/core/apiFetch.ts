export interface FetcherOptions extends RequestInit {
  baseUrl?: string;
}

export async function apiFetch<T>(path: string, options: FetcherOptions = {}): Promise<T> {
  const { baseUrl, ...init } = options;
  const url = baseUrl ? `${baseUrl}${path}` : path;

  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error ?? errorData.message ?? `HTTP error! status: ${response.status}`,
    );
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
