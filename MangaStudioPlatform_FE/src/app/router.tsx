import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import AssistantLayout from "../layouts/AssistantLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import PublicLayout from "../layouts/PublicLayout";
import { RequireRole } from "../shared/components/RequireRole";
import AdminCreateUserPage from "../pages/admin/AdminCreateUserPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminNotificationsPage from "../pages/admin/AdminNotificationsPage";
import AdminRoleDetailPage from "../pages/admin/AdminRoleDetailPage";
import AdminRolesPage from "../pages/admin/AdminRolesPage";
import AdminUserDetailPage from "../pages/admin/AdminUserDetailPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AnalyticsPage from "../pages/analytics/AnalyticsPage";
import AssistantChaptersPage from "../pages/assistant/AssistantChaptersPage";
import AssistantDashboardPage from "../pages/assistant/AssistantDashboardPage";
import AssistantIncomePage from "../pages/assistant/AssistantIncomePage";
import AssistantNotificationsPage from "../pages/assistant/AssistantNotificationsPage";
import AssistantProfilePage from "../pages/assistant/AssistantProfilePage";
import AssistantTaskDetailPage from "../pages/assistant/AssistantTaskDetailPage";
import AssistantTasksPage from "../pages/assistant/AssistantTasksPage";
import AssistantsPage from "../pages/assistants/AssistantsPage";
import ActivateAccountPage from "../pages/auth/ActivateAccountPage";
import LoginPage from "../pages/auth/LoginPage";
import BoardDashboardPage from "../pages/board/BoardDashboardPage";
import BoardNotificationsPage from "../pages/board/BoardNotificationsPage";
import BoardProfilePage from "../pages/board/BoardProfilePage";
import CancellationReviewPage from "../pages/board/CancellationReviewPage";
import PublishingSchedulePage from "../pages/board/PublishingSchedulePage";
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
import MangakaDashboardPage from "../pages/mangaka/MangakaDashboardPage";
import TaskAssignmentPage from "../pages/mangaka/TaskAssignmentPage";
import LayerReviewPage from "../pages/mangaka/LayerReviewPage";
import QaSubmissionPage from "../pages/mangaka/QaSubmissionPage";
import MangakaProfilePage from "../pages/mangaka/MangakaProfilePage";


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
      <Route path="/activate" element={<ActivateAccountPage />} />

      <Route path="/app" element={<DashboardLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route element={<RequireRole roles={["editor"]} />}>
          <Route path="editor/dashboard" element={<EditorWorkspacePage />} />
          <Route path="editor/review-queue" element={<ReviewQueuePage />} />
          <Route path="editor/series-monitoring" element={<SeriesMonitoringPage />} />
          <Route path="editor/annotations" element={<AnnotationsPage />} />
          <Route path="editor/publishing-queue" element={<PublishingQueuePage />} />
          <Route path="editor/ranking-reports" element={<Navigate to="/app/editor/dashboard" replace />} />
          <Route path="editor/notifications" element={<EditorNotificationsPage />} />
          <Route path="editor/profile" element={<EditorProfilePage />} />
        </Route>
        <Route element={<RequireRole roles={["editorial_board", "editor_in_chief"]} />}>
          <Route path="board/dashboard" element={<BoardDashboardPage />} />
          <Route path="board/series-proposals" element={<SeriesProposalsPage />} />
          <Route path="board/voting-center" element={<VotingCenterPage />} />
          <Route path="board/publishing-schedule" element={<PublishingSchedulePage />} />
          <Route path="board/ranking-analytics" element={<Navigate to="/app/board/dashboard" replace />} />
          <Route path="board/cancellation-review" element={<CancellationReviewPage />} />
          <Route path="board/reports" element={<ReportsPage />} />
          <Route path="board/notifications" element={<BoardNotificationsPage />} />
          <Route path="board/profile" element={<BoardProfilePage />} />
        </Route>

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

      <Route element={<RequireRole roles={["assistant"]} />}>
        <Route path="/assistant" element={<AssistantLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AssistantDashboardPage />} />
          <Route path="tasks" element={<AssistantTasksPage />} />
          <Route path="tasks/:id" element={<AssistantTaskDetailPage />} />
          <Route path="chapters" element={<AssistantChaptersPage />} />
          <Route path="submissions" element={<Navigate to="/assistant/tasks" replace />} />
          <Route path="notifications" element={<AssistantNotificationsPage />} />
          <Route path="income" element={<AssistantIncomePage />} />
          <Route path="profile" element={<AssistantProfilePage />} />
        </Route>
      </Route>

      <Route element={<RequireRole roles={["mangaka"]} />}>
        <Route path="/mangaka" element={<DashboardLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<MangakaDashboardPage />} />
          <Route path="submissions" element={<SubmissionPage />} />
          <Route path="series" element={<SeriesListPage />} />
          <Route path="series/:id" element={<SeriesDetailPage />} />
          <Route path="assistants" element={<AssistantsPage />} />
          <Route path="chapters" element={<ChapterManagementPage />} />
          <Route path="task-assignment" element={<TaskAssignmentPage />} />
          <Route path="layer-review" element={<LayerReviewPage />} />
          <Route path="qa-submission" element={<QaSubmissionPage />} />
          <Route path="profile" element={<MangakaProfilePage />} />
        </Route>
      </Route>


      <Route element={<RequireRole roles={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="users/create" element={<AdminCreateUserPage />} />
          <Route path="users/:id" element={<AdminUserDetailPage />} />
          <Route path="roles" element={<AdminRolesPage />} />
          <Route path="roles/:roleValue" element={<AdminRoleDetailPage />} />
          <Route path="series" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="workflow" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="ai" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="reports" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="storage" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="moderation" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="settings" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
