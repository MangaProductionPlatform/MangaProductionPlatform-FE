import { CheckCircle2 } from "lucide-react";
import EmptyBackendState from "../../shared/components/EmptyBackendState";

export default function ReviewPage() {
  return (
    <EmptyBackendState
      icon={CheckCircle2}
      title="Review results are not available yet"
      description="Review outcomes, annotations, page previews, and approval actions will appear here when they are available."
    />
  );
}
