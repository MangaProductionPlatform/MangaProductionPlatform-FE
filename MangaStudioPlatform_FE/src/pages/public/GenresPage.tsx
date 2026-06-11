import { BookOpenText } from "lucide-react";
import EmptyBackendState from "../../shared/components/EmptyBackendState";

export default function GenresPage() {
  return (
    <div className="min-h-screen bg-[#050816] px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <EmptyBackendState
          icon={BookOpenText}
          title="No backend genres API yet"
          description="The previous genre buttons and manga shelves were hardcoded. This page now waits for real genre data from the backend."
        />
      </div>
    </div>
  );
}
