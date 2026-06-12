import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import AssistantLayout from "../layouts/AssistantLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import PublicLayout from "../layouts/PublicLayout";
import AdminAiManagementPage from "../pages/admin/AdminAiManagementPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminModerationPage from "../pages/admin/AdminModerationPage";
import AdminNotificationsPage from "../pages/admin/AdminNotificationsPage";
import AdminReportsAnalyticsPage from "../pages/admin/AdminReportsAnalyticsPage";
import AdminRolesPage from "../pages/admin/AdminRolesPage";
import AdminSeriesMonitoringPage from "../pages/admin/AdminSeriesMonitoringPage";
import AdminStoragePage from "../pages/admin/AdminStoragePage";
import AdminSystemSettingsPage from "../pages/admin/AdminSystemSettingsPage";
import AdminUserDetailPage from "../pages/admin/AdminUserDetailPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminWorkflowMonitoringPage from "../pages/admin/AdminWorkflowMonitoringPage";
import AnalyticsPage from "../pages/analytics/AnalyticsPage";
import AssistantChaptersPage from "../pages/assistant/AssistantChaptersPage";
import AssistantDashboardPage from "../pages/assistant/AssistantDashboardPage";
import AssistantIncomePage from "../pages/assistant/AssistantIncomePage";
import AssistantNotificationsPage from "../pages/assistant/AssistantNotificationsPage";
import AssistantProfilePage from "../pages/assistant/AssistantProfilePage";
import AssistantSubmissionsPage from "../pages/assistant/AssistantSubmissionsPage";
import AssistantTaskDetailPage from "../pages/assistant/AssistantTaskDetailPage";
import AssistantTasksPage from "../pages/assistant/AssistantTasksPage";
import AssistantsPage from "../pages/assistants/AssistantsPage";
import LoginPage from "../pages/auth/LoginPage";
import BoardDashboardPage from "../pages/board/BoardDashboardPage";
import BoardNotificationsPage from "../pages/board/BoardNotificationsPage";
import BoardProfilePage from "../pages/board/BoardProfilePage";
import CancellationReviewPage from "../pages/board/CancellationReviewPage";
import PublishingSchedulePage from "../pages/board/PublishingSchedulePage";
import RankingAnalyticsPage from "../pages/board/RankingAnalyticsPage";
import ReportsPage from "../pages/board/ReportsPage";
import SeriesProposalsPage from "../pages/board/SeriesProposalsPage";
import VotingCenterPage from "../pages/board/VotingCenterPage";
import ChapterManagementPage from "../pages/chapters/ChapterManagement";
import DashboardPage from "../pages/dashboard/DashboardPage";
import AnnotationsPage from "../pages/editors/AnnotationsPage";
import EditorNotificationsPage from "../pages/editors/NotificationsPage";
import EditorProfilePage from "../pages/editors/EditorProfilePage";
import EditorWorkspacePage from "../pages/editors/EditorWorkspacePage";
import PublishingQueuePage from "../pages/editors/PublishingQueuePage";
import RankingReportsPage from "../pages/editors/RankingReportsPage";
import ReviewQueuePage from "../pages/editors/ReviewQueuePage";
import SeriesMonitoringPage from "../pages/editors/SeriesMonitoringPage";
import LandingPage from "../pages/landing/LandingPage";
import ReviewPage from "../pages/manuscript/ReviewPage";
import SubmissionPage from "../pages/manuscript/SubmissionPage";
import NotificationsPage from "../pages/notifications/NotificationsPage";
import ProfilePage from "../pages/profile/ProfilePage";
import CreatorPage from "../pages/public/CreatorPage";
import DiscoverPage from "../pages/public/DiscoverPage";
import GenresPage from "../pages/public/GenresPage";
import TrendingPage from "../pages/public/TrendingPage";
import RankingPage from "../pages/ranking/RankingPage";
import ApprovalPage from "../pages/series/ApprovalPage";
import CreateSeriesPage from "../pages/series/CreateSeriesPage";
import SeriesDetailPage from "../pages/series/SeriesDetailPage";
import SeriesListPage from "../pages/series/SeriesListPage";
import TaskBoardPage from "../pages/tasks/TaskBoardPage";
import TaskDetailPage from "../pages/tasks/TaskDetailPage";

export function AppRouter() {
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

      <Route path="/app" element={<DashboardLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="editor/dashboard" element={<EditorWorkspacePage />} />
        <Route path="editor/review-queue" element={<ReviewQueuePage />} />
        <Route path="editor/series-monitoring" element={<SeriesMonitoringPage />} />
        <Route path="editor/annotations" element={<AnnotationsPage />} />
        <Route path="editor/publishing-queue" element={<PublishingQueuePage />} />
        <Route path="editor/ranking-reports" element={<RankingReportsPage />} />
        <Route path="editor/notifications" element={<EditorNotificationsPage />} />
        <Route path="editor/profile" element={<EditorProfilePage />} />
        <Route path="board/dashboard" element={<BoardDashboardPage />} />
        <Route path="board/series-proposals" element={<SeriesProposalsPage />} />
        <Route path="board/voting-center" element={<VotingCenterPage />} />
        <Route path="board/publishing-schedule" element={<PublishingSchedulePage />} />
        <Route path="board/ranking-analytics" element={<RankingAnalyticsPage />} />
        <Route path="board/cancellation-review" element={<CancellationReviewPage />} />
        <Route path="board/reports" element={<ReportsPage />} />
        <Route path="board/notifications" element={<BoardNotificationsPage />} />
        <Route path="board/profile" element={<BoardProfilePage />} />

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
