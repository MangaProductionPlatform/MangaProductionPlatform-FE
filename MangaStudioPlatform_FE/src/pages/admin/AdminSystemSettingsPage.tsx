import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ClipboardList,
  Gauge,
  GitBranch,
  Save,
  Settings,
  ToggleLeft,
} from "lucide-react";

const flowSettings = [
  {
    flow: "MF1",
    title: "Series Proposal & Approval",
    owner: "Mangaka -> Editorial Board",
    description:
      "Submission storage, revision loop, board vote handoff, and IP gatekeeping.",
    icon: ClipboardList,
    metrics: [
      { label: "Open submissions", value: "29" },
      { label: "Board SLA", value: "48h" },
      { label: "Revision rounds", value: "3 max" },
    ],
  },
  {
    flow: "MF2 + MF7",
    title: "AI-assisted Chapter Production",
    owner: "Mangaka -> Assistant -> AI",
    description:
      "Task breakdown, assistant claiming, panel detection, base coloring, and recursive page assembly.",
    icon: Bot,
    metrics: [
      { label: "Active chapter tasks", value: "128" },
      { label: "AI confidence gate", value: "86%" },
      { label: "Assist workload cap", value: "76%" },
    ],
  },
  {
    flow: "MF4",
    title: "Studio Risk Management",
    owner: "System -> Tantou Editor",
    description:
      "Live production metrics, deadline risk scoring, workload balance, and escalation rules.",
    icon: Gauge,
    metrics: [
      { label: "High-risk titles", value: "17" },
      { label: "Metric refresh", value: "5m" },
      { label: "Escalation lead time", value: "24h" },
    ],
  },
  {
    flow: "MF3",
    title: "Editorial QA Bottleneck",
    owner: "Mangaka -> Editor",
    description:
      "Final chapter quality review after page assembly, annotation pass, and revision decision.",
    icon: CheckCircle2,
    metrics: [
      { label: "Editor queue", value: "41" },
      { label: "QA SLA", value: "24h" },
      { label: "Blocker threshold", value: "12h" },
    ],
  },
] as const;

const policies = [
  {
    label: "Submission package limit",
    value: "2 GB per proposal",
    helper: "Applies to MF1 manuscript, concept art, and pitch archive uploads.",
  },
  {
    label: "AI acceptance threshold",
    value: "86% confidence",
    helper: "Controls MF2/MF7 panel detection and base coloring auto-acceptance.",
  },
  {
    label: "Deadline risk trigger",
    value: "24h before due date",
    helper: "Drives MF4 dashboard warnings for Tantou Editors.",
  },
  {
    label: "Editorial QA capacity",
    value: "12 chapters per editor",
    helper: "Caps MF3 bottleneck load before routing to backup editors.",
  },
] as const;

const bottlenecks = [
  {
    label: "MF1 submission backlog",
    value: "29 proposals",
    severity: "Medium",
  },
  {
    label: "MF2/MF7 assistant handoff",
    value: "17 overdue tasks",
    severity: "High",
  },
  {
    label: "MF4 deadline risk",
    value: "5 critical series",
    severity: "High",
  },
  {
    label: "MF3 QA queue",
    value: "41 chapters",
    severity: "High",
  },
] as const;

export default function AdminSystemSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            System Settings
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            Main flow configuration
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Operational controls for proposal approval, AI-assisted chapter
            production, studio risk metrics, and editorial QA.
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-100">
          <Save size={16} />
          Save Settings
        </button>
      </div>

      <section className="grid gap-5 xl:grid-cols-4">
        {flowSettings.map((flow) => {
          const Icon = flow.icon;

          return (
            <article
              key={flow.flow}
              className="rounded-lg border border-white/10 bg-slate-900 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
                    {flow.flow}
                  </p>
                  <h3 className="mt-2 font-bold text-white">{flow.title}</h3>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-300 text-slate-950">
                  <Icon size={18} />
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-300">
                {flow.owner}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {flow.description}
              </p>
              <div className="mt-5 space-y-2">
                {flow.metrics.map((metric) => (
                  <div
                    key={`${flow.flow}-${metric.label}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-3"
                  >
                    <span className="text-sm text-slate-400">
                      {metric.label}
                    </span>
                    <span className="text-sm font-bold text-white">
                      {metric.value}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_22rem]">
        <main className="rounded-lg border border-white/10 bg-slate-900 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-cyan-200">
              <GitBranch size={18} />
            </span>
            <div>
              <h3 className="font-bold text-white">Flow Policies</h3>
              <p className="text-sm text-slate-400">
                Thresholds that directly affect the four main production flows.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {policies.map((policy) => (
              <label
                key={policy.label}
                className="rounded-lg border border-white/10 bg-white/5 p-4"
              >
                <span className="mb-2 block text-sm font-bold text-white">
                  {policy.label}
                </span>
                <input className="input" defaultValue={policy.value} />
                <span className="mt-2 block text-xs leading-5 text-slate-500">
                  {policy.helper}
                </span>
              </label>
            ))}
          </div>
        </main>

        <aside className="rounded-lg border border-white/10 bg-slate-900 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-300 text-slate-950">
              <Settings size={18} />
            </span>
            <div>
              <h3 className="font-bold text-white">Runtime Controls</h3>
              <p className="text-sm text-slate-400">Operational toggles</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <ToggleRow label="Maintenance mode" active={false} />
            <ToggleRow label="MF1 submission intake" active />
            <ToggleRow label="MF2/MF7 AI task assist" active />
            <ToggleRow label="MF4 risk dashboard sync" active />
            <ToggleRow label="MF3 editor QA routing" active />
          </div>
        </aside>
      </section>

      <section className="rounded-lg border border-white/10 bg-slate-900 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">
              Bottleneck Watchlist
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Main-flow queues that need admin visibility before deadlines slip.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm font-semibold text-amber-100">
            <AlertTriangle size={16} />
            3 high-risk queues
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {bottlenecks.map((item) => (
            <article
              key={item.label}
              className="rounded-lg border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-white">{item.label}</p>
                  <p className="mt-2 text-sm text-slate-400">{item.value}</p>
                </div>
                <span className={severityTone(item.severity)}>
                  {item.severity}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function ToggleRow({ label, active }: { label: string; active?: boolean }) {
  return (
    <button className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 text-left text-sm font-semibold text-slate-200 hover:bg-white/10">
      {label}
      <span
        className={
          active
            ? "inline-flex items-center gap-1 text-emerald-100"
            : "inline-flex items-center gap-1 text-slate-500"
        }
      >
        <ToggleLeft size={18} />
        {active ? "On" : "Off"}
      </span>
    </button>
  );
}

function severityTone(severity: string) {
  if (severity === "High") {
    return "rounded-md border border-rose-300/30 bg-rose-300/10 px-2 py-1 text-xs font-bold text-rose-100";
  }

  return "rounded-md border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-xs font-bold text-amber-100";
}
