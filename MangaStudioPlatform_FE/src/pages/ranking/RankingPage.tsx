import { Navigate, useLocation } from "react-router-dom";
import { RankingWorkspace } from "../../shared/components/RankingWorkspace";

export default function RankingPage() { const location = useLocation(); return location.pathname === "/ranking" ? <Navigate to="/" replace /> : <RankingWorkspace eyebrow="Ranking" title="Manga ranking" />; }
