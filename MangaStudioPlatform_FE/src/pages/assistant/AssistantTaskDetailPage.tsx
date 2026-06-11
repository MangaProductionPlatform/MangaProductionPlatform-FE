import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { EmptyBackendState } from "../../shared/components/EmptyBackendState";

export default function AssistantTaskDetailPage() {
  return (
    <div className="space-y-5">
      <Link to="/assistant/tasks" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 hover:text-cyan-100">
        <ArrowLeft size={16} />
        Back to My Tasks
      </Link>
      <EmptyBackendState eyebrow="Assistant" title="Task detail" description="A backend task detail API is not available yet." />
    </div>
  );
}
