import type { ReactNode } from "react";
import { BookOpen, ImagePlus, Save, Send, Tags, Upload } from "lucide-react";

const tagSuggestions = ["Shonen", "Drama", "Mystery", "Romance", "Sports", "Urban Fantasy"];
const publishChecklist = [
  "Series bible prepared",
  "Main cast profiles",
  "Cover concept uploaded",
  "Chapter 1 outline",
] as const;

export default function CreateSeriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Create Series
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            Start a new manga title
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Define the title, genre, description, cover, and tags before the
            first chapter enters production.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
            <Save size={16} />
            Save Draft
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-100">
            <Send size={16} />
            Submit
          </button>
        </div>
      </div>

      <form className="grid gap-5 xl:grid-cols-[1fr_22rem]">
        <section className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Title">
              <input className="input" placeholder="Aurora Blade" />
            </Field>
            <Field label="Genre">
              <select className="input">
                <option>Cyber Fantasy</option>
                <option>Slice of Life</option>
                <option>Sports Drama</option>
                <option>Mystery</option>
                <option>Action Comedy</option>
              </select>
            </Field>
          </div>

          <div className="mt-5">
            <Field label="Description">
              <textarea
                className="input min-h-40 resize-y"
                placeholder="A concise story pitch, target audience, key hook, and long-term arc."
              />
            </Field>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.85fr]">
            <Field label="Cover Upload">
              <label className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-cyan-300/30 bg-cyan-300/5 p-6 text-center transition hover:bg-cyan-300/10">
                <ImagePlus className="text-cyan-200" size={36} />
<span className="mt-3 text-sm font-semibold text-white">
                  Upload cover artwork
                </span>
                <span className="mt-1 text-xs text-slate-400">
                  PNG, JPG, or WebP
                </span>
                <input type="file" className="sr-only" />
              </label>
            </Field>

            <Field label="Tags">
              <div className="rounded-lg border border-white/10 bg-slate-950/70 p-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <Tags size={16} />
                  <input
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                    placeholder="Add tag"
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {tagSuggestions.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </Field>
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-300 text-slate-950">
                <BookOpen size={18} />
              </span>
              <div>
                <h3 className="font-bold text-white">Series package</h3>
                <p className="text-sm text-slate-400">Draft readiness</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {publishChecklist.map((item, index) => (
                <label
                  key={item}
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-200"
                >
                  <input
                    type="checkbox"
                    defaultChecked={index < 2}
                    className="h-4 w-4 accent-cyan-300"
                  />
                  {item}
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-300 text-slate-950">
                <Upload size={18} />
              </span>
              <div>
                <h3 className="font-bold text-white">Initial assets</h3>
                <p className="text-sm text-slate-400">Optional launch files</p>
</div>
            </div>
            <div className="mt-5 space-y-3">
              <input className="input" type="file" />
              <input className="input" placeholder="Reference board URL" />
              <input className="input" placeholder="Target first deadline" />
            </div>
          </section>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-200">
        {label}
      </span>
      {children}
    </div>
  );
}