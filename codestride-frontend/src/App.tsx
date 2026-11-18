import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { ToastContainer } from "./components/common/ToastContainer";
import AuthPage from "./AuthPage";
import { AppSidebar, type NavItemKey } from "./components/common/AppSidebar";
import { AppHeader } from "./components/common/AppHeader";
import { DashboardPage } from "./pages/DashboardPage";
import { QuestionsPage } from "./pages/QuestionsPage";
import { TopicsPage } from "./pages/TopicsPage";
import { TopicDetailPage } from "./pages/TopicDetailPage";
import { PatternsPage } from "./pages/PatternsPage";
import { PatternDetailPage } from "./pages/PatternDetailPage";
import { ProgressPage } from "./pages/ProgressPage";
import { BookmarksPage } from "./pages/BookmarksPage";
import { RevisionPage } from "./pages/RevisionPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AdminPage } from "./pages/AdminPage";
import { QuestionDetailModal } from "./components/questions/QuestionDetailModal";
import { getMyDashboard } from "./api/dashboard";
import type { Question, Topic, Pattern, QuestionProgress } from "./types";

const MainApp: React.FC = () => {
  const { isAuthenticated, loading, login } = useAuth();

  const [activeTab, setActiveTab] = useState<NavItemKey>("Dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Detail view slug states for direct deep-linking
  const [activeTopicSlug, setActiveTopicSlug] = useState<string | null>(null);
  const [activePatternSlug, setActivePatternSlug] = useState<string | null>(null);

  // Cross-page navigation drilldown states
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(null);

  // Quick selected question from global search
  const [modalQuestion, setModalQuestion] = useState<Question | null>(null);

  // Streak counter from dashboard data
  const [streakCount, setStreakCount] = useState<number>(0);

  // Parse path on initial load & popstate
  useEffect(() => {
    const parseUrl = () => {
      const path = window.location.pathname;
      if (path.startsWith("/topics/")) {
        const slug = path.replace("/topics/", "").trim();
        if (slug) {
          setActiveTab("Topics");
          setActiveTopicSlug(slug);
          setActivePatternSlug(null);
          return;
        }
      }
      if (path.startsWith("/patterns/")) {
        const slug = path.replace("/patterns/", "").trim();
        if (slug) {
          setActiveTab("Patterns");
          setActivePatternSlug(slug);
          setActiveTopicSlug(null);
          return;
        }
      }
      if (path === "/topics") {
        setActiveTab("Topics");
        setActiveTopicSlug(null);
      } else if (path === "/patterns") {
        setActiveTab("Patterns");
        setActivePatternSlug(null);
      } else if (path === "/questions") {
        setActiveTab("Questions");
      } else if (path === "/admin") {
        setActiveTab("Admin");
      } else if (path === "/leaderboard") {
        setActiveTab("Leaderboard");
      } else if (path === "/progress") {
        setActiveTab("Progress");
      }
    };

    parseUrl();
    window.addEventListener("popstate", parseUrl);
    return () => window.removeEventListener("popstate", parseUrl);
  }, []);

  const updateUrl = (newPath: string) => {
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, "", newPath);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      getMyDashboard()
        .then((data) => {
          if (data?.currentStreak != null) {
            setStreakCount(data.currentStreak);
          }
        })
        .catch(() => null);
    }
  }, [isAuthenticated, activeTab]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 text-indigo-600 dark:text-indigo-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Loading CodeStride...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage onLogin={login} />;
  }

  const handleOpenTopic = (topic: Topic) => {
    setActiveTopicSlug(topic.slug);
    setActivePatternSlug(null);
    setActiveTab("Topics");
    updateUrl(`/topics/${topic.slug}`);
  };

  const handleOpenPattern = (pattern: Pattern) => {
    setActivePatternSlug(pattern.slug);
    setActiveTopicSlug(null);
    setActiveTab("Patterns");
    updateUrl(`/patterns/${pattern.slug}`);
  };

  const handleTabChange = (tab: NavItemKey) => {
    // When switching tabs from sidebar or header, clear detail views
    setActiveTopicSlug(null);
    setActivePatternSlug(null);

    if (tab === "Questions") {
      setSelectedPatternId(null);
      setSelectedTopicId(null);
      updateUrl("/questions");
    } else if (tab === "Topics") {
      updateUrl("/topics");
    } else if (tab === "Patterns") {
      updateUrl("/patterns");
    } else if (tab === "Dashboard") {
      updateUrl("/");
    } else if (tab === "Admin") {
      updateUrl("/admin");
    } else if (tab === "Leaderboard") {
      updateUrl("/leaderboard");
    } else if (tab === "Progress") {
      updateUrl("/progress");
    }
    setActiveTab(tab);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Sidebar */}
      <AppSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header */}
        <AppHeader
          activeTab={activeTab}
          onNavigate={handleTabChange}
          onSelectQuestion={setModalQuestion}
          onOpenMobileMenu={() => setMobileSidebarOpen(true)}
          streakCount={streakCount}
        />

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8 max-w-7xl w-full mx-auto">
          {activeTab === "Dashboard" && (
            <DashboardPage
              onNavigate={handleTabChange}
              onSelectTopicForDrilldown={handleOpenTopic}
            />
          )}

          {activeTab === "Questions" && (
            <QuestionsPage
              initialTopicId={selectedTopicId}
              initialPatternId={selectedPatternId}
            />
          )}

          {activeTab === "Topics" &&
            (activeTopicSlug ? (
              <TopicDetailPage
                slug={activeTopicSlug}
                onNavigateBack={() => {
                  setActiveTopicSlug(null);
                  updateUrl("/topics");
                }}
                onSelectPattern={(pattern) => {
                  setActivePatternSlug(pattern.slug);
                  setActiveTopicSlug(null);
                  setActiveTab("Patterns");
                  updateUrl(`/patterns/${pattern.slug}`);
                }}
              />
            ) : (
              <TopicsPage onSelectTopic={handleOpenTopic} />
            ))}

          {activeTab === "Patterns" &&
            (activePatternSlug ? (
              <PatternDetailPage
                slug={activePatternSlug}
                onNavigateBack={() => {
                  setActivePatternSlug(null);
                  updateUrl("/patterns");
                }}
                onSelectTopic={(topicSlug) => {
                  setActiveTopicSlug(topicSlug);
                  setActivePatternSlug(null);
                  setActiveTab("Topics");
                  updateUrl(`/topics/${topicSlug}`);
                }}
              />
            ) : (
              <PatternsPage
                initialTopicId={selectedTopicId}
                onSelectPattern={handleOpenPattern}
              />
            ))}

          {activeTab === "Progress" && <ProgressPage />}

          {activeTab === "Bookmarks" && (
            <BookmarksPage onExploreQuestions={() => setActiveTab("Questions")} />
          )}

          {activeTab === "Revision" && (
            <RevisionPage onExploreQuestions={() => setActiveTab("Questions")} />
          )}

          {activeTab === "Leaderboard" && <LeaderboardPage />}

          {activeTab === "Profile" && <ProfilePage />}

          {activeTab === "Admin" && <AdminPage />}
        </main>
      </div>

      {/* Global Question Modal if activated from search */}
      {modalQuestion && (
        <QuestionDetailModal
          question={modalQuestion}
          isOpen={true}
          onClose={() => setModalQuestion(null)}
          onProgressUpdated={(_updated: QuestionProgress) => {
            // progress refreshed
          }}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <MainApp />
          <ToastContainer />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
