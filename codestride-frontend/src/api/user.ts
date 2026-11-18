import { apiRequest } from "./client";
import type { User } from "../types";

export function getMyProfile(tokenOverride?: string) {
  return apiRequest<User>("/users/me", {}, tokenOverride);
}

export function updateMyProfile(data: { username: string; theme: string }) {
  return apiRequest<User>("/users/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
