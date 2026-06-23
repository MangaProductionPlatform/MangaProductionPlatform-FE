import { Trophy } from "lucide-react";
import EmptyBackendState from "../../shared/components/EmptyBackendState";

export default function RankingPage() {
  return (
    <div className="min-h-screen bg-[#050816] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <EmptyBackendState
          eyebrow="Ranking"
          title="Weekly manga ranking"
          icon={Trophy}
          description="BE có module/domain Ranking nhưng chưa expose RankingController hay route /api/v1/ranking. Trang này không còn gọi endpoint chưa tồn tại."
        />
      </div>
    </div>
  );
}
