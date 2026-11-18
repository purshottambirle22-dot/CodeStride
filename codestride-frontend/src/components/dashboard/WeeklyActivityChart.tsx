import React from "react";
import { BarChart3 } from "lucide-react";

interface WeeklyActivityChartProps {
  activityData?: Record<string, number>;
}

export const WeeklyActivityChart: React.FC<WeeklyActivityChartProps> = ({ activityData = {} }) => {
  const entries = Object.entries(activityData);
  const maxCount = Math.max(1, ...Object.values(activityData));

  const formatDay = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-sm dark:shadow-xl backdrop-blur-sm transition-colors duration-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Weekly Activity</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Past 7 days solving momentum</p>
          </div>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="h-36 flex items-center justify-center text-xs text-slate-400">
          No activity recorded in the past 7 days.
        </div>
      ) : (
        <div className="flex items-end justify-between gap-2 h-40 pt-6 px-2">
          {entries.map(([dateStr, count]) => {
            const heightPercent = Math.max(8, Math.round((count / maxCount) * 100));
            const hasActivity = count > 0;

            return (
              <div
                key={dateStr}
                className="group flex flex-1 flex-col items-center gap-2 h-full justify-end"
              >
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[10px] font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-sm pointer-events-none mb-1">
                  {count} solved
                </div>

                {/* Bar */}
                <div className="w-full max-w-[28px] h-24 flex items-end">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      hasActivity
                        ? "bg-gradient-to-t from-indigo-600 to-indigo-400 group-hover:from-indigo-500 group-hover:to-indigo-300 shadow-lg shadow-indigo-500/20"
                        : "bg-slate-100 group-hover:bg-slate-200 dark:bg-slate-800/80 dark:group-hover:bg-slate-700"
                    }`}
                  />
                </div>

                {/* Day label */}
                <span className="text-[11px] font-medium text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-slate-200">
                  {formatDay(dateStr)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
