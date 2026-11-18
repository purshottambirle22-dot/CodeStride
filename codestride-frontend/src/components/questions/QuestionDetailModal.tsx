import React, { useState, useEffect } from "react";
import {
  X,
  ExternalLink,
  Bookmark,
  History,
  CheckCircle2,
  CircleDot,
  RotateCcw,
  Save,
  FileText,
} from "lucide-react";
import type { Question, QuestionProgress, Topic, Pattern } from "../../types";
import { DifficultyBadge } from "../common/DifficultyBadge";
import { StatusBadge } from "../common/StatusBadge";
import {
  updateProgress,
  toggleBookmark,
  toggleRevision,
  updateQuestionNotes,
  resetQuestionProgress,
} from "../../api/progress";
import { useToast } from "../../context/ToastContext";

interface QuestionDetailModalProps {
  question: Question | null;
  progress?: QuestionProgress | null;
  topic?: Topic | null;
  pattern?: Pattern | null;
  isOpen: boolean;
  onClose: () => void;
  onProgressUpdated: (updated: QuestionProgress) => void;
}

export const QuestionDetailModal: React.FC<QuestionDetailModalProps> = ({
  question,
  progress,
  topic,
  pattern,
  isOpen,
  onClose,
  onProgressUpdated,
}) => {
  const { showToast } = useToast();
  const [notes, setNotes] = useState(progress?.notes || "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    setNotes(progress?.notes || "");
  }, [progress]);

  if (!isOpen || !question) return null;

  const pointsMap = { EASY: 10, MEDIUM: 20, HARD: 30 };
  const pointValue = pointsMap[question.difficulty] || 10;

  const handleStatusChange = async (newStatus: "ATTEMPTED" | "SOLVED") => {
    try {
      setLoadingAction(true);
      const updated = await updateProgress(question.id, newStatus);
      onProgressUpdated(updated);
      showToast(`Question marked as ${newStatus.toLowerCase()}!`, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update status", "error");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleReset = async () => {
    try {
      setLoadingAction(true);
      const updated = await resetQuestionProgress(question.id);
      onProgressUpdated(updated);
      showToast("Progress reset to Not Started", "info");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to reset progress", "error");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleToggleBookmark = async () => {
    try {
      setLoadingAction(true);
      const updated = await toggleBookmark(question.id);
      onProgressUpdated(updated);
      showToast(
        updated.bookmarked ? "Added to bookmarks" : "Removed from bookmarks",
        "info"
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update bookmark", "error");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleToggleRevision = async () => {
    try {
      setLoadingAction(true);
      const updated = await toggleRevision(question.id);
      onProgressUpdated(updated);
      showToast(
        updated.revisionNeeded ? "Flagged for revision" : "Unflagged from revision",
        "info"
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update revision", "error");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      setSavingNotes(true);
      const updated = await updateQuestionNotes(question.id, notes);
      onProgressUpdated(updated);
      showToast("Personal notes saved successfully", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save notes", "error");
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl transition-colors duration-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 p-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <DifficultyBadge difficulty={question.difficulty} />
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                +{pointValue} Points
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-1">
              {question.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
              {topic && <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-slate-700 dark:text-slate-300">{topic.name}</span>}
              {pattern && <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-slate-700 dark:text-slate-300">{pattern.name}</span>}
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">Current Status:</span>
              <StatusBadge status={progress?.status ?? "NOT_STARTED"} />
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={loadingAction}
                onClick={handleToggleBookmark}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition ${
                  progress?.bookmarked
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-300"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Bookmark className={`h-3.5 w-3.5 ${progress?.bookmarked ? "fill-amber-400 text-amber-500" : ""}`} />
                {progress?.bookmarked ? "Bookmarked" : "Bookmark"}
              </button>

              <button
                disabled={loadingAction}
                onClick={handleToggleRevision}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition ${
                  progress?.revisionNeeded
                    ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <History className="h-3.5 w-3.5" />
                {progress?.revisionNeeded ? "Needs Revision" : "Mark Revision"}
              </button>
            </div>
          </div>

          {/* External Problem Link */}
          <div className="rounded-xl border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/60 dark:bg-indigo-500/5 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Solve on LeetCode</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Practice the problem directly on the judge platform.
              </p>
            </div>
            <a
              href={question.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition"
            >
              Open Problem
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Update Progress Status */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Update Solving State
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                disabled={loadingAction}
                onClick={() => handleStatusChange("ATTEMPTED")}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition ${
                  progress?.status === "ATTEMPTED"
                    ? "border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-300"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <CircleDot className="h-4 w-4" />
                Attempted
              </button>

              <button
                disabled={loadingAction}
                onClick={() => handleStatusChange("SOLVED")}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition ${
                  progress?.status === "SOLVED"
                    ? "border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                Solved
              </button>

              <button
                disabled={loadingAction}
                onClick={handleReset}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200 transition"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>

          {/* Private Notes Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <FileText className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                Personal Notes & Key Insights
              </label>
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-indigo-900 dark:hover:text-white transition disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                {savingNotes ? "Saving..." : "Save Notes"}
              </button>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record edge cases, time/space complexity O(N), pattern tricks, or mistakes made..."
              rows={5}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40 px-6 py-3.5 text-xs text-slate-500 dark:text-slate-400">
          <span>
            {progress?.updatedAt
              ? `Last updated: ${new Date(progress.updatedAt).toLocaleDateString()}`
              : "No attempts recorded yet"}
          </span>
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-1.5 font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
