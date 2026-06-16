import { BookOpen, ClipboardCheck, FileCheck, Layers } from "lucide-react";

const stats = [
  { label: "Active Chapters", value: "6", icon: BookOpen },
  { label: "Assigned Tasks", value: "18", icon: ClipboardCheck },
  { label: "Layers Waiting Review", value: "5", icon: Layers },
  { label: "Ready for QA", value: "2", icon: FileCheck },
];

export default function MangakaDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
          Mangaka Workspace
        </p>

        <h1 className="mt-2 text-3xl font-black text-white">
          Mangaka Dashboard
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Tổng quan tiến độ chapter, task đã giao cho Assistant, layer đang chờ duyệt
          và chapter sẵn sàng gửi sang Editorial QA.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">{item.label}</p>
                <Icon size={22} className="text-cyan-300" />
              </div>

              <h2 className="mt-4 text-3xl font-black text-white">
                {item.value}
              </h2>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-bold text-white">
            Main Flow 2 Progress
          </h2>

          <div className="mt-5 space-y-4">
            {[
              "Create or select chapter",
              "Create base page",
              "Assign task to Assistant",
              "Review submitted layer",
              "Submit chapter to Editorial QA",
            ].map((step, index) => (
              <div
                key={step}
                className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/10 text-sm font-bold text-cyan-300">
                  {index + 1}
                </div>

                <p className="text-sm text-slate-300">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-bold text-white">
            Recent Activity
          </h2>

          <div className="mt-5 space-y-4">
            {[
              "Assistant A submitted LineArt for Page 1.",
              "Background layer for Page 2 is waiting review.",
              "Celestial Blade - Chapter 27 is ready for QA.",
            ].map((activity) => (
              <div
                key={activity}
                className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300"
              >
                {activity}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}