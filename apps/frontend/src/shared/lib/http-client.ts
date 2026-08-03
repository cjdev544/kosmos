import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./auth-storage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";
const PUBLIC_PATHS = new Set(["/auth/login", "/auth/register", "/auth/refresh"]);

export class HttpError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (response) => {
        if (!response.ok) return null;
        const body = await response.json();
        setTokens(body.tokens.accessToken, body.tokens.refreshToken);
        return body.tokens.accessToken as string;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

async function request<T>(path: string, options: RequestInit = {}, allowRetry = true): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (response.status === 401 && allowRetry && !PUBLIC_PATHS.has(path)) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return request<T>(path, options, false);
    }
    clearTokens();
    window.location.href = "/login";
    throw new HttpError(401, "Sesión expirada");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new HttpError(response.status, body?.error?.message ?? "La solicitud falló");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const httpClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
