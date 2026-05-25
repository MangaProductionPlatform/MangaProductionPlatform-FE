import { CheckCircle2, FileText, MessageSquare, PencilLine, XCircle } from "lucide-react";
import { reviewResults } from "../../shared/constants/mangakaWorkSpace";

const pagePreviews = ["01", "08", "14", "21", "26"] as const;

export default function ReviewPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Review Results
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            Approve assistant work
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Inspect assistant submissions, read annotations, approve clean work,
            or reject with revision notes before publishing.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-rose-300/30 bg-rose-300/10 px-4 py-2.5 text-sm font-bold text-rose-100 hover:bg-rose-300/15">
            <XCircle size={16} />
            Reject Selected
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-emerald-300 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-200">
            <CheckCircle2 size={16} />
            Approve Selected
          </button>
        </div>
      </div>

      <section className="grid gap-5 xl:grid-cols-[24rem_1fr]">
        <aside className="space-y-4">
          {reviewResults.map((review, index) => (
            <article
              key={review.chapter}
              className={`rounded-lg border p-4 ${
                index === 0
                  ? "border-cyan-300/30 bg-cyan-300/10"
                  : "border-white/10 bg-slate-900/75"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-white">{review.chapter}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {review.assistant} • {review.result}
                  </p>
                </div>
                <span className={statusTone(review.status)}>
                  {review.status}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <Metric label="Annotations" value={String(review.annotations)} />
                <Metric label="Confidence" value={review.confidence} />
              </div>
            </article>
          ))}
        </aside>

        <main className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-cyan-200">
                Starfall Relay Ch. 16
              </p>
<h3 className="mt-2 text-2xl font-black text-white">
                Dialogue cleanup pass
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Panel 08 has a stronger emotional beat now. Panel 14 still
                needs a shorter balloon before final approval.
              </p>
            </div>
            <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-sm text-amber-100">
              12 annotations
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_18rem]">
            <section className="rounded-lg border border-white/10 bg-slate-950/60 p-4">
              <div className="grid gap-3 sm:grid-cols-5">
                {pagePreviews.map((page, index) => (
                  <div
                    key={page}
                    className="relative aspect-[2/3] rounded-lg border border-white/10 bg-white/5 p-3"
                  >
                    <div className="h-full rounded-md bg-gradient-to-br from-slate-800 via-slate-700 to-slate-950" />
                    <span className="absolute left-3 top-3 rounded-md bg-slate-950/80 px-2 py-1 text-xs font-bold text-white">
                      p.{page}
                    </span>
                    {index < 3 ? (
                      <span className="absolute right-3 top-1/3 flex h-6 w-6 items-center justify-center rounded-full bg-amber-300 text-xs font-black text-slate-950">
                        {index + 1}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>

            <aside className="space-y-4">
              <section className="rounded-lg border border-white/10 bg-slate-950/60 p-4">
                <div className="flex items-center gap-2 text-white">
                  <MessageSquare size={17} className="text-cyan-200" />
                  <h4 className="font-bold">Assistant Result</h4>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Dialogue balloons were tightened on pages 04-13. Page 14 is
                  flagged because the final line still overlaps the runner close-up.
                </p>
              </section>

              <section className="rounded-lg border border-white/10 bg-slate-950/60 p-4">
                <div className="flex items-center gap-2 text-white">
                  <PencilLine size={17} className="text-amber-200" />
                  <h4 className="font-bold">Annotations</h4>
                </div>
                <div className="mt-3 space-y-2 text-sm text-slate-300">
                  <Annotation page="08" text="Keep new emotional pause." />
                  <Annotation page="14" text="Shorten balloon by 20%." />
                  <Annotation page="21" text="Confirm SFX placement." />
                </div>
              </section>
<section className="rounded-lg border border-white/10 bg-slate-950/60 p-4">
                <div className="flex items-center gap-2 text-white">
                  <FileText size={17} className="text-emerald-200" />
                  <h4 className="font-bold">Decision Note</h4>
                </div>
                <textarea
                  className="input mt-3 min-h-28"
                  placeholder="Revision note for assistant"
                />
              </section>
            </aside>
          </div>
        </main>
      </section>
    </div>
  );
}

function statusTone(status: string) {
  if (status === "Approved") {
    return "rounded-md border border-emerald-300/30 bg-emerald-300/10 px-2 py-1 text-xs font-semibold text-emerald-100";
  }

  if (status === "Revision requested") {
    return "rounded-md border border-rose-300/30 bg-rose-300/10 px-2 py-1 text-xs font-semibold text-rose-100";
  }

  return "rounded-md border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-xs font-semibold text-amber-100";
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/50 p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-bold text-white">{value}</p>
    </div>
  );
}

function Annotation({ page, text }: { page: string; text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-white/5 p-3">
      <span className="rounded-md bg-amber-300 px-2 py-1 text-xs font-black text-slate-950">
        p.{page}
      </span>
      <span>{text}</span>
    </div>
  );
}