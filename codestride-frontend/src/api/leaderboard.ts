import { apiRequest } from "./client";
import type { LeaderboardEntry, LeaderboardPage } from "../types";

export function getLeaderboard(page = 0, size = 15) {
  return apiRequest<LeaderboardPage>(`/leaderboard?page=${page}&size=${size}`);
}

export function getMyRank() {
  return apiRequest<LeaderboardEntry>("/leaderboard/me");
}
