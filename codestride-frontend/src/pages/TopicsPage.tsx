import React, { useState, useEffect } from "react";
import {
  FolderKanban,
  ArrowRight,
  Search,
  Sparkles,
  Layers,
  Shapes,
  SlidersHorizontal,
  Check,
} from "lucide-react";
import { getTopics } from "../api/catalog";
import type { Topic } from "../types";
import { CardSkeleton } from "../components/common/LoadingSkeleton";
import { EmptyState } from "../components/common/EmptyState";
import { useToast } from "../context/ToastContext";

interface TopicsPageProps {
  onSelectTopic: (topic: Topic) => void;
}

type FilterStatus = "ALL" | "IN_PROGRESS" | "COMPLETED" | "NOT_STARTED";
type SortOption = "ORDER" | "NAME" | "PROGRESS" | "QUESTIONS";

export const TopicsPage: React.FC<TopicsPageProps> = ({ onSelectTopic }) => {
  const { showToast } = useToast();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  // Search, filter, and sort
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("ORDER");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      try {
        const tList = await getTopics();
        if (cancelled) return;
        setTopics(tList);
      } catch (err) {
        if (!cancelled) {
          showToast(err instanceof Error ? err.message : "Failed to load topics", "error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [showToast]);

  // Filter and sort topics
  const filteredAndSortedTopics = topics
    .filter((topic) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (topic.description &&
          topic.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const pct = topic.completionPercentage ?? 0;
      let matchesStatus = true;
      if (statusFilter === "COMPLETED") {
        matchesStatus = pct === 100;
      } else if (statusFilter === "IN_PROGRESS") {
        matchesStatus = pct > 0 && pct < 100;
      } else if (statusFilter === "NOT_STARTED") {
        matchesStatus = pct === 0;
      }

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "ORDER") {
        return (a.displayOrder ?? 999) - (b.displayOrder ?? 999);
      }
      if (sortBy === "NAME") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "PROGRESS") {
        return (b.completionPercentage ?? 0) - (a.completionPercentage ?? 0);
      }
      if (sortBy === "QUESTIONS") {
        return (b.totalQuestions ?? 0) - (a.totalQuestions ?? 0);
      }
      return 0;
    });

  // Derived global stats across topics
  const totalQuestionsSum = topics.reduce((acc, t) => acc + (t.totalQuestions ?? 0), 0);
  const totalSolvedSum = topics.reduce((acc, t) => acc + (t.solvedQuestions ?? 0), 0);
  const totalPatternsSum = topics.reduce((acc, t) => acc + (t.totalPatterns ?? 0), 0);

  return (
    <div className="space-y-8 pb-16 transition-colors duration-200">
      {/* Page Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-white via-indigo-50/20 to-slate-50/60 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/20 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-2xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>DSA Learning Roadmaps</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Data Structures & Algorithm Topics
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Curated topic tracks covering essential core DSA concepts, patterns, and high-frequency interview questions.
            </p>
          </div>

          {/* Quick Stats overview */}
          <div className="flex items-center gap-3 sm:gap-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-800/50 p-4 sm:p-5 backdrop-blur-sm shadow-2xs">
            <div className="text-center px-2">
              <span className="block text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {topics.length}
              </span>
              <span className="text-2xs text-slate-400 font-medium">Topics</span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="text-center px-2">
              <span className="block text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {totalPatternsSum}
              </span>
              <span className="text-2xs text-slate-400 font-medium">Patterns</span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="text-center px-2">
              <span className="block text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {totalSolvedSum}/{totalQuestionsSum}
              </span>
              <span className="text-2xs text-slate-400 font-medium">Solved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters, Sorters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search topics by name, concept or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none focus:border-indigo-500 shadow-2xs transition"
          />
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status filter */}
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-2xs text-2xs">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                statusFilter === "ALL"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All ({topics.length})
            </button>
            <button
              onClick={() => setStatusFilter("IN_PROGRESS")}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                statusFilter === "IN_PROGRESS"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setStatusFilter("COMPLETED")}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                statusFilter === "COMPLETED"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Completed
            </button>
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="py-1.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 shadow-2xs"
            >
              <option value="ORDER">Roadmap Order</option>
              <option value="NAME">Name (A-Z)</option>
              <option value="PROGRESS">Completion %</option>
              <option value="QUESTIONS">Total Questions</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Topic Cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filteredAndSortedTopics.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No topics match your filter"
          description="Try adjusting your search query or status filter to see topics."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedTopics.map((topic) => {
            const patCount = topic.totalPatterns ?? 0;
            const qTotal = topic.totalQuestions ?? 0;
            const qSolved = topic.solvedQuestions ?? 0;
            const pct = topic.completionPercentage ?? 0;
            const isFinished = pct === 100;

            return (
              <div
                key={topic.id}
                onClick={() => onSelectTopic(topic)}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-600/50 hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                <div>
                  {/* Top line with Icon and Slug */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition duration-200">
                      <FolderKanban className="h-5 w-5" />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-2xs font-mono text-slate-500 dark:text-slate-400">
                        #{topic.displayOrder ?? 0}
                      </span>
                      {isFinished && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-2xs font-medium text-emerald-600 dark:text-emerald-400">
                          <Check className="h-3 w-3" /> Done
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    {topic.name}
                  </h3>

                  <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {topic.description || "Master core algorithms and problem-solving patterns."}
                  </p>
                </div>

                {/* Bottom stats and progress */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-2xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Shapes className="h-3 w-3 text-indigo-500" />
                      {patCount} Patterns
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Layers className="h-3 w-3 text-emerald-500" />
                      {qSolved} / {qTotal} Solved
                    </span>
                  </div>

                  {/* Visual Progress bar */}
                  <div>
                    <div className="flex items-center justify-between text-2xs mb-1">
                      <span className="text-slate-400">Completion</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Link */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-2xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                      Explore Topic Track
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 transform group-hover:translate-x-1 transition duration-200" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
