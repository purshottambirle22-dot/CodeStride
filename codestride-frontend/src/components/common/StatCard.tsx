import React from "react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: string;
  trendUp?: boolean;
  colorScheme?: "indigo" | "emerald" | "amber" | "purple" | "cyan";
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  subtitle,
  trend,
  trendUp,
  colorScheme = "indigo",
}) => {
  const colorMap = {
    indigo: {
      bg: "bg-indigo-500/10",
      text: "text-indigo-400",
      border: "border-indigo-500/20",
      glow: "group-hover:border-indigo-500/40",
    },
    emerald: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
      glow: "group-hover:border-emerald-500/40",
    },
    amber: {
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/20",
      glow: "group-hover:border-amber-500/40",
    },
    purple: {
      bg: "bg-purple-500/10",
      text: "text-purple-400",
      border: "border-purple-500/20",
      glow: "group-hover:border-purple-500/40",
    },
    cyan: {
      bg: "bg-cyan-500/10",
      text: "text-cyan-400",
      border: "border-cyan-500/20",
      glow: "group-hover:border-cyan-500/40",
    },
  }[colorScheme];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/80 p-5 backdrop-blur-sm shadow-xs dark:shadow-none transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/30 ${colorMap.glow}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${colorMap.border} ${colorMap.bg} ${colorMap.text} transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-medium ${
              trendUp ? "text-emerald-500 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      )}
    </div>
  );
};
