import React from "react";

export const StatSkeleton: React.FC = () => (
  <div className="animate-pulse rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
    </div>
    <div className="mt-4 h-8 w-16 rounded bg-slate-200 dark:bg-slate-800" />
    <div className="mt-2 h-3 w-32 rounded bg-slate-100 dark:bg-slate-800/60" />
  </div>
);

export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 5 }) => (
  <tr className="animate-pulse border-b border-slate-200 dark:border-slate-800/80">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="p-4">
        <div
          className="h-4 rounded bg-slate-200 dark:bg-slate-800"
          style={{ width: `${Math.max(40, 90 - (i % 3) * 20)}%` }}
        />
      </td>
    ))}
  </tr>
);

export const CardSkeleton: React.FC = () => (
  <div className="animate-pulse rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <div className="h-5 w-36 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
    </div>
    <div className="mt-3 h-4 w-full rounded bg-slate-100 dark:bg-slate-800/60" />
    <div className="mt-2 h-4 w-3/4 rounded bg-slate-100 dark:bg-slate-800/60" />
    <div className="mt-6 flex items-center justify-between border-t border-slate-200 dark:border-slate-800/60 pt-4">
      <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-800" />
    </div>
  </div>
);
