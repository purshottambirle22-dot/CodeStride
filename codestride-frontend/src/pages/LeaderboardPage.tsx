import React, { useState, useEffect } from "react";
import {
  Medal,
  Crown,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { getLeaderboard, getMyRank } from "../api/leaderboard";
import { useAuth } from "../context/AuthContext";
import type { LeaderboardEntry, LeaderboardPage as ILeaderboardPage } from "../types";
import { TableRowSkeleton } from "../components/common/LoadingSkeleton";
import { useToast } from "../context/ToastContext";

export const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [leaderboardData, setLeaderboardData] = useState<ILeaderboardPage | null>(null);
  const [myRank, setMyRank] = useState<LeaderboardEntry | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      try {
        const [pageResult, myRankResult] = await Promise.all([
          getLeaderboard(currentPage, 15),
          getMyRank().catch(() => null),
        ]);

        if (cancelled) return;
        setLeaderboardData(pageResult);
        setMyRank(myRankResult);
      } catch (err) {
        if (!cancelled) {
          showToast(err instanceof Error ? err.message : "Failed to load leaderboard", "error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [currentPage, showToast]);

  const entries = leaderboardData?.content ?? [];
  const topThree = currentPage === 0 ? entries.slice(0, 3) : [];

  return (
    <div className="space-y-8 pb-12 transition-colors duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Competitive Leaderboard
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Real-time global rankings based on verified problem solving points.
        </p>
      </div>

      {/* Top 3 Podium (shown on Page 1) */}
      {currentPage === 0 && topThree.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* 2nd Place */}
          {topThree[1] && (
            <div className="relative order-2 md:order-1 flex flex-col items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 p-6 text-center shadow-sm dark:shadow-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-300 bg-slate-100 dark:border-slate-400/40 dark:bg-slate-400/10 text-slate-600 dark:text-slate-300 shadow-sm">
                <Medal className="h-6 w-6" />
              </div>
              <div className="mt-4">
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                  Rank #2
                </span>
                <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                  {topThree[1].username || "Strider"}
                </h3>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-slate-700 dark:text-slate-300 text-sm font-black">
                <Zap className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                {topThree[1].totalPoints} pts
              </div>
            </div>
          )}

          {/* 1st Place (Gold Podium) */}
          {topThree[0] && (
            <div className="relative order-1 md:order-2 flex flex-col items-center justify-between rounded-2xl border border-amber-500/40 bg-gradient-to-b from-amber-50/80 via-white to-amber-50/20 dark:from-amber-500/10 dark:via-slate-900 dark:to-slate-950 p-8 text-center shadow-xl shadow-amber-500/10 md:-translate-y-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-amber-400/50 bg-amber-400/20 text-amber-600 dark:text-amber-300 shadow-xl shadow-amber-400/20">
                <Crown className="h-8 w-8" />
              </div>
              <div className="mt-4">
                <span className="rounded-full border border-amber-500/40 bg-amber-500/20 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  Champion #1
                </span>
                <h3 className="mt-3 text-lg font-extrabold text-slate-900 dark:text-white truncate max-w-[200px]">
                  {topThree[0].username || "Champion"}
                </h3>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-base font-black">
                <Zap className="h-5 w-5 fill-amber-400 text-amber-500 dark:text-amber-400" />
                {topThree[0].totalPoints} pts
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <div className="relative order-3 flex flex-col items-center justify-between rounded-2xl border border-slate-200 dark:border-amber-700/50 bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 p-6 text-center shadow-sm dark:shadow-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-600/30 bg-amber-600/10 text-amber-700 dark:text-amber-600 shadow-sm">
                <Medal className="h-6 w-6" />
              </div>
              <div className="mt-4">
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-600">
                  Rank #3
                </span>
                <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                  {topThree[2].username || "Strider"}
                </h3>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-slate-700 dark:text-slate-300 text-sm font-black">
                <Zap className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                {topThree[2].totalPoints} pts
              </div>
            </div>
          )}
        </section>
      )}

      {/* Logged in user rank banner */}
      {myRank && (
        <div className="flex items-center justify-between rounded-2xl border border-indigo-200 dark:border-indigo-500/40 bg-gradient-to-r from-indigo-50 via-white to-indigo-50/60 dark:from-indigo-500/15 dark:via-slate-900 dark:to-indigo-500/10 p-4 shadow-sm dark:shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white shadow-md shadow-indigo-600/30">
              #{myRank.rank}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Your Ranking</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Logged in as <span className="text-indigo-600 dark:text-indigo-300 font-semibold">{user?.username || user?.email}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-black text-indigo-600 dark:text-indigo-300">
            <Zap className="h-4 w-4" />
            {myRank.totalPoints} points
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 shadow-sm dark:shadow-xl backdrop-blur-sm">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <tr>
              <th className="py-3.5 px-6 w-20 text-center">Rank</th>
              <th className="py-3.5 px-6">Strider</th>
              <th className="py-3.5 px-6 text-right">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRowSkeleton key={i} cols={3} />
              ))
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-slate-400">
                  No leaderboard entries available.
                </td>
              </tr>
            ) : (
              entries.map((entry) => {
                const isCurrentUser = user?.id === entry.userId || user?.username === entry.username;

                return (
                  <tr
                    key={entry.userId}
                    className={`transition-colors duration-150 ${
                      isCurrentUser
                        ? "bg-indigo-50/70 dark:bg-indigo-500/10 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-500/15"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-4 px-6 text-center">
                      {entry.rank === 1 ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-300 font-black text-xs">
                          1
                        </span>
                      ) : entry.rank === 2 ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-400/20 text-slate-700 dark:text-slate-300 font-black text-xs">
                          2
                        </span>
                      ) : entry.rank === 3 ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-700/20 text-amber-700 dark:text-amber-600 font-black text-xs">
                          3
                        </span>
                      ) : (
                        <span className="font-semibold text-slate-500 dark:text-slate-400">
                          #{entry.rank}
                        </span>
                      )}
                    </td>

                    {/* Username */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
                          {(entry.username?.[0] || "U").toUpperCase()}
                        </div>
                        <div>
                          <span className={`font-semibold ${isCurrentUser ? "text-indigo-600 dark:text-indigo-300" : "text-slate-900 dark:text-white"}`}>
                            {entry.username || "CodeStride User"}
                          </span>
                          {isCurrentUser && (
                            <span className="ml-2 rounded bg-indigo-50 dark:bg-indigo-500/20 px-1.5 py-0.5 text-[10px] text-indigo-700 dark:text-indigo-300 font-bold">
                              YOU
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Points */}
                    <td className="py-4 px-6 text-right">
                      <span className="font-extrabold text-amber-500 dark:text-amber-400 text-sm">
                        {entry.totalPoints}
                      </span>
                      <span className="text-slate-400 text-xs ml-1">pts</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {leaderboardData && leaderboardData.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4 px-2 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Page {leaderboardData.page + 1} of {leaderboardData.totalPages}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition shadow-xs"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(leaderboardData.totalPages - 1, p + 1))}
              disabled={currentPage >= leaderboardData.totalPages - 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition shadow-xs"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
