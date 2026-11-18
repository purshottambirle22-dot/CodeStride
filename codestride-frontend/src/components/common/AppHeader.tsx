import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Flame,
  Sun,
  Moon,
  Menu,
  ChevronRight,
  ShieldCheck,
  User,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { getQuestions } from "../../api/catalog";
import type { Question } from "../../types";
import { DifficultyBadge } from "./DifficultyBadge";
import type { NavItemKey } from "./AppSidebar";

interface AppHeaderProps {
  activeTab: NavItemKey;
  onNavigate: (tab: NavItemKey) => void;
  onSelectQuestion?: (question: Question) => void;
  onOpenMobileMenu: () => void;
  streakCount?: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  onNavigate,
  onSelectQuestion,
  onOpenMobileMenu,
  streakCount = 0,
}) => {
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Question[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await getQuestions({ search: searchQuery.trim() });
        setSearchResults(results.slice(0, 6));
        setShowDropdown(true);
      } catch (err) {
        console.error("Quick search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener for search & user dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tabLabels: Record<NavItemKey, string> = {
    Dashboard: "Dashboard",
    Questions: "Explore Questions",
    Topics: "Topics",
    Patterns: "Patterns",
    Progress: "My Progress",
    Bookmarks: "Bookmarks",
    Revision: "Revision List",
    Leaderboard: "Leaderboard",
    Profile: "Profile & Settings",
    Admin: "Admin Console",
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/80 px-4 md:px-8 backdrop-blur-md transition-colors duration-200">
      {/* Left: Mobile hamburger + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
        >
          <Menu className="h-5 w-5" />
        </button>

        <nav className="flex items-center gap-2 text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400">
          <span className="hover:text-slate-800 dark:hover:text-slate-200 transition">CodeStride</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-900 dark:text-white font-semibold">
            {tabLabels[activeTab] || activeTab}
          </span>
        </nav>
      </div>

      {/* Center: Global Question Search */}
      <div ref={searchRef} className="relative hidden sm:block w-72 md:w-96">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) setShowDropdown(true);
            }}
            placeholder="Search problems, patterns, topics..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-100/80 dark:bg-slate-950/80 py-2 pl-9 pr-8 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
                setShowDropdown(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showDropdown && (
          <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl z-50">
            {isSearching ? (
              <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                Searching questions...
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                No questions found matching "{searchQuery}".
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <div className="bg-slate-50 dark:bg-slate-950/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Questions ({searchResults.length})
                </div>
                {searchResults.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      setShowDropdown(false);
                      setSearchQuery("");
                      if (onSelectQuestion) {
                        onSelectQuestion(q);
                      } else {
                        onNavigate("Questions");
                      }
                    }}
                    className="flex w-full items-center justify-between p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/80 transition"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                        {q.title}
                      </p>
                    </div>
                    <DifficultyBadge difficulty={q.difficulty} size="sm" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Actions: Streak, Theme Toggle, User Profile */}
      <div className="flex items-center gap-3">
        {/* Streak counter */}
        <div
          title={`${streakCount} day study streak!`}
          className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 shadow-xs"
        >
          <Flame className="h-4 w-4 fill-amber-400 text-amber-500 dark:text-amber-400 animate-pulse" />
          <span>{streakCount} {streakCount === 1 ? "day" : "days"}</span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === "DARK" ? "light" : "dark"} mode`}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-950 dark:hover:text-white transition"
        >
          {theme === "DARK" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
        </button>

        {/* User avatar and dropdown */}
        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-xl p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 font-bold text-white shadow-md shadow-indigo-500/20">
              {(user?.username?.[0] || user?.email?.[0] || "U").toUpperCase()}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
              <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-3">
                <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                  {user?.username || "CodeStride User"}
                </p>
                <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                  {user?.email}
                </p>
              </div>

              <div className="p-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onNavigate("Profile");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  Profile & Settings
                </button>

                {isAdmin && (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onNavigate("Admin");
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
                  >
                    <ShieldCheck className="h-4 w-4 text-rose-500 dark:text-rose-400" />
                    Admin Console
                  </button>
                )}

                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
