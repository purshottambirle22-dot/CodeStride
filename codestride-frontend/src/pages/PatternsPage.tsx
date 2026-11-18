import React, { useState, useEffect } from "react";
import {
  Shapes,
  CheckCircle2,
  Search,
  FolderKanban,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getPatterns, getTopics } from "../api/catalog";
import type { Pattern, Topic } from "../types";
import { CardSkeleton } from "../components/common/LoadingSkeleton";
import { EmptyState } from "../components/common/EmptyState";
import { useToast } from "../context/ToastContext";

interface PatternsPageProps {
  initialTopicId?: string | null;
  onSelectPattern: (pattern: Pattern) => void;
}

type SortOption = "ORDER" | "NAME" | "COMPLETION" | "QUESTIONS";

export const PatternsPage: React.FC<PatternsPageProps> = ({
  initialTopicId = null,
  onSelectPattern,
}) => {
  const { showToast } = useToast();
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>(initialTopicId || "ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("ORDER");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 12;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      try {
        const [pList, tList] = await Promise.all([getPatterns(), getTopics()]);
        if (cancelled) return;
        setPatterns(pList);
        setTopics(tList);
      } catch (err) {
        if (!cancelled) {
          showToast(err instanceof Error ? err.message : "Failed to load patterns", "error");
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

  const topicsMap = new Map<string, Topic>();
  topics.forEach((t) => topicsMap.set(t.id, t));

  // Filter and sort patterns
  const filteredPatterns = patterns
    .filter((pat) => {
      // Topic filter: match either primary topicId or relatedTopicIds
      const matchesTopic =
        selectedTopicId === "ALL" ||
        pat.topicId === selectedTopicId ||
        (pat.relatedTopicIds && pat.relatedTopicIds.includes(selectedTopicId));

      // Search filter
      const matchesSearch =
        searchQuery.trim() === "" ||
        pat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pat.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pat.description && pat.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (pat.whenToUse && pat.whenToUse.toLowerCase().includes(searchQuery.toLowerCase()));

      // Difficulty filter: if selected, only show patterns containing at least 1 question of that difficulty
      let matchesDifficulty = true;
      if (difficultyFilter === "EASY") {
        matchesDifficulty = (pat.easyCount ?? 0) > 0;
      } else if (difficultyFilter === "MEDIUM") {
        matchesDifficulty = (pat.mediumCount ?? 0) > 0;
      } else if (difficultyFilter === "HARD") {
        matchesDifficulty = (pat.hardCount ?? 0) > 0;
      }

      return matchesTopic && matchesSearch && matchesDifficulty;
    })
    .sort((a, b) => {
      if (sortBy === "ORDER") {
        return (a.displayOrder ?? 999) - (b.displayOrder ?? 999);
      }
      if (sortBy === "NAME") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "COMPLETION") {
        return (b.completionPercentage ?? 0) - (a.completionPercentage ?? 0);
      }
      if (sortBy === "QUESTIONS") {
        return (b.questionCount ?? 0) - (a.questionCount ?? 0);
      }
      return 0;
    });

  // Pagination calculation
  const totalItems = filteredPatterns.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedPatterns = filteredPatterns.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-8 pb-16 transition-colors duration-200">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-white via-indigo-50/20 to-slate-50/60 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/20 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-2xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Algorithmic Pattern Blueprints</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              DSA Patterns Explorer
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              50+ curated interview patterns designed to help you quickly identify problem signatures, derive optimal approaches, and code bug-free solutions.
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-800/50 p-4 sm:p-5 backdrop-blur-sm shadow-2xs">
            <div className="text-center px-2">
              <span className="block text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {patterns.length}
              </span>
              <span className="text-2xs text-slate-400 font-medium">Patterns</span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="text-center px-2">
              <span className="block text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {topics.length}
              </span>
              <span className="text-2xs text-slate-400 font-medium">Tracks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar: Search, Topic Filter, Difficulty, Sort */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search patterns (e.g., Sliding Window, Two Pointers)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none focus:border-indigo-500 shadow-2xs transition"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Topic filter selector */}
          <select
            value={selectedTopicId}
            onChange={(e) => {
              setSelectedTopicId(e.target.value);
              setCurrentPage(1);
            }}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 shadow-2xs max-w-xs"
          >
            <option value="ALL">All Topics ({patterns.length} patterns)</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Difficulty filter */}
          <select
            value={difficultyFilter}
            onChange={(e) => {
              setDifficultyFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 shadow-2xs"
          >
            <option value="ALL">All Difficulties</option>
            <option value="EASY">Includes Easy</option>
            <option value="MEDIUM">Includes Medium</option>
            <option value="HARD">Includes Hard</option>
          </select>

          {/* Sorter */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 shadow-2xs"
          >
            <option value="ORDER">Catalog Order</option>
            <option value="NAME">Name (A-Z)</option>
            <option value="COMPLETION">Completion %</option>
            <option value="QUESTIONS">Question Count</option>
          </select>
        </div>
      </div>

      {/* Patterns Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : paginatedPatterns.length === 0 ? (
        <EmptyState
          icon={Shapes}
          title="No patterns found"
          description="Try adjusting your search criteria or clearing your topic filter."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedPatterns.map((pat) => {
            const topic = topicsMap.get(pat.topicId);
            const qCount = pat.questionCount ?? 0;
            const solvedCount = pat.solvedCount ?? 0;
            const pct = pat.completionPercentage ?? 0;
            const isCompleted = pct === 100;

            // Related topics chips
            const relatedTopicsList = (pat.relatedTopicIds || [])
              .map((id) => topicsMap.get(id))
              .filter((t): t is Topic => Boolean(t) && t.id !== pat.topicId);

            return (
              <div
                key={pat.id}
                onClick={() => onSelectPattern(pat)}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-600/50 hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                <div>
                  {/* Top Bar: Topic Badge and Status */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-2xs font-semibold text-indigo-600 dark:text-indigo-400">
                      <FolderKanban className="h-3 w-3" />
                      {pat.topicName || topic?.name || "General"}
                    </span>

                    {isCompleted && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-2xs font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> Solved
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    {pat.name}
                  </h3>

                  <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {pat.description || pat.whenToUse || "Core algorithmic problem-solving pattern."}
                  </p>

                  {/* Multi-topic chips */}
                  {relatedTopicsList.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {relatedTopicsList.slice(0, 2).map((rt) => (
                        <span
                          key={rt.id}
                          className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-3xs text-slate-500 dark:text-slate-400"
                        >
                          +{rt.name}
                        </span>
                      ))}
                      {relatedTopicsList.length > 2 && (
                        <span className="text-3xs text-slate-400">
                          +{relatedTopicsList.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom stats and progress bar */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                  {/* Difficulty counts */}
                  <div className="flex items-center justify-between text-2xs">
                    <div className="flex items-center gap-1.5">
                      {pat.easyCount !== undefined && pat.easyCount > 0 && (
                        <span className="rounded bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 font-medium text-emerald-600 dark:text-emerald-400">
                          {pat.easyCount} Easy
                        </span>
                      )}
                      {pat.mediumCount !== undefined && pat.mediumCount > 0 && (
                        <span className="rounded bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 font-medium text-amber-600 dark:text-amber-400">
                          {pat.mediumCount} Med
                        </span>
                      )}
                      {pat.hardCount !== undefined && pat.hardCount > 0 && (
                        <span className="rounded bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 font-medium text-rose-600 dark:text-rose-400">
                          {pat.hardCount} Hard
                        </span>
                      )}
                    </div>

                    <span className="text-slate-400">
                      {solvedCount}/{qCount}
                    </span>
                  </div>

                  {/* Visual completion progress */}
                  <div>
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
                      Explore Blueprint & Practice
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 transform group-hover:translate-x-1 transition duration-200" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 dark:border-slate-800 text-xs">
          <p className="text-slate-400">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, totalItems)} of {totalItems} patterns
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Previous
            </button>

            <span className="px-2 text-slate-500">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
