import type { ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  ImagePlus,
  Send,
  Upload,
} from "lucide-react";
import { assistants, chapterPipeline, mangakaSeries } from "../../shared/constants/mangakaWorkSpace";


const workflowSteps = ["Script", "Storyboard", "Lineart", "Tone", "Review", "Publish"] as const;

export default function ChapterManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Chapter Management
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            Upload, track, and publish chapters
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Manage the core workflow from manuscript upload to assistant work,
            review, revision, and final publishing submission.
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-100">
          <Send size={16} />
          Submit Publish
        </button>
      </div>

      <section className="grid gap-5 xl:grid-cols-[1fr_24rem]">
        <article className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">Current Pipeline</h3>
              <p className="mt-1 text-sm text-slate-400">
                Chapter status across your active series.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-sm text-rose-100">
              <AlertTriangle size={16} />
              3 deadline alerts
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {chapterPipeline.map((chapter) => (
              <article
                key={chapter.id}
                className="rounded-lg border border-white/10 bg-white/5 p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-slate-950/80 px-2 py-1 text-xs font-semibold text-slate-300">
                        {chapter.chapter}
                      </span>
                      <span className={statusTone(chapter.status)}>
                        {chapter.status}
                      </span>
                    </div>
                    <h4 className="mt-3 text-xl font-bold text-white">
                      {chapter.title}
                    </h4>
<p className="mt-1 text-sm text-slate-400">
                      {chapter.series} • {chapter.manuscript}
                    </p>
                  </div>
                  <dl className="grid grid-cols-3 gap-2 text-sm sm:min-w-80">
                    <Info label="Pages" value={chapter.pages} />
                    <Info label="Owner" value={chapter.owner} />
                    <Info label="Due" value={chapter.due} />
                  </dl>
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Progress tracking</span>
                    <span className="font-semibold text-white">
                      {chapter.progress}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-300"
                      style={{ width: `${chapter.progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-5 grid gap-2 md:grid-cols-6">
                  {workflowSteps.map((step, index) => {
                    const isDone = chapter.progress >= (index + 1) * 16;

                    return (
                      <div
                        key={step}
                        className={`rounded-lg border p-2 text-center text-xs font-semibold ${
                          isDone
                            ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
                            : "border-white/10 bg-slate-950/60 text-slate-500"
                        }`}
                      >
                        {step}
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </article>

        <aside className="space-y-5">
          <section className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-300 text-slate-950">
                <Upload size={18} />
              </span>
              <div>
                <h3 className="font-bold text-white">Manuscript Upload</h3>
                <p className="text-sm text-slate-400">Chapter production file</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <select className="input">
                {mangakaSeries.map((series) => (
                  <option key={series.id}>{series.title}</option>
                ))}
              </select>
              <input className="input" placeholder="Chapter title" />
<label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-cyan-300/30 bg-cyan-300/5 p-5 text-center hover:bg-cyan-300/10">
                <FileText className="text-cyan-200" size={28} />
                <span className="mt-2 text-sm font-semibold text-white">
                  Upload manuscript
                </span>
                <span className="text-xs text-slate-400">PSD, CLIP, PDF, ZIP</span>
                <input type="file" className="sr-only" />
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-300 text-slate-950">
                <ImagePlus size={18} />
              </span>
              <div>
                <h3 className="font-bold text-white">Page Upload</h3>
                <p className="text-sm text-slate-400">Individual page handoff</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              <input className="input" placeholder="Page range: 01-08" />
              <input className="input" type="file" multiple />
              <select className="input">
                {assistants.map((assistant) => (
                  <option key={assistant.name}>{assistant.name}</option>
                ))}
              </select>
              <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-100">
                <Upload size={16} />
                Upload Pages
              </button>
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
            <h3 className="font-bold text-white">Production Health</h3>
            <div className="mt-4 space-y-3">
              <Health icon={<CheckCircle2 size={16} />} label="Ready for review" value="2" />
              <Health icon={<Clock size={16} />} label="Due within 48h" value="3" />
              <Health icon={<FileText size={16} />} label="Open page batches" value="9" />
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}

function statusTone(status: string) {
  if (status === "Completed") {
    return "rounded-md border border-emerald-300/30 bg-emerald-300/10 px-2 py-1 text-xs font-semibold text-emerald-100";
  }

  if (status === "Review") {
    return "rounded-md border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-xs font-semibold text-amber-100";
  }

  if (status === "In Progress") {
    return "rounded-md border border-cyan-300/30 bg-cyan-300/10 px-2 py-1 text-xs font-semibold text-cyan-100";
  }

  return "rounded-md border border-slate-600 bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-300";
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/50 p-2">
      <dt className="text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 truncate font-semibold text-slate-100">{value}</dd>
    </div>
  );
}

function Health({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3">
      <div className="flex items-center gap-2 text-slate-300">
        <span className="text-cyan-200">{icon}</span>
        <span className="text-sm">{label}</span>
      </div>
      <span className="font-bold text-white">{value}</span>
    </div>
  );
}