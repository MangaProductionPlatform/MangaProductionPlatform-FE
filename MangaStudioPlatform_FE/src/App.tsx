import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import AssistantLayout from "./layouts/AssistantLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import PublicLayout from "./layouts/PublicLayout";
import LandingPage from "./pages/landing/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DiscoverPage from "./pages/public/DiscoverPage";
import TrendingPage from "./pages/public/TrendingPage";
import GenresPage from "./pages/public/GenresPage";
import CreatorPage from "./pages/public/CreatorPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import SeriesListPage from "./pages/series/SeriesListPage";
import CreateSeriesPage from "./pages/series/CreateSeriesPage";
import SeriesDetailPage from "./pages/series/SeriesDetailPage";
import ApprovalPage from "./pages/series/ApprovalPage";
import ReviewPage from "./pages/manuscript/ReviewPage";
import SubmissionPage from "./pages/manuscript/SubmissionPage";
import TaskBoardPage from "./pages/tasks/TaskBoardPage";
import TaskDetailPage from "./pages/tasks/TaskDetailPage";
import AssistantsPage from "./pages/assistants/AssistantsPage";
import AnalyticsPage from "./pages/analytics/AnalyticsPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import RankingPage from "./pages/ranking/RankingPage";
import ProfilePage from "./pages/profile/ProfilePage";
import AssistantDashboardPage from "./pages/assistant/AssistantDashboardPage";
import AssistantTasksPage from "./pages/assistant/AssistantTasksPage";
import AssistantTaskDetailPage from "./pages/assistant/AssistantTaskDetailPage";
import AssistantChaptersPage from "./pages/assistant/AssistantChaptersPage";
import AssistantSubmissionsPage from "./pages/assistant/AssistantSubmissionsPage";
import AssistantNotificationsPage from "./pages/assistant/AssistantNotificationsPage";
import AssistantIncomePage from "./pages/assistant/AssistantIncomePage";
import AssistantProfilePage from "./pages/assistant/AssistantProfilePage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminUserDetailPage from "./pages/admin/AdminUserDetailPage";
import AdminRolesPage from "./pages/admin/AdminRolesPage";
import AdminSeriesMonitoringPage from "./pages/admin/AdminSeriesMonitoringPage";
import AdminWorkflowMonitoringPage from "./pages/admin/AdminWorkflowMonitoringPage";
import AdminAiManagementPage from "./pages/admin/AdminAiManagementPage";
import AdminReportsAnalyticsPage from "./pages/admin/AdminReportsAnalyticsPage";
import AdminStoragePage from "./pages/admin/AdminStoragePage";
import AdminModerationPage from "./pages/admin/AdminModerationPage";
import AdminSystemSettingsPage from "./pages/admin/AdminSystemSettingsPage";
import AdminNotificationsPage from "./pages/admin/AdminNotificationsPage";
import ChapterManagementPage from "./pages/chapters/ChapterManagement";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/trending" element={<TrendingPage />} />
        <Route path="/genres" element={<GenresPage />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="/creator" element={<CreatorPage />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/app" element={<DashboardLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        <Route path="series" element={<SeriesListPage />} />
        <Route path="series/create" element={<CreateSeriesPage />} />
        <Route path="series/approval" element={<ApprovalPage />} />
        <Route path="series/:id" element={<SeriesDetailPage />} />

        <Route path="chapters" element={<ChapterManagementPage />} />
        <Route path="manuscripts" element={<Navigate to="/app/chapters" replace />} />
        <Route path="manuscripts/submit" element={<SubmissionPage />} />
        <Route path="manuscripts/review" element={<Navigate to="/app/reviews" replace />} />
        <Route path="reviews" element={<ReviewPage />} />

        <Route path="tasks" element={<TaskBoardPage />} />
        <Route path="tasks/:id" element={<TaskDetailPage />} />

        <Route path="assistants" element={<AssistantsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="ranking" element={<RankingPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="/assistant" element={<AssistantLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AssistantDashboardPage />} />
        <Route path="tasks" element={<AssistantTasksPage />} />
        <Route path="tasks/:id" element={<AssistantTaskDetailPage />} />
        <Route path="chapters" element={<AssistantChaptersPage />} />
        <Route path="submissions" element={<AssistantSubmissionsPage />} />
        <Route path="notifications" element={<AssistantNotificationsPage />} />
        <Route path="income" element={<AssistantIncomePage />} />
        <Route path="profile" element={<AssistantProfilePage />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="users/:id" element={<AdminUserDetailPage />} />
<Route path="roles" element={<AdminRolesPage />} />
        <Route path="series" element={<AdminSeriesMonitoringPage />} />
        <Route path="workflow" element={<AdminWorkflowMonitoringPage />} />
        <Route path="ai" element={<AdminAiManagementPage />} />
        <Route path="reports" element={<AdminReportsAnalyticsPage />} />
        <Route path="storage" element={<AdminStoragePage />} />
        <Route path="moderation" element={<AdminModerationPage />} />
        <Route path="settings" element={<AdminSystemSettingsPage />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}