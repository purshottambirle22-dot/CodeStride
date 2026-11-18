import React from "react";
import type { Difficulty } from "../../types";

interface DifficultyBadgeProps {
  difficulty: Difficulty | string;
  size?: "sm" | "md";
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ difficulty, size = "md" }) => {
  const diffUpper = (difficulty || "EASY").toUpperCase();

  const styles = {
    EASY: {
      bg: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25",
      dot: "bg-emerald-500 dark:bg-emerald-400",
      label: "Easy",
    },
    MEDIUM: {
      bg: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/25",
      dot: "bg-amber-500 dark:bg-amber-400",
      label: "Medium",
    },
    HARD: {
      bg: "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/25",
      dot: "bg-rose-500 dark:bg-rose-400",
      label: "Hard",
    },
  }[diffUpper] || {
    bg: "bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-500/25",
    dot: "bg-slate-500 dark:bg-slate-400",
    label: difficulty,
  };

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-semibold";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${styles.bg} ${sizeClasses} tracking-wide transition-colors duration-150`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
      {styles.label}
    </span>
  );
};
