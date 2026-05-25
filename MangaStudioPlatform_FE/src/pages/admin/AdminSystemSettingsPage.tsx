import { Save, Settings, ToggleLeft } from "lucide-react";

const settings = [
  {
    label: "Upload limit",
    value: "2 GB per file",
  },
  {
    label: "Ranking threshold",
    value: "Minimum 1,000 reads",
  },
  {
    label: "AI threshold",
    value: "86% confidence",
  },
  {
    label: "Maintenance mode",
    value: "Off",
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
            Platform configuration
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Upload limits, ranking thresholds, AI thresholds, and maintenance
            controls.
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-100">
          <Save size={16} />
          Save Settings
        </button>
      </div>

      <section className="grid gap-5 xl:grid-cols-[1fr_22rem]">
        <main className="rounded-lg border border-white/10 bg-slate-900 p-5">
          <div className="grid gap-5 md:grid-cols-2">
            {settings.map((setting) => (
              <label
                key={setting.label}
                className="rounded-lg border border-white/10 bg-white/5 p-4"
              >
                <span className="mb-2 block text-sm font-bold text-white">
                  {setting.label}
                </span>
                <input className="input" defaultValue={setting.value} />
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
            <ToggleRow label="Allow uploads" active />
            <ToggleRow label="AI processing" active />
            <ToggleRow label="Public registration" active />
          </div>
        </aside>
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
