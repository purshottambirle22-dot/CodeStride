import { apiRequest } from "./client";
import type { LoginRequest, LoginResponse, RegisterRequest } from "../types";

export function registerUser(data: RegisterRequest) {
  return apiRequest<{ message: string; userId: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function loginUser(data: LoginRequest) {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getCurrentUser(token?: string) {
  return apiRequest<{ email: string; message: string }>("/auth/me", {}, token);
}

export function logoutUser(refreshToken: string) {
  return apiRequest<{ message: string }>("/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}
