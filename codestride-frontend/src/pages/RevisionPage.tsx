import React, { useState, useEffect, useMemo } from "react";
import { History, Search } from "lucide-react";
import { getRevisions, toggleRevision } from "../api/progress";
import { getQuestions, getTopics, getPatterns } from "../api/catalog";
import type { QuestionProgress, Question, Topic, Pattern } from "../types";
import { QuestionTable } from "../components/questions/QuestionTable";
import { QuestionDetailModal } from "../components/questions/QuestionDetailModal";
import { EmptyState } from "../components/common/EmptyState";
import { CardSkeleton } from "../components/common/LoadingSkeleton";
import { useToast } from "../context/ToastContext";

interface RevisionPageProps {
  onExploreQuestions: () => void;
}

export const RevisionPage: React.FC<RevisionPageProps> = ({ onExploreQuestions }) => {
  const { showToast } = useToast();
  const [revisions, setRevisions] = useState<QuestionProgress[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      try {
        const [rList, qList, tList, pList] = await Promise.all([
          getRevisions(),
          getQuestions(),
          getTopics(),
          getPatterns(),
        ]);

        if (cancelled) return;
        setRevisions(rList);
        setQuestions(qList);
        setTopics(tList);
        setPatterns(pList);
      } catch (err) {
        if (!cancelled) {
          showToast(err instanceof Error ? err.message : "Failed to load revision list", "error");
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

  const progressMap = useMemo(() => {
    const map = new Map<string, QuestionProgress>();
    revisions.forEach((r) => map.set(r.questionId, r));
    return map;
  }, [revisions]);

  const questionsMap = useMemo(() => {
    const map = new Map<string, Question>();
    questions.forEach((q) => map.set(q.id, q));
    return map;
  }, [questions]);

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

  // Questions marked for revision
  const revisionQuestions = useMemo(() => {
    return revisions
      .map((r) => questionsMap.get(r.questionId))
      .filter((q): q is Question => q !== undefined)
      .filter((q) => {
        if (difficultyFilter !== "ALL" && q.difficulty !== difficultyFilter) return false;
        if (!search.trim()) return true;
        return q.title.toLowerCase().includes(search.toLowerCase().trim());
      });
  }, [revisions, questionsMap, search, difficultyFilter]);

  const handleToggleRevision = async (questionId: string) => {
    try {
      const updated = await toggleRevision(questionId);
      if (!updated.revisionNeeded) {
        setRevisions((prev) => prev.filter((r) => r.questionId !== questionId));
        showToast("Marked as reviewed and removed from revision queue", "success");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update revision", "error");
    }
  };

  const handleProgressUpdated = (updated: QuestionProgress) => {
    setRevisions((prev) => {
      if (!updated.revisionNeeded) {
        return prev.filter((r) => r.questionId !== updated.questionId);
      }
      const idx = prev.findIndex((r) => r.questionId === updated.questionId);
      if (idx === -1) return [...prev, updated];
      const copy = [...prev];
      copy[idx] = updated;
      return copy;
    });
  };

  return (
    <div className="space-y-6 pb-12 transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Revision Queue</h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Re-solve tough problems and reinforce pattern recognition before interviews.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Difficulty pills */}
          <div className="flex items-center gap-1">
            {["ALL", "EASY", "MEDIUM", "HARD"].map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  difficultyFilter === diff
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {diff === "ALL" ? "All" : diff.charAt(0) + diff.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search revision..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1.5 pl-8 pr-3 text-xs text-slate-900 dark:text-slate-200 outline-none focus:border-indigo-500 shadow-xs"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          <CardSkeleton />
        </div>
      ) : revisionQuestions.length === 0 ? (
        <EmptyState
          icon={History}
          title="Revision queue is empty"
          description="Flag tricky or high-frequency problems during your practice sessions to review them here."
          actionText="Practice Problems"
          onAction={onExploreQuestions}
        />
      ) : (
        <QuestionTable
          questions={revisionQuestions}
          progressMap={progressMap}
          topicsMap={topicsMap}
          patternsMap={patternsMap}
          loading={false}
          onSelectQuestion={setSelectedQuestion}
          onToggleRevision={handleToggleRevision}
        />
      )}

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
