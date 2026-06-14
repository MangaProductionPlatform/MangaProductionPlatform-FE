import type { ComponentType, ReactNode } from "react";
import { Database, type LucideProps } from "lucide-react";
import CoverMarquee from "./CoverMarquee";

export function EmptyBackendState({
  eyebrow,
  title,
  description,
  icon,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  icon?: ComponentType<LucideProps>;
  action?: ReactNode;
}) {
  const Icon = icon ?? Database;

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

      <section className="overflow-hidden rounded-lg border border-white/10 bg-slate-900/75">
        <div className="border-b border-white/10 py-5">
          <CoverMarquee compact />
        </div>
        <div className="p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-300 text-slate-950">
            <Icon size={22} />
          </div>
          <h3 className="mt-4 text-lg font-bold text-white">No backend data</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">
            This page will display records after the backend exposes a matching
            API.
          </p>
          {action ? <div className="mt-5">{action}</div> : null}
        </div>
      </section>
    </div>
  );
}

export default EmptyBackendState;
