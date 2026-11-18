import { apiRequest } from "./client";
import type { DashboardData } from "../types";

export function getMyDashboard() {
  return apiRequest<DashboardData>("/dashboard/me");
}
