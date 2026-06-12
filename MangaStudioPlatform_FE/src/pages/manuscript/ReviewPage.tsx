import { CheckCircle2 } from "lucide-react";
import EmptyBackendState from "../../shared/components/EmptyBackendState";

export default function ReviewPage() {
  return (
    <EmptyBackendState
      icon={CheckCircle2}
      title="No backend review results API yet"
      description="Assistant review results, annotations, page previews, and approval actions will appear after the backend exposes review-result endpoints."
    />
  );
}
