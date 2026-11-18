import React from "react";
import { FolderKanban, ArrowRight } from "lucide-react";
import type { Topic, Question, QuestionProgress } from "../../types";

interface TopicProgressGridProps {
  topics: Topic[];
  questions: Question[];
  progressMap: Map<string, QuestionProgress>;
  patternsMap: Map<string, { topicId: string }>;
  onSelectTopic: (topic: Topic) => void;
}

export const TopicProgressGrid: React.FC<TopicProgressGridProps> = ({
  topics,
  questions,
  progressMap,
  patternsMap,
  onSelectTopic,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {topics.map((topic) => {
        // Calculate total questions for this topic
        const topicQuestions = questions.filter((q) => {
          const pat = patternsMap.get(q.patternId);
          return pat?.topicId === topic.id;
        });

        const total = topicQuestions.length;
        const solved = topicQuestions.filter(
          (q) => progressMap.get(q.id)?.status === "SOLVED"
        ).length;

        const percent = total === 0 ? 0 : Math.round((solved / total) * 100);

        return (
          <div
            key={topic.id}
            onClick={() => onSelectTopic(topic)}
            className="group cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm dark:shadow-xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400 dark:hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/10">
                <FolderKanban className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-slate-500 group-hover:text-indigo-600 dark:text-slate-400 dark:group-hover:text-indigo-300 flex items-center gap-1 transition">
                {percent}%
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </div>

            <h4 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-200 transition">
              {topic.name}
            </h4>

            <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
              {topic.description || "Master DSA patterns and techniques"}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
                <span>Completed</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {solved} / {total}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
