import React from "react";
import {
  LayoutDashboard,
  Compass,
  FolderKanban,
  Shapes,
  LineChart,
  Bookmark,
  History,
  Trophy,
  UserCheck,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Code2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export type NavItemKey =
  | "Dashboard"
  | "Questions"
  | "Topics"
  | "Patterns"
  | "Progress"
  | "Bookmarks"
  | "Revision"
  | "Leaderboard"
  | "Profile"
  | "Admin";

interface AppSidebarProps {
  activeTab: NavItemKey;
  onTabChange: (tab: NavItemKey) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  activeTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { user, isAdmin, logout } = useAuth();

  const navItems = [
    { key: "Dashboard" as NavItemKey, label: "Dashboard", icon: LayoutDashboard },
    { key: "Questions" as NavItemKey, label: "Explore Questions", icon: Compass },
    { key: "Topics" as NavItemKey, label: "Topics", icon: FolderKanban },
    { key: "Patterns" as NavItemKey, label: "Patterns", icon: Shapes },
    { key: "Progress" as NavItemKey, label: "My Progress", icon: LineChart },
    { key: "Bookmarks" as NavItemKey, label: "Bookmarks", icon: Bookmark },
    { key: "Revision" as NavItemKey, label: "Revision List", icon: History },
    { key: "Leaderboard" as NavItemKey, label: "Leaderboard", icon: Trophy },
    { key: "Profile" as NavItemKey, label: "Profile & Settings", icon: UserCheck },
  ];

  if (isAdmin) {
    navItems.push({
      key: "Admin" as NavItemKey,
      label: "Admin Panel",
      icon: ShieldCheck,
    });
  }

  const handleSelect = (key: NavItemKey) => {
    onTabChange(key);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between overflow-y-auto">
      <div>
        {/* Branding */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25">
              <Code2 className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <span className="block text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  CodeStride
                </span>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  DSA Platform
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <div className="px-3 py-4">
          {!collapsed && (
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Navigation
            </p>
          )}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              const isAdminItem = item.key === "Admin";

              return (
                <button
                  key={item.key}
                  onClick={() => handleSelect(item.key)}
                  title={collapsed ? item.label : undefined}
                  className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? isAdminItem
                        ? "bg-rose-50 text-rose-700 font-semibold shadow-xs dark:bg-rose-500/15 dark:text-rose-300"
                        : "bg-indigo-50 text-indigo-700 font-semibold shadow-xs dark:bg-indigo-500/15 dark:text-indigo-300"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-white"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                      isActive
                        ? isAdminItem
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-indigo-600 dark:text-indigo-400"
                        : "text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-slate-200"
                    }`}
                  />
                  {!collapsed && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}
                  {isActive && !collapsed && (
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isAdminItem ? "bg-rose-500 dark:bg-rose-400" : "bg-indigo-500 dark:bg-indigo-400"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User profile section */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-3">
        <div
          className={`flex items-center gap-3 rounded-xl bg-slate-100/80 p-2.5 border border-slate-200 dark:bg-slate-950/60 dark:border-slate-800 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 font-bold text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
            {(user?.username?.[0] || user?.email?.[0] || "U").toUpperCase()}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                {user?.username || user?.email?.split("@")[0] || "User"}
              </p>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] font-medium uppercase tracking-wider ${
                    user?.role === "ADMIN" ? "text-rose-600 dark:text-rose-400" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {user?.role || "USER"}
                </span>
              </div>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-rose-400 transition"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block shrink-0 border-r border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur-md transition-all duration-300 z-30 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <aside className="relative flex w-72 max-w-[80vw] flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl z-10">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
