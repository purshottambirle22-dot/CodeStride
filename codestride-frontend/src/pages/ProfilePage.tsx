import React, { useState, useEffect } from "react";
import {
  Mail,
  Calendar,
  Save,
  Sun,
  Moon,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { updateMyProfile } from "../api/user";
import { getMyDashboard } from "../api/dashboard";
import type { DashboardData } from "../types";
import { useToast } from "../context/ToastContext";

export const ProfilePage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  const [username, setUsername] = useState(user?.username || "");
  const [selectedTheme, setSelectedTheme] = useState<string>(theme);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
    }
  }, [user]);

  useEffect(() => {
    void getMyDashboard()
      .then(setDashboard)
      .catch(() => null);
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      showToast("Username cannot be empty", "warning");
      return;
    }

    try {
      setSaving(true);
      await updateMyProfile({
        username: username.trim(),
        theme: selectedTheme,
      });

      setTheme(selectedTheme as "DARK" | "LIGHT");
      await refreshProfile();
      showToast("Profile & preferences updated successfully", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const createdFormatted = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Member";

  return (
    <div className="space-y-8 pb-12 max-w-4xl transition-colors duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Account Profile & Settings
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Manage your personal details, platform preferences, and track your account standings.
        </p>
      </div>

      {/* User Hero Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 p-6 md:p-8 shadow-sm dark:shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-3xl font-black text-white shadow-xl shadow-indigo-600/30">
            {(user?.username?.[0] || user?.email?.[0] || "U").toUpperCase()}
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {user?.username || "CodeStride Strider"}
              </h2>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  user?.role === "ADMIN"
                    ? "border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    : "border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                }`}
              >
                {user?.role === "ADMIN" && <ShieldCheck className="h-3 w-3" />}
                {user?.role || "USER"}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {user?.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Joined {createdFormatted}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-8 grid grid-cols-3 gap-3 border-t border-slate-200 dark:border-slate-800/80 pt-6 text-center">
          <div>
            <span className="block text-xl md:text-2xl font-black text-amber-500 dark:text-amber-400">
              {dashboard?.totalPoints ?? 0}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
              Total Points
            </span>
          </div>

          <div>
            <span className="block text-xl md:text-2xl font-black text-emerald-500 dark:text-emerald-400">
              {dashboard?.solvedQuestions ?? 0}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
              Problems Solved
            </span>
          </div>

          <div>
            <span className="block text-xl md:text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {dashboard?.leaderboardRank ? `#${dashboard.leaderboardRank}` : "Unranked"}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
              Global Rank
            </span>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm dark:shadow-none backdrop-blur-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
          Profile Preferences
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Display Username
            </label>
            <input
              type="text"
              required
              minLength={3}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              This username is shown on your profile and the public leaderboard.
            </p>
          </div>

          {/* Email (Read Only) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ""}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/80 px-4 py-2.5 text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed outline-none"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Your registered account email address cannot be changed directly.
            </p>
          </div>

          {/* Theme Preference */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Theme Mode
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              <button
                type="button"
                onClick={() => setSelectedTheme("DARK")}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition ${
                  selectedTheme === "DARK"
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Moon className="h-4 w-4" />
                Dark Theme
              </button>

              <button
                type="button"
                onClick={() => setSelectedTheme("LIGHT")}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition ${
                  selectedTheme === "LIGHT"
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Sun className="h-4 w-4" />
                Light Theme
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="border-t border-slate-800 pt-5 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 transition"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving Changes..." : "Save Preferences"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
