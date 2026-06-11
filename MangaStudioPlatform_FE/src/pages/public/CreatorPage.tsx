import { PencilLine } from "lucide-react";
import EmptyBackendState from "../../shared/components/EmptyBackendState";

export default function CreatorPage() {
  return (
    <div className="min-h-screen bg-[#050816] px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <EmptyBackendState
          icon={PencilLine}
          title="Creator showcase needs backend data"
          description="Creator onboarding needs backend data before this page can show real content."
        />
      </div>
    </div>
  );
}
