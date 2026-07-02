import { EmptyBackendState } from "../../shared/components/EmptyBackendState";
import "./RankingVoteManagementPage.css";

export default function RankingAnalyticsPage() {
  return (
    <div className="ranking-vote-management-page">
      <EmptyBackendState
        eyebrow="Board"
        title="Ranking analytics"
        description="Use the Ranking page for backend ranking-board data."
      />
    </div>
  );
}
