import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import SeriesListPage from "./pages/series/SeriesListPage";
import CreateSeriesPage from "./pages/series/CreateSeriesPage";
import SeriesDetailPage from "./pages/series/SeriesDetailPage";
import ApprovalPage from "./pages/series/ApprovalPage";
import ManuscriptPage from "./pages/manuscript/ManuscriptPage";
import ReviewPage from "./pages/manuscript/ReviewPage";
import SubmissionPage from "./pages/manuscript/SubmissionPage";
import TaskBoardPage from "./pages/tasks/TaskBoardPage";
import TaskDetailPage from "./pages/tasks/TaskDetailPage";
import RankingPage from "./pages/ranking/RankingPage";
import ProfilePage from "./pages/profile/ProfilePage";
import EditorWorkspacePage from "./pages/editors/EditorWorkspacePage";
import ReviewQueuePage from "./pages/editors/ReviewQueuePage";
import SeriesMonitoringPage from "./pages/editors/SeriesMonitoringPage";
import AnnotationsPage from "./pages/editors/AnnotationsPage";
import PublishingQueuePage from "./pages/editors/PublishingQueuePage";
import RankingReportsPage from "./pages/editors/RankingReportsPage";
import NotificationsPage from "./pages/editors/NotificationsPage";
import EditorProfilePage from "./pages/editors/EditorProfilePage";
import BoardDashboardPage from "./pages/board/BoardDashboardPage";
import SeriesProposalsPage from "./pages/board/SeriesProposalsPage";
import VotingCenterPage from "./pages/board/VotingCenterPage";
import ReportsPage from "./pages/board/ReportsPage";
import BoardNotificationsPage from "./pages/board/BoardNotificationsPage";
import BoardProfilePage from "./pages/board/BoardProfilePage";
import PublishingSchedulePage from "./pages/board/PublishingSchedulePage";
import RankingAnalyticsPage from "./pages/board/RankingAnalyticsPage";
import CancellationReviewPage from "./pages/board/CancellationReviewPage";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />

        <Route path="/app" element={<DashboardLayout />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="editor/dashboard" element={<EditorWorkspacePage />} />
        <Route path="editor/review-queue" element={<ReviewQueuePage />} />
        <Route path="editor/series-monitoring" element={<SeriesMonitoringPage />} />
        <Route path="editor/annotations" element={<AnnotationsPage />} />
        <Route path="editor/publishing-queue" element={<PublishingQueuePage />} />
        <Route path="editor/ranking-reports" element={<RankingReportsPage />} />
        <Route path="editor/notifications" element={<NotificationsPage />} />
        <Route path="editor/profile" element={<EditorProfilePage />} />
        <Route path="board/dashboard" element={<BoardDashboardPage />}/>
        <Route path="board/series-proposals" element={<SeriesProposalsPage />} />
        <Route path="board/voting-center" element={<VotingCenterPage />} />
        <Route path="board/publishing-schedule" element={<PublishingSchedulePage />} />
        <Route path="board/ranking-analytics" element={<RankingAnalyticsPage />}/>
        <Route path="board/cancellation-review"  element={<CancellationReviewPage />} />
        <Route path="board/reports" element={<ReportsPage />}/>
        <Route path="board/notifications"element={<BoardNotificationsPage />} />
        <Route path="board/profile" element={<BoardProfilePage />} />

        <Route path="series" element={<SeriesListPage />} />
        <Route path="series/create" element={<CreateSeriesPage />} />
        <Route path="series/:id" element={<SeriesDetailPage />} />
        <Route path="series/approval" element={<ApprovalPage />} />

        <Route path="manuscripts" element={<ManuscriptPage />} />
        <Route path="manuscripts/submit" element={<SubmissionPage />} />
        <Route path="manuscripts/review" element={<ReviewPage />} />

        <Route path="tasks" element={<TaskBoardPage />} />
        <Route path="tasks/:id" element={<TaskDetailPage />} />

        <Route path="ranking" element={<RankingPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}