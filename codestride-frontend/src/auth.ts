
import { apiRequest } from "./api";

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  userId: string;
}

export interface CurrentUser {
  email: string;
  message: string;
}

export function registerUser(data: RegisterRequest) {
  return apiRequest<RegisterResponse>("/auth/register", undefined, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function loginUser(data: LoginRequest) {
  return apiRequest<LoginResponse>("/auth/login", undefined, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getCurrentUser(accessToken: string) {
  return apiRequest<CurrentUser>("/auth/me", accessToken);
}

export function refreshAccessToken(refreshToken: string) {
  return apiRequest<LoginResponse>("/auth/refresh", undefined, {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export function logoutUser(refreshToken: string) {
  return apiRequest<{ message: string }>("/auth/logout", undefined, {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}
