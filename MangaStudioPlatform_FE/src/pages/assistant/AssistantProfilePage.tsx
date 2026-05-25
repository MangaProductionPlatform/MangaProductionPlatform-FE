import type { ReactNode } from "react";
import { Mail, Save, Star, User } from "lucide-react";
import { assistantProfile } from "../../shared/constants/assistantWorkSpace";

export default function AssistantProfilePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            Profile
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            Assistant skills and specialization
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Keep your worker profile focused on production skills, availability,
            and assignment matching.
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-100">
          <Save size={16} />
          Save Profile
        </button>
      </div>

      <section className="grid gap-5 xl:grid-cols-[22rem_1fr]">
        <aside className="rounded-lg border border-white/10 bg-slate-900 p-5">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-cyan-300 text-3xl font-black text-slate-950">
              NW
            </div>
            <h3 className="mt-4 text-xl font-black text-white">
              {assistantProfile.name}
            </h3>
            <p className="mt-1 text-sm text-slate-400">{assistantProfile.role}</p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <Info label="Rating" value={assistantProfile.rating} />
            <Info label="Completed" value={assistantProfile.completedTasks} />
          </div>
        </aside>

        <main className="rounded-lg border border-white/10 bg-slate-900 p-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Field icon={<User size={16} />} label="Display name">
              <input className="input" defaultValue={assistantProfile.name} />
            </Field>
            <Field icon={<Mail size={16} />} label="Email">
              <input className="input" defaultValue={assistantProfile.email} />
            </Field>
            <Field icon={<Star size={16} />} label="Specialization">
              <input
                className="input"
                defaultValue={assistantProfile.specialization}
              />
            </Field>
            <Field icon={<User size={16} />} label="Availability">
              <select className="input">
                <option>Available for tasks</option>
                <option>Limited availability</option>
                <option>Unavailable</option>
              </select>
            </Field>
          </div>

          <section className="mt-6">
<h3 className="font-bold text-white">Skills</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {assistantProfile.skills.map((skill) => (
                <label
                  key={skill}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200"
                >
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 accent-cyan-300"
                  />
                  {skill}
                </label>
              ))}
            </div>
          </section>
        </main>
      </section>
    </div>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-200">
        <span className="text-cyan-200">{icon}</span>
        {label}
      </span>
      {children}
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-bold text-white">{value}</p>
    </div>
  );
}