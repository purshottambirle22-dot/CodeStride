import { apiRequest } from "./client";
import type { QuestionProgress } from "../types";

export function getMyProgress() {
  return apiRequest<QuestionProgress[]>("/progress/me");
}

export function updateProgress(questionId: string, status: "ATTEMPTED" | "SOLVED") {
  return apiRequest<QuestionProgress>(`/questions/${questionId}/progress`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export function toggleBookmark(questionId: string) {
  return apiRequest<QuestionProgress>(`/questions/${questionId}/bookmark`, {
    method: "PUT",
  });
}

export function toggleRevision(questionId: string) {
  return apiRequest<QuestionProgress>(`/questions/${questionId}/revision`, {
    method: "PUT",
  });
}

export function updateQuestionNotes(questionId: string, notes: string) {
  return apiRequest<QuestionProgress>(`/questions/${questionId}/notes`, {
    method: "PUT",
    body: JSON.stringify({ notes }),
  });
}

export function resetQuestionProgress(questionId: string) {
  return apiRequest<QuestionProgress>(`/questions/${questionId}/progress`, {
    method: "DELETE",
  });
}

export function getBookmarks() {
  return apiRequest<QuestionProgress[]>("/progress/bookmarks");
}

export function getRevisions() {
  return apiRequest<QuestionProgress[]>("/progress/revisions");
}
