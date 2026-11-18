
const API_BASE_URL = "http://localhost:8080/api/v1";

export async function apiRequest<T>(
  endpoint: string,
  token?: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    const cleanToken = token.trim();
    if (cleanToken) {
      const authHeader = cleanToken.startsWith("Bearer ")
        ? cleanToken
        : `Bearer ${cleanToken}`;
      headers.set("Authorization", authHeader);
    }
  }

  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const response = await fetch(`${API_BASE_URL}${normalizedEndpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `API request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
