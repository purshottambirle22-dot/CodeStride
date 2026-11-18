import { apiRequest } from "./client";
import type { Topic, Pattern, Question, Difficulty } from "../types";

// User / Public Topics
export function getTopics(params?: { search?: string; activeOnly?: boolean }) {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.activeOnly !== undefined) query.set("activeOnly", String(params.activeOnly));
  const queryString = query.toString();
  return apiRequest<Topic[]>(queryString ? `/topics?${queryString}` : "/topics");
}

export function getTopicById(id: string) {
  return apiRequest<Topic>(`/topics/${id}`);
}

export function getTopicBySlug(slug: string) {
  return apiRequest<Topic>(`/topics/slug/${slug}`);
}

export function getPatternsByTopic(topicId: string) {
  return apiRequest<Pattern[]>(`/topics/${topicId}/patterns`);
}

// User / Public Patterns
export function getPatterns(params?: { search?: string; activeOnly?: boolean }) {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.activeOnly !== undefined) query.set("activeOnly", String(params.activeOnly));
  const queryString = query.toString();
  return apiRequest<Pattern[]>(queryString ? `/patterns?${queryString}` : "/patterns");
}

export function getPatternById(id: string) {
  return apiRequest<Pattern>(`/patterns/${id}`);
}

export function getPatternBySlug(slug: string) {
  return apiRequest<Pattern>(`/patterns/slug/${slug}`);
}

export function getQuestionsByPattern(patternId: string) {
  return apiRequest<Question[]>(`/patterns/${patternId}/questions`);
}

export function getTopicPattern(topicId: string, patternId: string) {
  return apiRequest<Pattern>(`/topics/${topicId}/patterns/${patternId}`);
}

// Admin Topic Operations
export function adminCreateTopic(data: Partial<Topic>) {
  return apiRequest<Topic>("/admin/topics", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function adminUpdateTopic(id: string, data: Partial<Topic>) {
  return apiRequest<Topic>(`/admin/topics/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function adminDeleteTopic(id: string) {
  return apiRequest<void>(`/admin/topics/${id}`, {
    method: "DELETE",
  });
}

export function toggleTopicActive(id: string) {
  return apiRequest<Topic>(`/topics/${id}/toggle-active`, {
    method: "PATCH",
  });
}

// Admin Pattern Operations
export function adminCreatePattern(data: Partial<Pattern>) {
  return apiRequest<Pattern>("/admin/patterns", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function adminUpdatePattern(id: string, data: Partial<Pattern>) {
  return apiRequest<Pattern>(`/admin/patterns/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function adminDeletePattern(id: string) {
  return apiRequest<void>(`/admin/patterns/${id}`, {
    method: "DELETE",
  });
}

export function togglePatternActive(id: string) {
  return apiRequest<Pattern>(`/patterns/${id}/toggle-active`, {
    method: "PATCH",
  });
}

// Questions
export function getQuestions(params?: {
  patternId?: string;
  difficulty?: Difficulty | string;
  search?: string;
}) {
  const query = new URLSearchParams();
  if (params?.patternId) query.set("patternId", params.patternId);
  if (params?.difficulty && params.difficulty !== "ALL") query.set("difficulty", params.difficulty);
  if (params?.search) query.set("search", params.search);

  const queryString = query.toString();
  return apiRequest<Question[]>(queryString ? `/questions?${queryString}` : "/questions");
}

export function getQuestionById(id: string) {
  return apiRequest<Question>(`/questions/${id}`);
}

export function createQuestion(data: {
  patternId: string;
  title: string;
  difficulty: Difficulty;
  externalUrl: string;
}) {
  return apiRequest<Question>("/questions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateQuestion(
  id: string,
  data: {
    patternId?: string;
    title?: string;
    difficulty?: Difficulty;
    externalUrl?: string;
  }
) {
  return apiRequest<Question>(`/questions/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteQuestion(id: string) {
  return apiRequest<void>(`/questions/${id}`, {
    method: "DELETE",
  });
}

export function toggleQuestionActive(id: string) {
  return apiRequest<Question>(`/questions/${id}/toggle-active`, {
    method: "PATCH",
  });
}

// Backward compatibility aliases
export const createTopic = adminCreateTopic;
export const updateTopic = adminUpdateTopic;
export const deleteTopic = adminDeleteTopic;
export const createPattern = adminCreatePattern;
export const updatePattern = adminUpdatePattern;
export const deletePattern = adminDeletePattern;
