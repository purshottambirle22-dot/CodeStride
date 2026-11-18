import React from "react";
import { CheckCircle2, CircleDot, Circle } from "lucide-react";
import type { QuestionStatus } from "../../types";

interface StatusBadgeProps {
  status: QuestionStatus | string | null;
  size?: "sm" | "md";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "md" }) => {
  const normStatus = (status || "NOT_STARTED").toUpperCase();

  const config = {
    SOLVED: {
      icon: CheckCircle2,
      label: "Solved",
      className: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
    },
    ATTEMPTED: {
      icon: CircleDot,
      label: "Attempted",
      className: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
    },
    NOT_STARTED: {
      icon: Circle,
      label: "Not Started",
      className: "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/60",
    },
  }[normStatus] || {
    icon: Circle,
    label: "Not Started",
    className: "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/60",
  };

  const IconComponent = config.icon;
  const padding = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-medium";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${config.className} ${padding} transition-all`}
    >
      <IconComponent className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {config.label}
    </span>
  );
};
