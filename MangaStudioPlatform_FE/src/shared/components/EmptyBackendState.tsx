import type { ComponentType, ReactNode } from "react";
import { Inbox, RefreshCw, type LucideProps } from "lucide-react";

export function EmptyBackendState({
  eyebrow,
  title,
  description,
  icon,
  action,
  emptyTitle,
  emptyDescription,
  onRefresh,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  icon?: ComponentType<LucideProps>;
  action?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  onRefresh?: () => void;
}) {
  const Icon = icon ?? Inbox;

  return (
    <div className="space-y-6">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-2 text-3xl font-black text-white">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          {description}
        </p>
      </div>

      <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/15">
        <div className="flex max-w-md flex-col items-start gap-4 sm:flex-row">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
            <Icon size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{emptyTitle ?? "Nothing to show yet"}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {emptyDescription ?? "New items will appear here when they are available to your workspace."}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {onRefresh ? <button type="button" onClick={onRefresh} className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/15"><RefreshCw size={15} />Refresh</button> : null}
              {action}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default EmptyBackendState;
