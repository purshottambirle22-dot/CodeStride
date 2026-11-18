export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type QuestionStatus = "NOT_STARTED" | "ATTEMPTED" | "SOLVED";
export type UserRole = "USER" | "ADMIN";
export type ThemeMode = "DARK" | "LIGHT";

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  theme?: string;
  createdAt?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description?: string;
  detailedLearningDescription?: string;
  displayOrder?: number;
  icon?: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
  totalPatterns?: number;
  totalQuestions?: number;
  solvedQuestions?: number;
  completionPercentage?: number;
}

export interface Pattern {
  id: string;
  topicId: string;
  name: string;
  slug: string;
  description?: string;
  detailedExplanation?: string;
  whenToUse?: string;
  howToRecognize?: string;
  basicApproach?: string;
  timeComplexityOverview?: string;
  spaceComplexityOverview?: string;
  relatedTopicIds?: string[];
  displayOrder?: number;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
  topicName?: string;
  topicSlug?: string;
  questionCount?: number;
  solvedCount?: number;
  completionPercentage?: number;
  easyCount?: number;
  mediumCount?: number;
  hardCount?: number;
}

export interface Question {
  id: string;
  patternId: string;
  title: string;
  difficulty: Difficulty;
  externalUrl: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
  patternName?: string;
  topicName?: string;
  points?: number;
  status?: "NOT_STARTED" | "ATTEMPTED" | "SOLVED";
  bookmarked?: boolean;
  notes?: string;
}

export interface QuestionProgress {
  id: string;
  questionId: string;
  status: "ATTEMPTED" | "SOLVED" | null;
  firstAttemptedAt: string | null;
  solvedAt: string | null;
  updatedAt: string;
  bookmarked: boolean;
  revisionNeeded: boolean;
  notes: string | null;
  lastAttemptedAt?: string | null;
}

export interface PointsSummary {
  totalPoints: number;
  solvedQuestions: number;
  attemptedQuestions: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  totalPoints: number;
}

export interface LeaderboardPage {
  content: LeaderboardEntry[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface DashboardData {
  profile?: User;
  points?: PointsSummary;
  leaderboard?: {
    rank?: number;
    userId?: string;
    username?: string;
    totalPoints?: number;
  };
  totalPoints?: number;
  solvedQuestions?: number;
  attemptedQuestions?: number;
  leaderboardRank?: number;
  currentStreak?: number;
  todaySolved?: number;
  easySolved?: number;
  mediumSolved?: number;
  hardSolved?: number;
  weeklyActivity?: Record<string, number>;
}

export interface AdminStats {
  totalUsers: number;
  totalQuestions: number;
  totalTopics: number;
  totalPatterns: number;
  totalSubmissions: number;
  totalPointsAwarded: number;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  theme?: string;
  createdAt: string;
  totalPoints: number;
  solvedQuestions: number;
}

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  text: string;
}
