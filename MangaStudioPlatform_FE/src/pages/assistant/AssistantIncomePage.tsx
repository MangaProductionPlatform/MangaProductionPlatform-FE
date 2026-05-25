import type { ReactNode } from "react";
import { CheckCircle2, Clock, Wallet } from "lucide-react";
import { assistantPerformance, incomeHistory } from "../../shared/constants/assistantWorkSpace";


export default function AssistantIncomePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
          Income
        </p>
        <h2 className="mt-2 text-3xl font-black text-white">
          Completed work and payments
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Optional studio finance view for completed tasks, monthly income, and
          payment history.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Metric icon={<Wallet size={18} />} label="This Month" value="$1,420" note="18 completed tasks" />
        <Metric icon={<CheckCircle2 size={18} />} label="Approved Tasks" value="138" note="lifetime" />
        <Metric icon={<Clock size={18} />} label="Pending" value="$320" note="processing" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_24rem]">
        <article className="rounded-lg border border-white/10 bg-slate-900 p-5">
          <h3 className="text-lg font-bold text-white">Payment History</h3>
          <div className="mt-5 space-y-3">
            {incomeHistory.map((item) => (
              <div
                key={item.period}
                className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-bold text-white">{item.period}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {item.completedTasks} completed tasks
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-white">{item.income}</p>
                  <p className="text-sm text-slate-500">{item.status}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-white/10 bg-slate-900 p-5">
          <h3 className="text-lg font-bold text-white">Monthly Performance</h3>
          <div className="mt-6 grid h-64 grid-cols-5 items-end gap-3">
            {assistantPerformance.map((item) => (
              <div key={item.label} className="flex h-full flex-col justify-end">
                <div
                  className="rounded-t-md bg-cyan-300/85"
                  style={{ height: `${item.completed}%` }}
                />
                <p className="mt-3 text-center text-xs text-slate-500">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
note,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <article className="rounded-lg border border-white/10 bg-slate-900 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{label}</p>
        <span className="text-cyan-200">{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{note}</p>
    </article>
  );
}