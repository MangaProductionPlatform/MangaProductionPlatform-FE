import { Send, UploadCloud } from "lucide-react";
import { assistantSubmissions } from "../../shared/constants/assistantWorkSpace";

export default function AssistantSubmissionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            Submissions
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            Uploaded work and review status
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Keep result files organized and track whether each upload is draft,
            waiting review, revision requested, or approved.
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-100">
          <UploadCloud size={16} />
          New Upload
        </button>
      </div>

      <section className="grid gap-5 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-3">
          {assistantSubmissions.map((submission) => (
            <article
              key={submission.file}
              className="rounded-lg border border-white/10 bg-slate-900 p-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-white">{submission.title}</h3>
                    <span className={statusTone(submission.status)}>
                      {submission.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">
                    {submission.series} • {submission.file}
                  </p>
                </div>
                <p className="text-sm text-slate-500">
                  {submission.submittedAt}
                </p>
              </div>
            </article>
          ))}
        </div>

        <aside className="rounded-lg border border-white/10 bg-slate-900 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-300 text-slate-950">
              <Send size={18} />
            </span>
            <div>
              <h3 className="font-bold text-white">Quick Submit</h3>
              <p className="text-sm text-slate-400">Upload result files</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <select className="input">
              <option>Background Shading</option>
              <option>Lineart Cleanup</option>
              <option>Speed Effects</option>
            </select>
            <input className="input" type="file" />
<textarea className="input min-h-28" placeholder="Submission note" />
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-2.5 text-sm font-black text-slate-950 hover:bg-cyan-200">
              <Send size={16} />
              Submit for Review
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
}

function statusTone(status: string) {
  if (status === "Approved") {
    return "rounded-md border border-emerald-300/30 bg-emerald-300/10 px-2 py-1 text-xs font-bold text-emerald-100";
  }

  if (status === "Waiting review") {
    return "rounded-md border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-xs font-bold text-amber-100";
  }

  return "rounded-md border border-slate-600 bg-slate-800 px-2 py-1 text-xs font-bold text-slate-300";
}
