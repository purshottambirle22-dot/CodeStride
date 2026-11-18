import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Shapes,
  Sparkles,
  Clock,
  HardDrive,
  Compass,
  AlertTriangle,
  Lightbulb,
  Search,
  Layers,
  Tag,
  ChevronRight,
} from "lucide-react";
import {
  getPatternBySlug,
  getQuestionsByPattern,
  getTopics,
} from "../api/catalog";
import { getMyProgress, toggleBookmark, toggleRevision } from "../api/progress";
import type { Pattern, Topic, Question, QuestionProgress } from "../types";
import { QuestionDetailModal } from "../components/questions/QuestionDetailModal";
import { QuestionTable } from "../components/questions/QuestionTable";
import { CardSkeleton } from "../components/common/LoadingSkeleton";
import { EmptyState } from "../components/common/EmptyState";
import { useToast } from "../context/ToastContext";

interface PatternDetailPageProps {
  slug: string;
  onNavigateBack: () => void;
  onSelectTopic: (topicSlug: string) => void;
}

export const PatternDetailPage: React.FC<PatternDetailPageProps> = ({
  slug,
  onNavigateBack,
  onSelectTopic,
}) => {
  const { showToast } = useToast();
  const [pattern, setPattern] = useState<Pattern | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [progress, setProgress] = useState<QuestionProgress[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters for questions
  const [questionSearch, setQuestionSearch] = useState<string>("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Selected question modal
  const [modalQuestion, setModalQuestion] = useState<Question | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [patData, allTopics, myProg] = await Promise.all([
        getPatternBySlug(slug),
        getTopics(),
        getMyProgress(),
      ]);

      setPattern(patData);
      setTopics(allTopics);
      setProgress(myProg);

      const qList = await getQuestionsByPattern(patData.id);
      setQuestions(qList);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load pattern details", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [slug]);

  const progressMap = new Map<string, QuestionProgress>();
  progress.forEach((p) => progressMap.set(p.questionId, p));

  const topicsMap = new Map<string, Topic>();
  topics.forEach((t) => topicsMap.set(t.id, t));

  const patternsMap = new Map<string, Pattern>();
  if (pattern) patternsMap.set(pattern.id, pattern);

  const handleToggleBookmark = async (questionId: string) => {
    try {
      const updated = await toggleBookmark(questionId);
      setProgress((prev) =>
        prev.some((p) => p.questionId === questionId)
          ? prev.map((p) => (p.questionId === questionId ? updated : p))
          : [...prev, updated]
      );
    } catch (err) {
      showToast("Failed to update bookmark", "error");
    }
  };

  const handleToggleRevision = async (questionId: string) => {
    try {
      const updated = await toggleRevision(questionId);
      setProgress((prev) =>
        prev.some((p) => p.questionId === questionId)
          ? prev.map((p) => (p.questionId === questionId ? updated : p))
          : [...prev, updated]
      );
    } catch (err) {
      showToast("Failed to update revision status", "error");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <button
          onClick={onNavigateBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Patterns
        </button>
        <div className="h-48 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (!pattern) {
    return (
      <div className="space-y-6 pb-12">
        <button
          onClick={onNavigateBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Patterns
        </button>
        <EmptyState
          icon={Shapes}
          title="Pattern not found"
          description="The requested DSA algorithmic pattern could not be found."
        />
      </div>
    );
  }

  // Filter questions for display
  const filteredQuestions = questions.filter((q) => {
    const qProgress = progressMap.get(q.id);
    const matchesSearch =
      questionSearch.trim() === "" ||
      q.title.toLowerCase().includes(questionSearch.toLowerCase());
    const matchesDifficulty =
      difficultyFilter === "ALL" || q.difficulty === difficultyFilter;

    let matchesStatus = true;
    if (statusFilter === "SOLVED") {
      matchesStatus = qProgress?.status === "SOLVED";
    } else if (statusFilter === "ATTEMPTED") {
      matchesStatus = qProgress?.status === "ATTEMPTED";
    } else if (statusFilter === "NOT_STARTED") {
      matchesStatus = !qProgress?.status || qProgress.status === null;
    }

    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  const completionPct = pattern.completionPercentage ?? 0;
  const qCount = pattern.questionCount ?? questions.length;
  const solvedCount =
    pattern.solvedCount ??
    questions.filter((q) => progressMap.get(q.id)?.status === "SOLVED").length;

  // Primary topic
  const primaryTopic = topics.find((t) => t.id === pattern.topicId);

  // Associated topics (primary + related)
  const associatedTopicIds = [
    pattern.topicId,
    ...(pattern.relatedTopicIds || []),
  ].filter(Boolean);
  const uniqueAssociatedTopics = Array.from(new Set(associatedTopicIds))
    .map((id) => topics.find((t) => t.id === id))
    .filter((t): t is Topic => Boolean(t));

  return (
    <div className="space-y-8 pb-16 transition-colors duration-200">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onNavigateBack}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Patterns
        </button>

        <div className="flex items-center gap-2">
          {primaryTopic && (
            <button
              onClick={() => onSelectTopic(primaryTopic.slug)}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-2xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <span>Topic: {primaryTopic.name}</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 text-2xs font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60">
            <Sparkles className="h-3 w-3" /> Algorithmic Pattern
          </span>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-white via-indigo-50/20 to-slate-50/60 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/20 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
                <Shapes className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {pattern.name}
                </h1>
                <p className="text-2xs font-mono text-slate-400">slug: {pattern.slug}</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {pattern.description || "Core problem-solving technique for coding interviews."}
            </p>
          </div>

          {/* Stats & Completion card */}
          <div className="flex items-center gap-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-800/50 p-5 backdrop-blur-sm shadow-2xs">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-indigo-600 transition-all duration-700 ease-out"
                  strokeDasharray={`${completionPct}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-bold text-slate-800 dark:text-white">
                {completionPct}%
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-2xs font-semibold tracking-wider text-slate-400 uppercase">Pattern Mastery</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-slate-900 dark:text-white">{solvedCount}</span>
                <span className="text-2xs text-slate-400">/ {qCount} Questions</span>
              </div>
              <div className="flex items-center gap-1.5 pt-0.5">
                {pattern.easyCount ? (
                  <span className="text-2xs text-emerald-600 dark:text-emerald-400 font-medium">
                    {pattern.easyCount}E
                  </span>
                ) : null}
                {pattern.mediumCount ? (
                  <span className="text-2xs text-amber-600 dark:text-amber-400 font-medium">
                    {pattern.mediumCount}M
                  </span>
                ) : null}
                {pattern.hardCount ? (
                  <span className="text-2xs text-rose-600 dark:text-rose-400 font-medium">
                    {pattern.hardCount}H
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION A: Pattern Introduction */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <Lightbulb className="h-4 w-4" />
            <span>Why This Pattern is Important</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {pattern.detailedExplanation ||
              pattern.description ||
              "This algorithmic pattern reduces brute-force search space into an optimal linear or logarithmic solution."}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Compass className="h-4 w-4" />
            <span>When To Use This Pattern</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {pattern.whenToUse ||
              "Use when processing sequential items, continuous subsegments, or looking for optimal subarrays/pairs without examining all permutations."}
          </p>
        </div>
      </div>

      {/* SECTION B: Pattern Recognition */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4" />
          <span>How to Recognize in Interviews & Keywords</span>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {pattern.howToRecognize ||
              "Look for keywords like: 'contiguous subarray', 'longest substring', 'minimum window', 'sorted array pairs', 'target sum'. If brute force is O(N^2) checking all segments, this pattern typically achieves O(N)."}
          </p>
        </div>
      </div>

      {/* SECTION C: Learning Approach & Complexity Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Intuition */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <Sparkles className="h-4 w-4" />
            <span>Core Intuition & Problem Solving Strategy</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {pattern.basicApproach ||
              "1. Identify the invariant.\n2. Maintain current state dynamically.\n3. Adjust boundaries when constraints are violated.\n4. Update running optimal answer."}
          </p>
        </div>

        {/* Complexity Badges */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Complexity Profile
            </h3>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <Clock className="h-4 w-4 text-indigo-500" />
                <span>Time Complexity</span>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 p-3">
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {pattern.timeComplexityOverview || "O(N) amortized"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <HardDrive className="h-4 w-4 text-emerald-500" />
                <span>Space Complexity</span>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 p-3">
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {pattern.spaceComplexityOverview || "O(1) auxiliary"}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-2xs text-slate-400">
            Optimal bounds for standard interview problem constraints.
          </div>
        </div>
      </div>

      {/* SECTION D: Related Topics */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <Tag className="h-3.5 w-3.5 text-indigo-500" />
          <span>Associated Learning Tracks & Topics</span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {uniqueAssociatedTopics.map((top) => (
            <button
              key={top.id}
              onClick={() => onSelectTopic(top.slug)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
            >
              <Layers className="h-3.5 w-3.5 text-indigo-500" />
              <span>{top.name}</span>
              <span className="text-2xs text-slate-400 font-mono">({top.slug})</span>
            </button>
          ))}
          {uniqueAssociatedTopics.length === 0 && (
            <span className="text-xs text-slate-400">General Data Structures & Algorithms</span>
          )}
        </div>
      </div>

      {/* SECTION E: Practice Questions Table */}
      <div className="space-y-4 pt-4 border-t border-slate-200/60 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Pattern Practice Questions ({filteredQuestions.length})
            </h2>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 shadow-2xs w-48"
              />
            </div>

            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="py-1.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 shadow-2xs"
            >
              <option value="ALL">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 shadow-2xs"
            >
              <option value="ALL">All Status</option>
              <option value="SOLVED">Solved</option>
              <option value="ATTEMPTED">Attempted</option>
              <option value="NOT_STARTED">Not Started</option>
            </select>
          </div>
        </div>

        <QuestionTable
          questions={filteredQuestions}
          progressMap={progressMap}
          patternsMap={patternsMap}
          topicsMap={topicsMap}
          loading={false}
          onSelectQuestion={setModalQuestion}
          onToggleBookmark={handleToggleBookmark}
          onToggleRevision={handleToggleRevision}
        />
      </div>

      {/* Modal Question Detail */}
      {modalQuestion && (
        <QuestionDetailModal
          question={modalQuestion}
          isOpen={true}
          onClose={() => setModalQuestion(null)}
          onProgressUpdated={async () => {
            const updatedProg = await getMyProgress();
            setProgress(updatedProg);
          }}
        />
      )}
    </div>
  );
};
