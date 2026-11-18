import { apiRequest } from "./client";
import type { AdminStats, AdminUser } from "../types";

export function getAdminStats() {
  return apiRequest<AdminStats>("/admin/stats");
}

export function getAdminUsers() {
  return apiRequest<AdminUser[]>("/admin/users");
}

export function updateAdminUserRole(userId: string, role: "USER" | "ADMIN") {
  return apiRequest<AdminUser>(`/admin/users/${userId}/role`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  });
}

export function deleteAdminUser(userId: string) {
  return apiRequest<{ message: string }>(`/admin/users/${userId}`, {
    method: "DELETE",
  });
}

export function seedAdminCatalog() {
  return apiRequest<{ message: string; topicsSeeded?: number; questionsSeeded?: number }>(
    "/admin/seed",
    { method: "POST" }
  );
}
