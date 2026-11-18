import React from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/40 p-12 text-center transition-colors">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/80 text-indigo-600 dark:text-indigo-400 shadow-sm dark:shadow-inner">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all duration-200 hover:bg-indigo-500 hover:shadow-indigo-500/35 active:scale-95"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
