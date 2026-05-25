import type { ReactNode } from "react";
import { BookOpen, Mail, Save, ShieldCheck, User } from "lucide-react";
import { mangakaSeries } from "../../shared/constants/mangakaWorkSpace";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Profile
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            Mangaka identity
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Manage creator information, role visibility, portfolio status, and
            collaboration contact details.
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-100">
          <Save size={16} />
          Save Profile
        </button>
      </div>

      <section className="grid gap-5 xl:grid-cols-[22rem_1fr]">
        <aside className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-gradient-to-br from-amber-300 via-rose-300 to-cyan-300 text-3xl font-black text-slate-950">
              AK
            </div>
            <h3 className="mt-4 text-xl font-black text-white">Aki Kuroda</h3>
            <p className="mt-1 text-sm text-slate-400">Lead Mangaka</p>
            <span className="mt-4 inline-flex items-center gap-2 rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-sm font-semibold text-emerald-100">
              <ShieldCheck size={16} />
              Verified creator
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <Info label="Series" value={String(mangakaSeries.length)} />
            <Info label="Assistants" value="4" />
            <Info label="Reviews" value="7" />
            <Info label="Rank" value="#12" />
          </div>
        </aside>

        <main className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Field icon={<User size={16} />} label="Display name">
              <input className="input" defaultValue="Aki Kuroda" />
            </Field>
            <Field icon={<Mail size={16} />} label="Email">
              <input className="input" defaultValue="aki@mangastudio.dev" />
            </Field>
            <Field icon={<ShieldCheck size={16} />} label="Role">
              <input className="input" defaultValue="Mangaka" />
            </Field>
            <Field icon={<BookOpen size={16} />} label="Primary series">
              <select className="input">
{mangakaSeries.map((series) => (
                  <option key={series.id}>{series.title}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="mt-5">
            <Field icon={<User size={16} />} label="Bio">
              <textarea
                className="input min-h-36"
                defaultValue="Creator focused on high-energy serial manga, assistant collaboration, and weekly publishing cadence."
              />
            </Field>
          </div>
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