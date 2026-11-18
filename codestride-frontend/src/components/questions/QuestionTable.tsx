import React from "react";
import {
  ExternalLink,
  Bookmark,
  History,
  CheckCircle2,
  CircleDot,
  Circle,
  FileEdit,
} from "lucide-react";
import type { Question, QuestionProgress, Topic, Pattern } from "../../types";
import { DifficultyBadge } from "../common/DifficultyBadge";
import { TableRowSkeleton } from "../common/LoadingSkeleton";
import { EmptyState } from "../common/EmptyState";
import { Search } from "lucide-react";

interface QuestionTableProps {
  questions: Question[];
  progressMap: Map<string, QuestionProgress>;
  topicsMap?: Map<string, Topic>;
  patternsMap?: Map<string, Pattern>;
  loading?: boolean;
  onSelectQuestion: (question: Question) => void;
  onToggleBookmark?: (questionId: string) => void;
  onToggleRevision?: (questionId: string) => void;
}

export const QuestionTable: React.FC<QuestionTableProps> = ({
  questions,
  progressMap,
  topicsMap,
  patternsMap,
  loading = false,
  onSelectQuestion,
  onToggleBookmark,
  onToggleRevision,
}) => {
  if (loading) {
    return (
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-sm dark:shadow-xl">
        <table className="w-full text-left text-xs">
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRowSkeleton key={i} cols={5} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title="No questions found"
        description="Try clearing your filters or searching with a different keyword."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm dark:shadow-xl backdrop-blur-sm">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <tr>
            <th className="py-3.5 px-4 w-12 text-center">Status</th>
            <th className="py-3.5 px-4">Problem</th>
            <th className="py-3.5 px-4">Difficulty</th>
            <th className="py-3.5 px-4 hidden md:table-cell">Pattern / Topic</th>
            <th className="py-3.5 px-4 text-center w-28">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {questions.map((question) => {
            const p = progressMap.get(question.id);
            const pattern = patternsMap?.get(question.patternId);
            const topic = pattern ? topicsMap?.get(pattern.topicId) : undefined;
            const isSolved = p?.status === "SOLVED";
            const isAttempted = p?.status === "ATTEMPTED";

            return (
              <tr
                key={question.id}
                className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors duration-150"
              >
                {/* Status Column */}
                <td className="py-3.5 px-4 text-center">
                  <button
                    onClick={() => onSelectQuestion(question)}
                    title={
                      isSolved
                        ? "Solved"
                        : isAttempted
                        ? "Attempted"
                        : "Not Started"
                    }
                    className="inline-flex items-center justify-center transition-transform group-hover:scale-110"
                  >
                    {isSolved ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                    ) : isAttempted ? (
                      <CircleDot className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-400" />
                    )}
                  </button>
                </td>

                {/* Problem Title */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectQuestion(question)}
                      className="text-left font-semibold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-300 transition line-clamp-1"
                    >
                      {question.title}
                    </button>
                    {p?.notes && (
                      <span title="Has personal notes">
                        <FileEdit className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
                      </span>
                    )}
                  </div>
                </td>

                {/* Difficulty */}
                <td className="py-3.5 px-4">
                  <DifficultyBadge difficulty={question.difficulty} size="sm" />
                </td>

                {/* Pattern / Topic */}
                <td className="py-3.5 px-4 hidden md:table-cell">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {pattern && (
                      <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                        {pattern.name}
                      </span>
                    )}
                    {topic && (
                      <span className="rounded-md bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 text-[11px] font-medium text-indigo-700 dark:text-indigo-300">
                        {topic.name}
                      </span>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {onToggleBookmark && (
                      <button
                        onClick={() => onToggleBookmark(question.id)}
                        title={p?.bookmarked ? "Remove Bookmark" : "Add Bookmark"}
                        className={`p-1.5 rounded-lg transition ${
                          p?.bookmarked
                            ? "text-amber-500 hover:bg-amber-500/10"
                            : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
                        }`}
                      >
                        <Bookmark className={`h-4 w-4 ${p?.bookmarked ? "fill-amber-400 text-amber-500" : ""}`} />
                      </button>
                    )}

                    {onToggleRevision && (
                      <button
                        onClick={() => onToggleRevision(question.id)}
                        title={p?.revisionNeeded ? "Needs Revision" : "Mark for Revision"}
                        className={`p-1.5 rounded-lg transition ${
                          p?.revisionNeeded
                            ? "text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
                            : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
                        }`}
                      >
                        <History className="h-4 w-4" />
                      </button>
                    )}

                    <a
                      href={question.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Solve on external platform"
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
