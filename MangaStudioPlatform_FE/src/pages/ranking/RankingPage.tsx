import { Navigate, useLocation } from "react-router-dom";
import { Trophy } from "lucide-react";
import EmptyBackendState from "../../shared/components/EmptyBackendState";

export default function RankingPage() {
  const location = useLocation();

  if (location.pathname === "/ranking") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#050816] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <EmptyBackendState
          eyebrow="Ranking"
          title="Weekly manga ranking"
          icon={Trophy}
          description="Ranking data is not available in the current workspace yet."
        />
      </div>
    </div>
  );
}
