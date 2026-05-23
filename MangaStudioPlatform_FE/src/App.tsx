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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route path="/app" element={<DashboardLayout />}>
        <Route path="dashboard" element={<DashboardPage />} />

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