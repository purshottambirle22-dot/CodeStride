import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  BookOpen,
  Shapes,
  CheckCircle2,
  FolderKanban,
  Search,
  Sparkles,
  Layers,
} from "lucide-react";
import { getTopicBySlug, getPatternsByTopic, getQuestions } from "../api/catalog";
import { getMyProgress, toggleBookmark, toggleRevision } from "../api/progress";
import type { Topic, Pattern, Question, QuestionProgress } from "../types";
import { QuestionTable } from "../components/questions/QuestionTable";
import { QuestionDetailModal } from "../components/questions/QuestionDetailModal";
import { CardSkeleton } from "../components/common/LoadingSkeleton";
import { EmptyState } from "../components/common/EmptyState";
import { useToast } from "../context/ToastContext";

interface TopicDetailPageProps {
  slug: string;
  onNavigateBack: () => void;
  onSelectPattern: (pattern: Pattern) => void;
}

export const TopicDetailPage: React.FC<TopicDetailPageProps> = ({
  slug,
  onNavigateBack,
  onSelectPattern,
}) => {
  const { showToast } = useToast();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [progress, setProgress] = useState<QuestionProgress[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filters for questions in this topic
  const [questionSearch, setQuestionSearch] = useState<string>("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Selected question modal
  const [modalQuestion, setModalQuestion] = useState<Question | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const topicData = await getTopicBySlug(slug);
      setTopic(topicData);

      const [patternsData, allQuestions, progressData] = await Promise.all([
        getPatternsByTopic(topicData.id),
        getQuestions(),
        getMyProgress(),
      ]);

      setPatterns(patternsData);
      setProgress(progressData);

      // Filter questions belonging to patterns in this topic
      const patternIdSet = new Set(patternsData.map((p) => p.id));
      const topicQuestions = allQuestions.filter((q) => patternIdSet.has(q.patternId));
      setQuestions(topicQuestions);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load topic details", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [slug]);

  const progressMap = new Map<string, QuestionProgress>();
  progress.forEach((p) => progressMap.set(p.questionId, p));

  const patternsMap = new Map<string, Pattern>();
  patterns.forEach((p) => patternsMap.set(p.id, p));

  const topicsMap = new Map<string, Topic>();
  if (topic) topicsMap.set(topic.id, topic);

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
          <ArrowLeft className="h-4 w-4" /> Back to Topics
        </button>
        <div className="h-44 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="space-y-6 pb-12">
        <button
          onClick={onNavigateBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Topics
        </button>
        <EmptyState
          icon={FolderKanban}
          title="Topic not found"
          description="The requested DSA topic could not be located."
        />
      </div>
    );
  }

  const completionPct = topic.completionPercentage ?? 0;
  const totalQ = topic.totalQuestions ?? questions.length;
  const solvedQ = topic.solvedQuestions ?? questions.filter((q) => progressMap.get(q.id)?.status === "SOLVED").length;

  return (
    <div className="space-y-8 pb-16 transition-colors duration-200">
      {/* Navigation header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onNavigateBack}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Topics
        </button>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 text-2xs font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60">
          <Sparkles className="h-3 w-3" /> Topic Track
        </span>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-white via-indigo-50/20 to-slate-50/60 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/20 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
                <FolderKanban className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {topic.name}
                </h1>
                <p className="text-2xs font-mono text-slate-400">slug: {topic.slug}</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {topic.description || "Master core problem-solving concepts and interview patterns for this topic."}
            </p>
          </div>

          {/* Completion Progress Card */}
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
              <p className="text-2xs font-semibold tracking-wider text-slate-400 uppercase">Track Mastery</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-slate-900 dark:text-white">{solvedQ}</span>
                <span className="text-2xs text-slate-400">/ {totalQ} Solved</span>
              </div>
              <p className="text-2xs text-indigo-600 dark:text-indigo-400 font-medium">
                {patterns.length} curated patterns
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Learning Overview */}
        {topic.detailedLearningDescription && (
          <div className="mt-6 pt-6 border-t border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
              <span>Learning Overview & Concept Breakdown</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {topic.detailedLearningDescription}
            </p>
          </div>
        )}
      </div>

      {/* Patterns Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shapes className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Related Patterns ({patterns.length})
            </h2>
          </div>
          <span className="text-2xs text-slate-400">Click a pattern card to deep dive</span>
        </div>

        {patterns.length === 0 ? (
          <EmptyState
            icon={Shapes}
            title="No patterns linked"
            description="Patterns associated with this topic will appear here."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {patterns.map((pat) => {
              const pCount = pat.questionCount ?? 0;
              const pSolved = pat.solvedCount ?? 0;
              const pPct = pat.completionPercentage ?? 0;

              return (
                <div
                  key={pat.id}
                  onClick={() => onSelectPattern(pat)}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-600/50 hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 text-2xs font-semibold text-indigo-600 dark:text-indigo-400 font-mono">
                        {pat.slug}
                      </span>
                      {pPct === 100 && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      {pat.name}
                    </h3>

                    <p className="text-2xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {pat.description || pat.whenToUse || "Interview pattern for algorithmic problem solving."}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
                    {/* Difficulty distribution badges */}
                    <div className="flex items-center gap-1.5 text-2xs">
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

                    {/* Progress bar */}
                    <div>
                      <div className="flex items-center justify-between text-2xs text-slate-400 mb-1">
                        <span>{pSolved} of {pCount} Solved</span>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">{pPct}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 transition-all duration-500"
                          style={{ width: `${pPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Practice Questions Section */}
      <div className="space-y-4 pt-4 border-t border-slate-200/60 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Topic Practice Questions ({filteredQuestions.length})
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
