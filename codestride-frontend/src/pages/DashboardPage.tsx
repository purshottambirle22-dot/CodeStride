import React, { useState, useEffect } from "react";
import {
  Zap,
  CheckCircle2,
  CircleDot,
  Trophy,
  ArrowRight,
  Compass,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getMyDashboard } from "../api/dashboard";
import { getQuestions } from "../api/catalog";
import { getTopics } from "../api/catalog";
import { getPatterns } from "../api/catalog";
import { getMyProgress } from "../api/progress";
import type {
  DashboardData,
  Question,
  QuestionProgress,
  Topic,
  Pattern,
} from "../types";
import { StatCard } from "../components/common/StatCard";
import { StatSkeleton } from "../components/common/LoadingSkeleton";
import { StreakWidget } from "../components/dashboard/StreakWidget";
import { WeeklyActivityChart } from "../components/dashboard/WeeklyActivityChart";
import { TopicProgressGrid } from "../components/dashboard/TopicProgressGrid";
import { QuestionTable } from "../components/questions/QuestionTable";
import { QuestionDetailModal } from "../components/questions/QuestionDetailModal";
import type { NavItemKey } from "../components/common/AppSidebar";

interface DashboardPageProps {
  onNavigate: (tab: NavItemKey) => void;
  onSelectTopicForDrilldown: (topic: Topic) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onSelectTopicForDrilldown,
}) => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [progress, setProgress] = useState<QuestionProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected question modal
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [dashData, qList, tList, pList, progList] = await Promise.all([
          getMyDashboard().catch(() => null),
          getQuestions().catch(() => []),
          getTopics().catch(() => []),
          getPatterns().catch(() => []),
          getMyProgress().catch(() => []),
        ]);

        if (cancelled) return;
        setDashboard(dashData);
        setQuestions(qList);
        setTopics(tList);
        setPatterns(pList);
        setProgress(progList);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard data");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const progressMap = new Map<string, QuestionProgress>();
  progress.forEach((p) => progressMap.set(p.questionId, p));

  const patternsMap = new Map<string, Pattern>();
  patterns.forEach((pat) => patternsMap.set(pat.id, pat));

  const topicsMap = new Map<string, Topic>();
  topics.forEach((top) => topicsMap.set(top.id, top));

  const totalPoints = dashboard?.totalPoints ?? dashboard?.points?.totalPoints ?? 0;
  const solvedCount = dashboard?.solvedQuestions ?? dashboard?.points?.solvedQuestions ?? progress.filter((p) => p.status === "SOLVED").length;
  const attemptedCount = dashboard?.attemptedQuestions ?? dashboard?.points?.attemptedQuestions ?? progress.filter((p) => p.status === "ATTEMPTED").length;
  const rank = dashboard?.leaderboardRank ?? dashboard?.leaderboard?.rank;
  const globalRank = rank != null ? `#${rank}` : "Unranked";

  const totalQuestions = questions.length;
  const completionPercent = totalQuestions === 0 ? 0 : Math.round((solvedCount / totalQuestions) * 100);

  // Easy / Medium / Hard counts
  const easySolved = dashboard?.easySolved ?? questions.filter((q) => q.difficulty === "EASY" && progressMap.get(q.id)?.status === "SOLVED").length;
  const mediumSolved = dashboard?.mediumSolved ?? questions.filter((q) => q.difficulty === "MEDIUM" && progressMap.get(q.id)?.status === "SOLVED").length;
  const hardSolved = dashboard?.hardSolved ?? questions.filter((q) => q.difficulty === "HARD" && progressMap.get(q.id)?.status === "SOLVED").length;

  const totalEasy = questions.filter((q) => q.difficulty === "EASY").length;
  const totalMed = questions.filter((q) => q.difficulty === "MEDIUM").length;
  const totalHard = questions.filter((q) => q.difficulty === "HARD").length;

  // Recently attempted & Suggested questions
  const attemptedQuestions = questions.filter(
    (q) => progressMap.get(q.id)?.status === "ATTEMPTED"
  ).slice(0, 4);

  const unsolvedQuestions = questions.filter(
    (q) => !progressMap.get(q.id)?.status
  ).slice(0, 4);

  const continuePracticingList = attemptedQuestions.length > 0 ? attemptedQuestions : unsolvedQuestions;

  const handleProgressUpdated = (updated: QuestionProgress) => {
    setProgress((prev) => {
      const idx = prev.findIndex((p) => p.questionId === updated.questionId);
      if (idx === -1) return [...prev, updated];
      const copy = [...prev];
      copy[idx] = updated;
      return copy;
    });
  };

  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8 pb-12 transition-colors duration-200">
      {/* 1. Welcome Section */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 p-6 md:p-8 shadow-sm dark:shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              {todayFormatted}
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Welcome back, {user?.username || user?.email?.split("@")[0] || "Strider"}!
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
              Every solved problem sharpens your algorithmic instincts. Stay persistent, master patterns, and build unstoppable momentum.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate("Questions")}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all duration-200 hover:bg-indigo-500 hover:shadow-indigo-500/40 active:scale-95"
            >
              <Compass className="h-4 w-4" />
              Continue Practice
            </button>
            <button
              onClick={() => onNavigate("Leaderboard")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition shadow-xs"
            >
              <Trophy className="h-4 w-4 text-amber-500 dark:text-amber-400" />
              Leaderboard
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-600 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* 2. Core Statistics Grid */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <StatCard
              label="Total Points"
              value={totalPoints}
              icon={Zap}
              subtitle="Scored via solved challenges"
              colorScheme="indigo"
            />
            <StatCard
              label="Solved Questions"
              value={solvedCount}
              icon={CheckCircle2}
              subtitle={`${completionPercent}% total completion`}
              colorScheme="emerald"
            />
            <StatCard
              label="Attempted"
              value={attemptedCount}
              icon={CircleDot}
              subtitle="Active problem solving"
              colorScheme="amber"
            />
            <StatCard
              label="Global Rank"
              value={globalRank}
              icon={Trophy}
              subtitle="Competitive leaderboard"
              colorScheme="purple"
            />
          </>
        )}
      </section>

      {/* 3. Momentum & Activity Analytics */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Streak & Daily Target Widget */}
        <div className="lg:col-span-1">
          <StreakWidget
            currentStreak={dashboard?.currentStreak ?? 0}
            todaySolved={dashboard?.todaySolved ?? 0}
            dailyGoal={2}
          />
        </div>

        {/* Weekly Activity Chart */}
        <div className="lg:col-span-2">
          <WeeklyActivityChart activityData={dashboard?.weeklyActivity} />
        </div>
      </section>

      {/* 4. Difficulty Breakdown Card */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm dark:shadow-xl backdrop-blur-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Difficulty Distribution</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Easy */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-500/5 p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span>Easy</span>
              <span>
                {easySolved} / {totalEasy}
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-500"
                style={{
                  width: `${totalEasy === 0 ? 0 : Math.round((easySolved / totalEasy) * 100)}%`,
                }}
              />
            </div>
            <span className="mt-2 block text-[10px] text-slate-500 dark:text-slate-400">
              {totalEasy === 0 ? "0%" : `${Math.round((easySolved / totalEasy) * 100)}% completed`}
            </span>
          </div>

          {/* Medium */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-50/60 dark:bg-amber-500/5 p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400">
              <span>Medium</span>
              <span>
                {mediumSolved} / {totalMed}
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-amber-500 dark:bg-amber-400 transition-all duration-500"
                style={{
                  width: `${totalMed === 0 ? 0 : Math.round((mediumSolved / totalMed) * 100)}%`,
                }}
              />
            </div>
            <span className="mt-2 block text-[10px] text-slate-500 dark:text-slate-400">
              {totalMed === 0 ? "0%" : `${Math.round((mediumSolved / totalMed) * 100)}% completed`}
            </span>
          </div>

          {/* Hard */}
          <div className="rounded-xl border border-rose-500/20 bg-rose-50/60 dark:bg-rose-500/5 p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-rose-600 dark:text-rose-400">
              <span>Hard</span>
              <span>
                {hardSolved} / {totalHard}
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-rose-500 dark:bg-rose-400 transition-all duration-500"
                style={{
                  width: `${totalHard === 0 ? 0 : Math.round((hardSolved / totalHard) * 100)}%`,
                }}
              />
            </div>
            <span className="mt-2 block text-[10px] text-slate-500 dark:text-slate-400">
              {totalHard === 0 ? "0%" : `${Math.round((hardSolved / totalHard) * 100)}% completed`}
            </span>
          </div>
        </div>
      </section>

      {/* 5. Continue Practicing / Recommended Problems */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Continue Practicing</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pick up where you left off or tackle recommended challenges
            </p>
          </div>
          <button
            onClick={() => onNavigate("Questions")}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition"
          >
            All Questions <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <QuestionTable
          questions={continuePracticingList}
          progressMap={progressMap}
          patternsMap={patternsMap}
          topicsMap={topicsMap}
          loading={loading}
          onSelectQuestion={setSelectedQuestion}
        />
      </section>

      {/* 6. Topic Progress Overview */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Topic Mastery</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Explore standard algorithmic paradigms and track pattern proficiency
            </p>
          </div>
          <button
            onClick={() => onNavigate("Topics")}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition"
          >
            Explore All Topics <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <TopicProgressGrid
          topics={topics}
          questions={questions}
          progressMap={progressMap}
          patternsMap={patternsMap}
          onSelectTopic={(t) => onSelectTopicForDrilldown(t)}
        />
      </section>

      {/* Question Details Modal */}
      {selectedQuestion && (
        <QuestionDetailModal
          question={selectedQuestion}
          progress={progressMap.get(selectedQuestion.id)}
          topic={
            patternsMap.get(selectedQuestion.patternId)
              ? topicsMap.get(patternsMap.get(selectedQuestion.patternId)!.topicId)
              : undefined
          }
          pattern={patternsMap.get(selectedQuestion.patternId)}
          isOpen={true}
          onClose={() => setSelectedQuestion(null)}
          onProgressUpdated={handleProgressUpdated}
        />
      )}
    </div>
  );
};
