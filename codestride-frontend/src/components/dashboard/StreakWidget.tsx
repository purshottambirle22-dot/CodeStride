import React from "react";
import { Flame, Target } from "lucide-react";

interface StreakWidgetProps {
  currentStreak: number;
  todaySolved: number;
  dailyGoal?: number;
}

export const StreakWidget: React.FC<StreakWidgetProps> = ({
  currentStreak,
  todaySolved,
  dailyGoal = 2,
}) => {
  const goalProgress = Math.min(100, Math.round((todaySolved / dailyGoal) * 100));

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900/60 p-6 shadow-sm dark:shadow-xl backdrop-blur-sm transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-500 dark:text-amber-400">
            <Flame className="h-5 w-5 fill-amber-400 text-amber-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Daily Streak</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Consistent practice</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black text-amber-500 dark:text-amber-400">{currentStreak}</span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">
            {currentStreak === 1 ? "day" : "days"}
          </span>
        </div>
      </div>

      <div className="mt-6 border-t border-slate-200 dark:border-slate-800/80 pt-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
            <Target className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
            Today's Target
          </span>
          <span className="font-semibold text-slate-900 dark:text-white">
            {todaySolved} / {dailyGoal} solved
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-500"
            style={{ width: `${goalProgress}%` }}
          />
        </div>

        <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
          {todaySolved >= dailyGoal
            ? "🎉 Daily goal crushed! Keep pushing your limits."
            : `${dailyGoal - todaySolved} more problem to achieve your daily target.`}
        </p>
      </div>
    </div>
  );
};
