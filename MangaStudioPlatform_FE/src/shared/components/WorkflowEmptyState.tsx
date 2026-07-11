import type { ComponentType } from "react";
import { RefreshCw, type LucideProps } from "lucide-react";
import { Link } from "react-router-dom";

type WorkflowEmptyStateProps = {
  icon: ComponentType<LucideProps>;
  title: string;
  description: string;
  actionLabel: string;
  actionTo: string;
  onRefresh?: () => void;
};

export function WorkflowEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionTo,
  onRefresh,
}: WorkflowEmptyStateProps) {
  return (
    <section className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/10">
      <div className="flex max-w-md flex-col items-start gap-4 sm:flex-row">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
          <Icon size={20} />
        </span>
        <div>
          <h3 className="font-bold text-white">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to={actionTo}
              className="btn-primary inline-flex items-center"
            >
              {actionLabel}
            </Link>
            {onRefresh ? (
              <button
                type="button"
                onClick={onRefresh}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <RefreshCw size={15} />
                Refresh
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export default WorkflowEmptyState;
