import type { LoginResponse } from "../types";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}/api/v1`;
const STORAGE_KEYS = {
  ACCESS_TOKEN: "codestride_access_token",
  REFRESH_TOKEN: "codestride_refresh_token",
  USER: "codestride_user",
};

export function getStoredTokens(): LoginResponse | null {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  if (!accessToken || !refreshToken) return null;
  return {
    accessToken,
    refreshToken,
    tokenType: "Bearer",
  };
}

export function setStoredTokens(tokens: LoginResponse | null) {
  if (tokens) {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: Error | null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  tokenOverride?: string
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const tokens = getStoredTokens();
  const token = tokenOverride ?? tokens?.accessToken;

  if (token) {
    const cleanToken = token.trim();
    const authHeader = cleanToken.startsWith("Bearer ")
      ? cleanToken
      : `Bearer ${cleanToken}`;
    headers.set("Authorization", authHeader);
  }

  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${normalizedEndpoint}`;

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (err) {
    throw new Error("Network error: Could not connect to CodeStride backend.");
  }

  // Handle Token Expiration (401)
  if (response.status === 401 && tokens?.refreshToken && !endpoint.includes("/auth/")) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: tokens.refreshToken }),
        });

        if (refreshResponse.ok) {
          const newTokens = (await refreshResponse.json()) as LoginResponse;
          setStoredTokens(newTokens);
          window.dispatchEvent(new CustomEvent("auth:tokens_refreshed", { detail: newTokens }));
          processQueue(null);
          isRefreshing = false;
          // Retry original request with new access token
          headers.set("Authorization", `Bearer ${newTokens.accessToken}`);
          const retryRes = await fetch(url, { ...options, headers });
          if (!retryRes.ok) {
            throw new Error(`Request failed after refresh: ${retryRes.status}`);
          }
          if (retryRes.status === 204) return undefined as T;
          return retryRes.json() as Promise<T>;
        } else {
          setStoredTokens(null);
          processQueue(new Error("Session expired. Please log in again."));
          isRefreshing = false;
          window.dispatchEvent(new Event("auth:logout"));
          throw new Error("Session expired. Please log in again.");
        }
      } catch (refreshErr) {
        setStoredTokens(null);
        processQueue(refreshErr instanceof Error ? refreshErr : new Error("Session expired"));
        isRefreshing = false;
        window.dispatchEvent(new Event("auth:logout"));
        throw refreshErr;
      }
    } else {
      // Queue requests while token refresh is in flight
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: () => {
            const freshTokens = getStoredTokens();
            if (freshTokens) {
              headers.set("Authorization", `Bearer ${freshTokens.accessToken}`);
            }
            fetch(url, { ...options, headers })
              .then(async (res) => {
                if (!res.ok) {
                  throw new Error(`API request failed after refresh: ${res.status}`);
                }
                if (res.status === 204) return undefined as unknown as T;
                return res.json() as Promise<T>;
              })
              .then(resolve)
              .catch(reject);
          },
          reject,
        });
      });
    }
  }

  if (!response.ok) {
    let errorMessage = `API request failed: ${response.status}`;
    try {
      const errorJson = await response.json();
      errorMessage = errorJson.message || errorJson.error || errorMessage;
    } catch {
      try {
        const errorText = await response.text();
        if (errorText) errorMessage = errorText;
      } catch {
        // ignore
      }
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
