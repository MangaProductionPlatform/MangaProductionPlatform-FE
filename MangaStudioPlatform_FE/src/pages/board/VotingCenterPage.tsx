import { EmptyBackendState } from "../../shared/components/EmptyBackendState";
import "./VotingCenterPage.css";

export default function VotingCenterPage() {
  return (
    <div className="voting-center-page">
      <EmptyBackendState
        eyebrow="Board"
        title="Voting center"
        description="The backend does not expose board voting APIs yet."
      />
    </div>
  );
}
