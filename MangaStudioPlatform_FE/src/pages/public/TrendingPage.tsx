import { ArrowRight, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import EmptyBackendState from "../../shared/components/EmptyBackendState";

export default function TrendingPage() {
  return (
    <div className="min-h-screen bg-[#050816] px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <EmptyBackendState
          icon={Flame}
          title="No backend trending feed yet"
          description="Use the ranking service when it is running to demo real ranking data."
          action={
            <Link
              to="/ranking"
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-200"
            >
              Open Ranking
              <ArrowRight size={16} />
            </Link>
          }
        />
      </div>
    </div>
  );
}
