import React, { useState, useEffect, useMemo } from "react";
import { Bookmark, Search } from "lucide-react";
import { getBookmarks, toggleBookmark } from "../api/progress";
import { getQuestions, getTopics, getPatterns } from "../api/catalog";
import type { QuestionProgress, Question, Topic, Pattern } from "../types";
import { QuestionTable } from "../components/questions/QuestionTable";
import { QuestionDetailModal } from "../components/questions/QuestionDetailModal";
import { EmptyState } from "../components/common/EmptyState";
import { CardSkeleton } from "../components/common/LoadingSkeleton";
import { useToast } from "../context/ToastContext";

interface BookmarksPageProps {
  onExploreQuestions: () => void;
}

export const BookmarksPage: React.FC<BookmarksPageProps> = ({ onExploreQuestions }) => {
  const { showToast } = useToast();
  const [bookmarks, setBookmarks] = useState<QuestionProgress[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      try {
        const [bList, qList, tList, pList] = await Promise.all([
          getBookmarks(),
          getQuestions(),
          getTopics(),
          getPatterns(),
        ]);

        if (cancelled) return;
        setBookmarks(bList);
        setQuestions(qList);
        setTopics(tList);
        setPatterns(pList);
      } catch (err) {
        if (!cancelled) {
          showToast(err instanceof Error ? err.message : "Failed to load bookmarks", "error");
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
    bookmarks.forEach((b) => map.set(b.questionId, b));
    return map;
  }, [bookmarks]);

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

  // Questions that are bookmarked
  const bookmarkedQuestions = useMemo(() => {
    return bookmarks
      .map((b) => questionsMap.get(b.questionId))
      .filter((q): q is Question => q !== undefined)
      .filter((q) => {
        if (!search.trim()) return true;
        return q.title.toLowerCase().includes(search.toLowerCase().trim());
      });
  }, [bookmarks, questionsMap, search]);

  const handleToggleBookmark = async (questionId: string) => {
    try {
      const updated = await toggleBookmark(questionId);
      if (!updated.bookmarked) {
        setBookmarks((prev) => prev.filter((b) => b.questionId !== questionId));
        showToast("Bookmark removed", "info");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update bookmark", "error");
    }
  };

  const handleProgressUpdated = (updated: QuestionProgress) => {
    setBookmarks((prev) => {
      if (!updated.bookmarked) {
        return prev.filter((b) => b.questionId !== updated.questionId);
      }
      const idx = prev.findIndex((b) => b.questionId === updated.questionId);
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Bookmarked Questions</h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Saved problems for quick reference, in-depth review, and ongoing practice.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved problems..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 pl-9 pr-4 text-xs text-slate-900 dark:text-slate-200 outline-none focus:border-indigo-500 shadow-xs"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          <CardSkeleton />
        </div>
      ) : bookmarkedQuestions.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No bookmarked questions yet"
          description="Bookmark important or challenging questions as you practice to review them anytime."
          actionText="Explore Questions"
          onAction={onExploreQuestions}
        />
      ) : (
        <QuestionTable
          questions={bookmarkedQuestions}
          progressMap={progressMap}
          topicsMap={topicsMap}
          patternsMap={patternsMap}
          loading={false}
          onSelectQuestion={setSelectedQuestion}
          onToggleBookmark={handleToggleBookmark}
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
