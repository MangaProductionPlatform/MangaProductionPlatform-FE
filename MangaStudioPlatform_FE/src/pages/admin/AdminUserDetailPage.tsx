import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { EmptyBackendState } from "../../shared/components/EmptyBackendState";

export default function AdminUserDetailPage() {
  return (
    <div className="space-y-5">
      <Link to="/admin/users" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 hover:text-cyan-100">
        <ArrowLeft size={16} />
        Back to Users
      </Link>
      <EmptyBackendState
        eyebrow="Admin"
        title="User detail"
        description="This page needs an admin user-detail backend endpoint."
      />
    </div>
  );
}
