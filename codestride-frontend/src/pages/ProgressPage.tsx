import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  CircleDot,
  Zap,
  Target,
} from "lucide-react";
import { getMyProgress } from "../api/progress";
import { getQuestions, getTopics, getPatterns } from "../api/catalog";
import { getMyDashboard } from "../api/dashboard";
import type {
  QuestionProgress,
  Question,
  Topic,
  Pattern,
  DashboardData,
} from "../types";
import { StatCard } from "../components/common/StatCard";
import { DifficultyBadge } from "../components/common/DifficultyBadge";
import { useToast } from "../context/ToastContext";

export const ProgressPage: React.FC = () => {
  const { showToast } = useToast();
  const [progress, setProgress] = useState<QuestionProgress[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [progList, qList, tList, pList, dashData] = await Promise.all([
          getMyProgress(),
          getQuestions(),
          getTopics(),
          getPatterns(),
          getMyDashboard().catch(() => null),
        ]);

        if (cancelled) return;
        setProgress(progList);
        setQuestions(qList);
        setTopics(tList);
        setPatterns(pList);
        setDashboard(dashData);
      } catch (err) {
        if (!cancelled) {
          showToast(err instanceof Error ? err.message : "Failed to load progress analytics", "error");
        }
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const progressMap = new Map<string, QuestionProgress>();
  progress.forEach((p) => progressMap.set(p.questionId, p));

  const questionsMap = new Map<string, Question>();
  questions.forEach((q) => questionsMap.set(q.id, q));

  const patternsMap = new Map<string, Pattern>();
  patterns.forEach((pat) => patternsMap.set(pat.id, pat));

  const totalQuestions = questions.length;
  const solvedList = progress.filter((p) => p.status === "SOLVED");
  const attemptedList = progress.filter((p) => p.status === "ATTEMPTED");

  const solvedCount = solvedList.length;
  const attemptedCount = attemptedList.length;
  const remainingCount = Math.max(0, totalQuestions - solvedCount);
  const totalPoints = dashboard?.totalPoints ?? dashboard?.points?.totalPoints ?? 0;
  const completionPercentage = totalQuestions === 0 ? 0 : Math.round((solvedCount / totalQuestions) * 100);

  // Difficulty breakdowns
  const easyQuestions = questions.filter((q) => q.difficulty === "EASY");
  const medQuestions = questions.filter((q) => q.difficulty === "MEDIUM");
  const hardQuestions = questions.filter((q) => q.difficulty === "HARD");

  const easySolved = easyQuestions.filter((q) => progressMap.get(q.id)?.status === "SOLVED").length;
  const medSolved = medQuestions.filter((q) => progressMap.get(q.id)?.status === "SOLVED").length;
  const hardSolved = hardQuestions.filter((q) => progressMap.get(q.id)?.status === "SOLVED").length;

  // Recent activity timeline
  const recentActivity = [...progress]
    .filter((p) => p.updatedAt)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8);

  return (
    <div className="space-y-8 pb-12 transition-colors duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          My Progress Analytics
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          In-depth breakdown of your problem-solving accuracy, topic coverage, and milestones.
        </p>
      </div>

      {/* Primary KPI Metrics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Solved"
          value={solvedCount}
          icon={CheckCircle2}
          subtitle={`${completionPercentage}% of platform`}
          colorScheme="emerald"
        />
        <StatCard
          label="Attempted"
          value={attemptedCount}
          icon={CircleDot}
          subtitle="Work in progress"
          colorScheme="amber"
        />
        <StatCard
          label="Remaining"
          value={remainingCount}
          icon={Target}
          subtitle="Unsolved problems"
          colorScheme="cyan"
        />
        <StatCard
          label="Total Points"
          value={totalPoints}
          icon={Zap}
          subtitle="Platform achievement score"
          colorScheme="indigo"
        />
      </section>

      {/* Difficulty Breakdown & Overall Progress Bar */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Completion Ring / Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm dark:shadow-xl backdrop-blur-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Overall Progress</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Overall syllabus mastery</p>
          </div>

          <div className="my-6 flex flex-col items-center justify-center">
            <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-8 border-slate-200 dark:border-slate-800">
              <div
                className="absolute inset-0 rounded-full border-8 border-indigo-500 transition-all duration-700"
                style={{
                  clipPath: `polygon(50% 50%, -50% -50%, ${completionPercentage * 3.6}% -50%)`,
                }}
              />
              <div className="text-center">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {completionPercentage}%
                </span>
                <span className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                  Completed
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/80 pt-3">
            <span>{solvedCount} Solved</span>
            <span>{remainingCount} Remaining</span>
          </div>
        </div>

        {/* Detailed Difficulty Levels */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm dark:shadow-xl backdrop-blur-sm space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Difficulty Mastery</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Balanced problem solving ensures readiness across screening and technical rounds
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {/* Easy */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                  Easy
                </span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {easySolved} / {easyQuestions.length} ({easyQuestions.length === 0 ? 0 : Math.round((easySolved / easyQuestions.length) * 100)}%)
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-500"
                  style={{
                    width: `${easyQuestions.length === 0 ? 0 : (easySolved / easyQuestions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Medium */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500 dark:bg-amber-400" />
                  Medium
                </span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {medSolved} / {medQuestions.length} ({medQuestions.length === 0 ? 0 : Math.round((medSolved / medQuestions.length) * 100)}%)
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-amber-500 dark:bg-amber-400 transition-all duration-500"
                  style={{
                    width: `${medQuestions.length === 0 ? 0 : (medSolved / medQuestions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Hard */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500 dark:bg-rose-400" />
                  Hard
                </span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {hardSolved} / {hardQuestions.length} ({hardQuestions.length === 0 ? 0 : Math.round((hardSolved / hardQuestions.length) * 100)}%)
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-rose-500 dark:bg-rose-400 transition-all duration-500"
                  style={{
                    width: `${hardQuestions.length === 0 ? 0 : (hardSolved / hardQuestions.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Topic-Wise Performance */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm dark:shadow-xl backdrop-blur-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Topic-Wise Performance</h3>
        <div className="space-y-3">
          {topics.map((t) => {
            const topicQs = questions.filter((q) => {
              const pat = patternsMap.get(q.patternId);
              return pat?.topicId === t.id;
            });
            const tTotal = topicQs.length;
            const tSolved = topicQs.filter((q) => progressMap.get(q.id)?.status === "SOLVED").length;
            const tPercent = tTotal === 0 ? 0 : Math.round((tSolved / tTotal) * 100);

            return (
              <div key={t.id} className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">{t.name}</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {tSolved} / {tTotal} solved ({tPercent}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${tPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Activity Timeline */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm dark:shadow-xl backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Solving Activity</h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">Real-time attempt logs</span>
        </div>

        {recentActivity.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No solving activity recorded yet. Start practicing to generate your timeline!
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {recentActivity.map((item) => {
              const q = questionsMap.get(item.questionId);
              const dateStr = item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "";

              return (
                <div key={item.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        item.status === "SOLVED"
                          ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400"
                          : "bg-amber-500/10 text-amber-500 dark:text-amber-400"
                      }`}
                    >
                      {item.status === "SOLVED" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <CircleDot className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {q?.title || "Problem " + item.questionId}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.status === "SOLVED" ? "Successfully solved" : "Attempted problem"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {q?.difficulty && <DifficultyBadge difficulty={q.difficulty} size="sm" />}
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      {dateStr}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
