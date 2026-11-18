import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getQuestions, getTopics, getPatterns } from "../api/catalog";
import { getMyProgress, toggleBookmark, toggleRevision } from "../api/progress";
import type {
  Question,
  QuestionProgress,
  Topic,
  Pattern,
  Difficulty,
} from "../types";
import { QuestionTable } from "../components/questions/QuestionTable";
import { QuestionDetailModal } from "../components/questions/QuestionDetailModal";
import { useToast } from "../context/ToastContext";

interface QuestionsPageProps {
  initialTopicId?: string | null;
  initialPatternId?: string | null;
}

export const QuestionsPage: React.FC<QuestionsPageProps> = ({
  initialTopicId = null,
  initialPatternId = null,
}) => {
  const { showToast } = useToast();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [progress, setProgress] = useState<QuestionProgress[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState<string>(initialTopicId || "ALL");
  const [selectedPatternId, setSelectedPatternId] = useState<string>(initialPatternId || "ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"TITLE_ASC" | "TITLE_DESC" | "DIFF_ASC" | "DIFF_DESC">("DIFF_ASC");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Selected question modal
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      setLoading(true);
      try {
        const [qList, tList, pList, progList] = await Promise.all([
          getQuestions(),
          getTopics(),
          getPatterns(),
          getMyProgress(),
        ]);

        if (cancelled) return;
        setQuestions(qList);
        setTopics(tList);
        setPatterns(pList);
        setProgress(progList);
      } catch (err) {
        if (!cancelled) {
          showToast(err instanceof Error ? err.message : "Failed to load questions", "error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadAll();

    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const progressMap = useMemo(() => {
    const map = new Map<string, QuestionProgress>();
    progress.forEach((p) => map.set(p.questionId, p));
    return map;
  }, [progress]);

  const patternsMap = useMemo(() => {
    const map = new Map<string, Pattern>();
    patterns.forEach((p) => map.set(p.id, p));
    return map;
  }, [patterns]);

  const topicsMap = useMemo(() => {
    const map = new Map<string, Topic>();
    topics.forEach((t) => map.set(t.id, t));
    return map;
  }, [topics]);

  // Filter patterns matching selected topic
  const availablePatterns = useMemo(() => {
    if (selectedTopicId === "ALL") return patterns;
    return patterns.filter((p) => p.topicId === selectedTopicId);
  }, [patterns, selectedTopicId]);

  // Filter & Sort Logic
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // 1. Search Query
      if (search.trim()) {
        const matchTitle = q.title.toLowerCase().includes(search.toLowerCase().trim());
        if (!matchTitle) return false;
      }

      // 2. Pattern & Topic
      if (selectedPatternId !== "ALL") {
        if (q.patternId !== selectedPatternId) return false;
      } else if (selectedTopicId !== "ALL") {
        const pat = patternsMap.get(q.patternId);
        if (!pat || pat.topicId !== selectedTopicId) return false;
      }

      // 3. Difficulty
      if (selectedDifficulty !== "ALL") {
        if (q.difficulty !== selectedDifficulty) return false;
      }

      // 4. Solving Status
      if (selectedStatus !== "ALL") {
        const p = progressMap.get(q.id);
        const status = p?.status ?? "NOT_STARTED";
        if (status !== selectedStatus) return false;
      }

      return true;
    }).sort((a, b) => {
      const diffWeight: Record<Difficulty, number> = { EASY: 1, MEDIUM: 2, HARD: 3 };

      if (sortBy === "TITLE_ASC") {
        return a.title.localeCompare(b.title);
      } else if (sortBy === "TITLE_DESC") {
        return b.title.localeCompare(a.title);
      } else if (sortBy === "DIFF_ASC") {
        return diffWeight[a.difficulty] - diffWeight[b.difficulty];
      } else if (sortBy === "DIFF_DESC") {
        return diffWeight[b.difficulty] - diffWeight[a.difficulty];
      }
      return 0;
    });
  }, [
    questions,
    search,
    selectedPatternId,
    selectedTopicId,
    selectedDifficulty,
    selectedStatus,
    sortBy,
    patternsMap,
    progressMap,
  ]);

  // Pagination calculation
  const totalElements = filteredQuestions.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleClearFilters = () => {
    setSearch("");
    setSelectedTopicId("ALL");
    setSelectedPatternId("ALL");
    setSelectedDifficulty("ALL");
    setSelectedStatus("ALL");
    setSortBy("DIFF_ASC");
    setCurrentPage(1);
  };

  const handleProgressUpdated = (updated: QuestionProgress) => {
    setProgress((prev) => {
      const idx = prev.findIndex((p) => p.questionId === updated.questionId);
      if (idx === -1) return [...prev, updated];
      const copy = [...prev];
      copy[idx] = updated;
      return copy;
    });
  };

  const handleToggleBookmarkAction = async (questionId: string) => {
    try {
      const updated = await toggleBookmark(questionId);
      handleProgressUpdated(updated);
      showToast(
        updated.bookmarked ? "Problem bookmarked" : "Removed from bookmarks",
        "info"
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Bookmark update failed", "error");
    }
  };

  const handleToggleRevisionAction = async (questionId: string) => {
    try {
      const updated = await toggleRevision(questionId);
      handleProgressUpdated(updated);
      showToast(
        updated.revisionNeeded ? "Marked for revision" : "Removed from revision",
        "info"
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Revision update failed", "error");
    }
  };

  return (
    <div className="space-y-6 pb-12 transition-colors duration-200">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Explore DSA Problems
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Search, filter, and practice curated interview problems across key patterns.
        </p>
      </div>

      {/* Filter and Control Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-sm dark:shadow-none backdrop-blur-sm space-y-3">
        {/* Row 1: Search + Status pills */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter by question title..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-950/80 py-2.5 pl-10 pr-4 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-indigo-500"
            />
          </div>

          {/* Difficulty selector pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {["ALL", "EASY", "MEDIUM", "HARD"].map((diff) => (
              <button
                key={diff}
                onClick={() => {
                  setSelectedDifficulty(diff);
                  setCurrentPage(1);
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  selectedDifficulty === diff
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {diff === "ALL" ? "All Diff" : diff.charAt(0) + diff.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Dropdowns (Topic, Pattern, Status, Sort) + Clear */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-1">
          {/* Topic Dropdown */}
          <select
            value={selectedTopicId}
            onChange={(e) => {
              setSelectedTopicId(e.target.value);
              setSelectedPatternId("ALL");
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Topics</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Pattern Dropdown */}
          <select
            value={selectedPatternId}
            onChange={(e) => {
              setSelectedPatternId(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Patterns</option>
            {availablePatterns.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="SOLVED">Solved</option>
            <option value="ATTEMPTED">Attempted</option>
            <option value="NOT_STARTED">Not Started</option>
          </select>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500"
          >
            <option value="DIFF_ASC">Difficulty: Easy to Hard</option>
            <option value="DIFF_DESC">Difficulty: Hard to Easy</option>
            <option value="TITLE_ASC">Alphabetical: A → Z</option>
            <option value="TITLE_DESC">Alphabetical: Z → A</option>
          </select>

          {/* Clear button */}
          <button
            onClick={handleClearFilters}
            className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Question Table */}
      <QuestionTable
        questions={paginatedQuestions}
        progressMap={progressMap}
        topicsMap={topicsMap}
        patternsMap={patternsMap}
        loading={loading}
        onSelectQuestion={setSelectedQuestion}
        onToggleBookmark={handleToggleBookmarkAction}
        onToggleRevision={handleToggleRevisionAction}
      />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4 px-2 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} -{" "}
            {Math.min(currentPage * pageSize, totalElements)} of {totalElements} questions
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition shadow-xs"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-semibold text-slate-900 dark:text-white px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition shadow-xs"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Question Detail Modal */}
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
