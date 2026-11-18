import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Users,
  HelpCircle,
  FolderKanban,
  Shapes,
  Plus,
  Trash2,
  Sparkles,
  Search,
  ExternalLink,
  Check,
  X,
  Edit2,
  Power,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getAdminStats,
  getAdminUsers,
  updateAdminUserRole,
  deleteAdminUser,
  seedAdminCatalog,
} from "../api/admin";
import {
  getQuestions,
  getTopics,
  getPatterns,
  createQuestion,
  deleteQuestion,
  adminCreateTopic,
  adminUpdateTopic,
  adminDeleteTopic,
  toggleTopicActive,
  adminCreatePattern,
  adminUpdatePattern,
  adminDeletePattern,
  togglePatternActive,
} from "../api/catalog";
import type {
  AdminStats,
  AdminUser,
  Question,
  Topic,
  Pattern,
  Difficulty,
} from "../types";
import { StatCard } from "../components/common/StatCard";
import { DifficultyBadge } from "../components/common/DifficultyBadge";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { useToast } from "../context/ToastContext";

type AdminTab = "STATS" | "USERS" | "QUESTIONS" | "TOPICS" | "PATTERNS";

export const AdminPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>("STATS");

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);

  // Search filters
  const [userSearch, setUserSearch] = useState("");
  const [questionSearch, setQuestionSearch] = useState("");
  const [topicSearch, setTopicSearch] = useState("");
  const [patternSearch, setPatternSearch] = useState("");
  const [patternTopicFilter, setPatternTopicFilter] = useState("ALL");

  // Modals state
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  const [isPatternModalOpen, setIsPatternModalOpen] = useState(false);
  const [editingPattern, setEditingPattern] = useState<Pattern | null>(null);

  // New question form
  const [newQuestionTitle, setNewQuestionTitle] = useState("");
  const [newQuestionPatternId, setNewQuestionPatternId] = useState("");
  const [newQuestionDiff, setNewQuestionDiff] = useState<Difficulty>("EASY");
  const [newQuestionUrl, setNewQuestionUrl] = useState("");

  // Topic form state
  const [topicForm, setTopicForm] = useState({
    name: "",
    slug: "",
    description: "",
    detailedLearningDescription: "",
    displayOrder: 1,
    icon: "folder",
  });

  // Pattern form state
  const [patternForm, setPatternForm] = useState({
    topicId: "",
    name: "",
    slug: "",
    description: "",
    detailedExplanation: "",
    whenToUse: "",
    howToRecognize: "",
    basicApproach: "",
    timeComplexityOverview: "O(N)",
    spaceComplexityOverview: "O(1)",
    relatedTopicIds: [] as string[],
    displayOrder: 1,
  });

  // Confirm dialog state
  const [confirmDelete, setConfirmDelete] = useState<{
    type: "USER" | "QUESTION" | "TOPIC" | "PATTERN";
    id: string;
    title: string;
  } | null>(null);

  const loadAllAdminData = async () => {
    try {
      const [s, u, q, t, p] = await Promise.all([
        getAdminStats(),
        getAdminUsers(),
        getQuestions(),
        getTopics({ activeOnly: false }),
        getPatterns({ activeOnly: false }),
      ]);
      setStats(s);
      setUsers(u);
      setQuestions(q);
      setTopics(t);
      setPatterns(p);
      if (p.length > 0 && !newQuestionPatternId) {
        setNewQuestionPatternId(p[0].id);
      }
      if (t.length > 0 && !patternForm.topicId) {
        setPatternForm((prev) => ({ ...prev, topicId: t[0].id }));
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load admin data", "error");
    }
  };

  useEffect(() => {
    if (isAdmin) {
      void loadAllAdminData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-rose-500/30 bg-rose-500/10">
        <ShieldCheck className="h-12 w-12 text-rose-500 dark:text-rose-400 mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Access Denied</h2>
        <p className="text-xs text-rose-600 dark:text-rose-300 mt-1 max-w-sm">
          You do not have administrative privileges to access this area. Backend authorization enforced.
        </p>
      </div>
    );
  }

  // Action: Seed catalog
  const handleSeed = async () => {
    try {
      const res = await seedAdminCatalog();
      showToast(res.message, "success");
      await loadAllAdminData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Seed failed", "error");
    }
  };

  // Action: Change user role
  const handleToggleRole = async (targetUser: AdminUser) => {
    const newRole = targetUser.role === "ADMIN" ? "USER" : "ADMIN";
    try {
      await updateAdminUserRole(targetUser.id, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
      );
      showToast(`User role updated to ${newRole}`, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update role", "error");
    }
  };

  // Action: Create question
  const handleCreateQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionTitle.trim() || !newQuestionPatternId || !newQuestionUrl.trim()) {
      showToast("Please fill all required fields", "warning");
      return;
    }

    try {
      const created = await createQuestion({
        title: newQuestionTitle.trim(),
        patternId: newQuestionPatternId,
        difficulty: newQuestionDiff,
        externalUrl: newQuestionUrl.trim(),
      });
      setQuestions((prev) => [created, ...prev]);
      setIsAddQuestionOpen(false);
      setNewQuestionTitle("");
      setNewQuestionUrl("");
      showToast("Question created successfully", "success");
      getAdminStats().then(setStats).catch(() => null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to create question", "error");
    }
  };

  // TOPIC ACTIONS
  const openCreateTopicModal = () => {
    setEditingTopic(null);
    setTopicForm({
      name: "",
      slug: "",
      description: "",
      detailedLearningDescription: "",
      displayOrder: topics.length + 1,
      icon: "folder",
    });
    setIsTopicModalOpen(true);
  };

  const openEditTopicModal = (t: Topic) => {
    setEditingTopic(t);
    setTopicForm({
      name: t.name,
      slug: t.slug,
      description: t.description || "",
      detailedLearningDescription: t.detailedLearningDescription || "",
      displayOrder: t.displayOrder || 1,
      icon: t.icon || "folder",
    });
    setIsTopicModalOpen(true);
  };

  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicForm.name.trim() || !topicForm.slug.trim()) {
      showToast("Name and slug are required", "warning");
      return;
    }

    try {
      if (editingTopic) {
        const updated = await adminUpdateTopic(editingTopic.id, {
          name: topicForm.name.trim(),
          description: topicForm.description.trim(),
          detailedLearningDescription: topicForm.detailedLearningDescription.trim(),
          displayOrder: Number(topicForm.displayOrder),
          icon: topicForm.icon.trim(),
        });
        setTopics((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        showToast("Topic updated successfully", "success");
      } else {
        const created = await adminCreateTopic({
          name: topicForm.name.trim(),
          slug: topicForm.slug.trim().toLowerCase(),
          description: topicForm.description.trim(),
          detailedLearningDescription: topicForm.detailedLearningDescription.trim(),
          displayOrder: Number(topicForm.displayOrder),
          icon: topicForm.icon.trim(),
        });
        setTopics((prev) => [...prev, created]);
        showToast("Topic created successfully", "success");
      }
      setIsTopicModalOpen(false);
      getAdminStats().then(setStats).catch(() => null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save topic", "error");
    }
  };

  const handleToggleTopicActive = async (topicId: string) => {
    try {
      const updated = await toggleTopicActive(topicId);
      setTopics((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      showToast(`Topic is now ${updated.active ? "Active" : "Inactive"}`, "info");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to toggle topic status", "error");
    }
  };

  // PATTERN ACTIONS
  const openCreatePatternModal = () => {
    setEditingPattern(null);
    setPatternForm({
      topicId: topics.length > 0 ? topics[0].id : "",
      name: "",
      slug: "",
      description: "",
      detailedExplanation: "",
      whenToUse: "",
      howToRecognize: "",
      basicApproach: "",
      timeComplexityOverview: "O(N)",
      spaceComplexityOverview: "O(1)",
      relatedTopicIds: [],
      displayOrder: patterns.length + 1,
    });
    setIsPatternModalOpen(true);
  };

  const openEditPatternModal = (p: Pattern) => {
    setEditingPattern(p);
    setPatternForm({
      topicId: p.topicId,
      name: p.name,
      slug: p.slug,
      description: p.description || "",
      detailedExplanation: p.detailedExplanation || "",
      whenToUse: p.whenToUse || "",
      howToRecognize: p.howToRecognize || "",
      basicApproach: p.basicApproach || "",
      timeComplexityOverview: p.timeComplexityOverview || "O(N)",
      spaceComplexityOverview: p.spaceComplexityOverview || "O(1)",
      relatedTopicIds: p.relatedTopicIds || [],
      displayOrder: p.displayOrder || 1,
    });
    setIsPatternModalOpen(true);
  };

  const handleSavePattern = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patternForm.name.trim() || !patternForm.slug.trim() || !patternForm.topicId) {
      showToast("Name, slug, and parent topic are required", "warning");
      return;
    }

    try {
      if (editingPattern) {
        const updated = await adminUpdatePattern(editingPattern.id, {
          topicId: patternForm.topicId,
          name: patternForm.name.trim(),
          description: patternForm.description.trim(),
          detailedExplanation: patternForm.detailedExplanation.trim(),
          whenToUse: patternForm.whenToUse.trim(),
          howToRecognize: patternForm.howToRecognize.trim(),
          basicApproach: patternForm.basicApproach.trim(),
          timeComplexityOverview: patternForm.timeComplexityOverview.trim(),
          spaceComplexityOverview: patternForm.spaceComplexityOverview.trim(),
          relatedTopicIds: patternForm.relatedTopicIds,
          displayOrder: Number(patternForm.displayOrder),
        });
        setPatterns((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        showToast("Pattern updated successfully", "success");
      } else {
        const created = await adminCreatePattern({
          topicId: patternForm.topicId,
          name: patternForm.name.trim(),
          slug: patternForm.slug.trim().toLowerCase(),
          description: patternForm.description.trim(),
          detailedExplanation: patternForm.detailedExplanation.trim(),
          whenToUse: patternForm.whenToUse.trim(),
          howToRecognize: patternForm.howToRecognize.trim(),
          basicApproach: patternForm.basicApproach.trim(),
          timeComplexityOverview: patternForm.timeComplexityOverview.trim(),
          spaceComplexityOverview: patternForm.spaceComplexityOverview.trim(),
          relatedTopicIds: patternForm.relatedTopicIds,
          displayOrder: Number(patternForm.displayOrder),
        });
        setPatterns((prev) => [...prev, created]);
        showToast("Pattern created successfully", "success");
      }
      setIsPatternModalOpen(false);
      getAdminStats().then(setStats).catch(() => null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save pattern", "error");
    }
  };

  const handleTogglePatternActive = async (patternId: string) => {
    try {
      const updated = await togglePatternActive(patternId);
      setPatterns((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      showToast(`Pattern is now ${updated.active ? "Active" : "Inactive"}`, "info");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to toggle pattern status", "error");
    }
  };

  // Safe deletion execution
  const executeDelete = async () => {
    if (!confirmDelete) return;
    try {
      if (confirmDelete.type === "USER") {
        await deleteAdminUser(confirmDelete.id);
        setUsers((prev) => prev.filter((u) => u.id !== confirmDelete.id));
        showToast("User deleted successfully", "success");
      } else if (confirmDelete.type === "QUESTION") {
        await deleteQuestion(confirmDelete.id);
        setQuestions((prev) => prev.filter((q) => q.id !== confirmDelete.id));
        showToast("Question deleted successfully", "success");
      } else if (confirmDelete.type === "TOPIC") {
        await adminDeleteTopic(confirmDelete.id);
        setTopics((prev) => prev.filter((t) => t.id !== confirmDelete.id));
        showToast("Topic deleted successfully", "success");
      } else if (confirmDelete.type === "PATTERN") {
        await adminDeletePattern(confirmDelete.id);
        setPatterns((prev) => prev.filter((p) => p.id !== confirmDelete.id));
        showToast("Pattern deleted successfully", "success");
      }
      setConfirmDelete(null);
      getAdminStats().then(setStats).catch(() => null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Deletion failed", "error");
      setConfirmDelete(null);
    }
  };

  const topicsMap = new Map<string, Topic>();
  topics.forEach((t) => topicsMap.set(t.id, t));

  const patternsMap = new Map<string, Pattern>();
  patterns.forEach((p) => patternsMap.set(p.id, p));

  // Filtered topics for admin list
  const filteredTopics = topics.filter(
    (t) =>
      t.name.toLowerCase().includes(topicSearch.toLowerCase()) ||
      t.slug.toLowerCase().includes(topicSearch.toLowerCase())
  );

  // Filtered patterns for admin list
  const filteredPatterns = patterns.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(patternSearch.toLowerCase()) ||
      p.slug.toLowerCase().includes(patternSearch.toLowerCase());
    const matchesTopic =
      patternTopicFilter === "ALL" ||
      p.topicId === patternTopicFilter ||
      (p.relatedTopicIds && p.relatedTopicIds.includes(patternTopicFilter));
    return matchesSearch && matchesTopic;
  });

  return (
    <div className="space-y-8 pb-16 transition-colors duration-200">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Admin Control Center
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            System administration, user authorization, and catalog content management.
          </p>
        </div>

        <button
          onClick={handleSeed}
          className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/20 transition cursor-pointer"
        >
          <Sparkles className="h-4 w-4" />
          Re-Sync 24 Topics & 52 Patterns Seed
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {(
          [
            { id: "STATS", label: "Overview Stats", icon: ShieldCheck },
            { id: "TOPICS", label: `Topics (${topics.length})`, icon: FolderKanban },
            { id: "PATTERNS", label: `Patterns (${patterns.length})`, icon: Shapes },
            { id: "QUESTIONS", label: `Questions (${questions.length})`, icon: HelpCircle },
            { id: "USERS", label: `Users (${users.length})`, icon: Users },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: STATS */}
      {activeTab === "STATS" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <StatCard
              label="Total Topics"
              value={stats?.totalTopics ?? topics.length}
              icon={FolderKanban}
              subtitle="DSA Roadmap Tracks"
            />
            <StatCard
              label="Total Patterns"
              value={stats?.totalPatterns ?? patterns.length}
              icon={Shapes}
              subtitle="Algorithmic Blueprints"
            />
            <StatCard
              label="Total Questions"
              value={stats?.totalQuestions ?? questions.length}
              icon={HelpCircle}
              subtitle="Practice Questions"
            />
            <StatCard
              label="Total Users"
              value={stats?.totalUsers ?? users.length}
              icon={Users}
              subtitle="Registered Learners"
            />
            <StatCard
              label="Submissions"
              value={stats?.totalSubmissions ?? 0}
              icon={Check}
              subtitle="Total Attempts & Solves"
            />
            <StatCard
              label="Points Awarded"
              value={stats?.totalPointsAwarded ?? 0}
              icon={Sparkles}
              subtitle="XP Leaderboard Points"
            />
          </div>
        </div>
      )}

      {/* TAB 2: TOPICS MANAGEMENT */}
      {activeTab === "TOPICS" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search topics by name or slug..."
                value={topicSearch}
                onChange={(e) => setTopicSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 shadow-2xs"
              />
            </div>

            <button
              onClick={openCreateTopicModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Topic
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Topic Name</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4 text-center">Patterns</th>
                  <th className="py-3 px-4 text-center">Questions</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTopics.map((t) => {
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-mono text-slate-400 font-bold">#{t.displayOrder ?? 0}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{t.name}</div>
                        <div className="text-2xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-xs">
                          {t.description || "No description"}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-indigo-600 dark:text-indigo-400">{t.slug}</td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                        {t.totalPatterns ?? 0}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                        {t.totalQuestions ?? 0}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleTopicActive(t.id)}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-2xs font-semibold cursor-pointer transition ${
                            t.active
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          <Power className="h-2.5 w-2.5" />
                          {t.active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => openEditTopicModal(t)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setConfirmDelete({
                              type: "TOPIC",
                              id: t.id,
                              title: `Delete topic "${t.name}"? Note: Deletion is blocked if patterns exist under this topic.`,
                            })
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-500 transition cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PATTERNS MANAGEMENT */}
      {activeTab === "PATTERNS" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patterns by name or slug..."
                  value={patternSearch}
                  onChange={(e) => setPatternSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 shadow-2xs"
                />
              </div>

              <select
                value={patternTopicFilter}
                onChange={(e) => setPatternTopicFilter(e.target.value)}
                className="py-1.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 shadow-2xs"
              >
                <option value="ALL">All Topics</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={openCreatePatternModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Pattern
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Pattern Name</th>
                  <th className="py-3 px-4">Primary Topic</th>
                  <th className="py-3 px-4">Complexities</th>
                  <th className="py-3 px-4 text-center">Questions</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPatterns.map((p) => {
                  const parentTopic = topicsMap.get(p.topicId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-mono text-slate-400 font-bold">#{p.displayOrder ?? 0}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{p.name}</div>
                        <div className="text-2xs font-mono text-indigo-600 dark:text-indigo-400">{p.slug}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        <span className="font-medium">{parentTopic?.name || p.topicName || "Unknown"}</span>
                        {p.relatedTopicIds && p.relatedTopicIds.length > 0 && (
                          <span className="ml-1 text-3xs text-slate-400">
                            (+{p.relatedTopicIds.length} related)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-2xs text-slate-500 dark:text-slate-400">
                        <span>T: {p.timeComplexityOverview || "O(N)"}</span> |{" "}
                        <span>S: {p.spaceComplexityOverview || "O(1)"}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                        {p.questionCount ?? 0}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleTogglePatternActive(p.id)}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-2xs font-semibold cursor-pointer transition ${
                            p.active
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          <Power className="h-2.5 w-2.5" />
                          {p.active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => openEditPatternModal(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setConfirmDelete({
                              type: "PATTERN",
                              id: p.id,
                              title: `Delete pattern "${p.name}"? Note: Safe deletion is blocked if questions reference this pattern.`,
                            })
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-500 transition cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: QUESTIONS */}
      {activeTab === "QUESTIONS" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search questions by title..."
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 shadow-2xs"
              />
            </div>

            <button
              onClick={() => setIsAddQuestionOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Problem
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">Pattern</th>
                  <th className="py-3 px-4">External Link</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {questions
                  .filter((q) => q.title.toLowerCase().includes(questionSearch.toLowerCase()))
                  .map((q) => {
                    const pat = patternsMap.get(q.patternId);
                    return (
                      <tr key={q.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                          {q.title}
                        </td>
                        <td className="py-3.5 px-4">
                          <DifficultyBadge difficulty={q.difficulty} size="sm" />
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          {pat?.name || q.patternId}
                        </td>
                        <td className="py-3.5 px-4">
                          <a
                            href={q.externalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            LeetCode <ExternalLink className="h-3 w-3" />
                          </a>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() =>
                              setConfirmDelete({
                                type: "QUESTION",
                                id: q.id,
                                title: `Delete question "${q.title}"?`,
                              })
                            }
                            className="p-1 rounded-lg text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 dark:hover:text-rose-400 transition cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: USERS */}
      {activeTab === "USERS" && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search user by username or email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 shadow-2xs"
            />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-center">Points</th>
                  <th className="py-3 px-4 text-center">Solved</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users
                  .filter(
                    (u) =>
                      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
                      u.email.toLowerCase().includes(userSearch.toLowerCase())
                  )
                  .map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{u.username}</div>
                        <div className="text-2xs text-slate-400">{u.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`rounded-full px-2 py-0.5 text-2xs font-bold ${
                            u.role === "ADMIN"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-indigo-600 dark:text-indigo-400">
                        {u.totalPoints}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                        {u.solvedQuestions}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleToggleRole(u)}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-2xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                          Toggle {u.role === "ADMIN" ? "USER" : "ADMIN"}
                        </button>
                        <button
                          onClick={() =>
                            setConfirmDelete({
                              type: "USER",
                              id: u.id,
                              title: `Delete user "${u.username}"?`,
                            })
                          }
                          className="p-1 rounded-lg text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: TOPIC CREATE / EDIT */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingTopic ? `Edit Topic: ${editingTopic.name}` : "Create New Topic"}
              </h3>
              <button
                onClick={() => setIsTopicModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTopic} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Topic Name *
                </label>
                <input
                  required
                  type="text"
                  value={topicForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setTopicForm((prev) => ({
                      ...prev,
                      name,
                      slug: editingTopic ? prev.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                    }));
                  }}
                  placeholder="e.g. Dynamic Programming"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Unique Slug *
                </label>
                <input
                  required
                  disabled={!!editingTopic}
                  type="text"
                  value={topicForm.slug}
                  onChange={(e) => setTopicForm((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="e.g. dynamic-programming"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500 disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={topicForm.displayOrder}
                    onChange={(e) =>
                      setTopicForm((prev) => ({ ...prev, displayOrder: parseInt(e.target.value) || 1 }))
                    }
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Icon Identifier
                  </label>
                  <input
                    type="text"
                    value={topicForm.icon}
                    onChange={(e) => setTopicForm((prev) => ({ ...prev, icon: e.target.value }))}
                    placeholder="e.g. folder, cpu, layers"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={topicForm.description}
                  onChange={(e) => setTopicForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief 1-sentence summary of topic track..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Detailed Learning Description (Educational Overview)
                </label>
                <textarea
                  rows={4}
                  value={topicForm.detailedLearningDescription}
                  onChange={(e) =>
                    setTopicForm((prev) => ({
                      ...prev,
                      detailedLearningDescription: e.target.value,
                    }))
                  }
                  placeholder="Comprehensive learning overview explaining core algorithmic concepts..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTopicModalOpen(false)}
                  className="rounded-xl px-4 py-2 font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white hover:bg-indigo-500 transition cursor-pointer"
                >
                  {editingTopic ? "Update Topic" : "Create Topic"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PATTERN CREATE / EDIT */}
      {isPatternModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingPattern ? `Edit Pattern: ${editingPattern.name}` : "Create New Pattern"}
              </h3>
              <button
                onClick={() => setIsPatternModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePattern} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Primary Parent Topic *
                  </label>
                  <select
                    value={patternForm.topicId}
                    onChange={(e) => setPatternForm((prev) => ({ ...prev, topicId: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  >
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={patternForm.displayOrder}
                    onChange={(e) =>
                      setPatternForm((prev) => ({ ...prev, displayOrder: parseInt(e.target.value) || 1 }))
                    }
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Pattern Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={patternForm.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setPatternForm((prev) => ({
                        ...prev,
                        name,
                        slug: editingPattern ? prev.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                      }));
                    }}
                    placeholder="e.g. Variable Size Sliding Window"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Unique Slug *
                  </label>
                  <input
                    required
                    disabled={!!editingPattern}
                    type="text"
                    value={patternForm.slug}
                    onChange={(e) => setPatternForm((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="e.g. variable-size-sliding-window"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Time Complexity
                  </label>
                  <input
                    type="text"
                    value={patternForm.timeComplexityOverview}
                    onChange={(e) =>
                      setPatternForm((prev) => ({ ...prev, timeComplexityOverview: e.target.value }))
                    }
                    placeholder="e.g. O(N) or O(N log N)"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Space Complexity
                  </label>
                  <input
                    type="text"
                    value={patternForm.spaceComplexityOverview}
                    onChange={(e) =>
                      setPatternForm((prev) => ({ ...prev, spaceComplexityOverview: e.target.value }))
                    }
                    placeholder="e.g. O(1) or O(K)"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={patternForm.description}
                  onChange={(e) => setPatternForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Summary of this pattern..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  When to Use This Pattern
                </label>
                <textarea
                  rows={2}
                  value={patternForm.whenToUse}
                  onChange={(e) => setPatternForm((prev) => ({ ...prev, whenToUse: e.target.value }))}
                  placeholder="Situations where this pattern is the optimal choice..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  How to Recognize in Interviews (Keywords & Signals)
                </label>
                <textarea
                  rows={2}
                  value={patternForm.howToRecognize}
                  onChange={(e) => setPatternForm((prev) => ({ ...prev, howToRecognize: e.target.value }))}
                  placeholder="Problem statements, keywords, and indicators..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Basic Approach & Intuition
                </label>
                <textarea
                  rows={3}
                  value={patternForm.basicApproach}
                  onChange={(e) => setPatternForm((prev) => ({ ...prev, basicApproach: e.target.value }))}
                  placeholder="Step by step solution intuition..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPatternModalOpen(false)}
                  className="rounded-xl px-4 py-2 font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white hover:bg-indigo-500 transition cursor-pointer"
                >
                  {editingPattern ? "Update Pattern" : "Create Pattern"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD QUESTION */}
      {isAddQuestionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl transition-colors">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Add New Problem</h3>
              <button
                onClick={() => setIsAddQuestionOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestionSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Title
                </label>
                <input
                  required
                  type="text"
                  value={newQuestionTitle}
                  onChange={(e) => setNewQuestionTitle(e.target.value)}
                  placeholder="e.g. Trapping Rain Water"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Pattern
                  </label>
                  <select
                    value={newQuestionPatternId}
                    onChange={(e) => setNewQuestionPatternId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  >
                    {patterns.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Difficulty
                  </label>
                  <select
                    value={newQuestionDiff}
                    onChange={(e) => setNewQuestionDiff(e.target.value as Difficulty)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Problem URL
                </label>
                <input
                  required
                  type="url"
                  value={newQuestionUrl}
                  onChange={(e) => setNewQuestionUrl(e.target.value)}
                  placeholder="https://leetcode.com/problems/..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddQuestionOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition cursor-pointer"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Confirm Deletion"
        message={confirmDelete?.title || "Are you sure you want to perform this deletion?"}
        confirmText="Delete"
        isDanger={true}
        onConfirm={executeDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};
