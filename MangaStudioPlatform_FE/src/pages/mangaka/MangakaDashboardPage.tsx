import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  FilePenLine,
  RefreshCw,
  Send,
  ArrowRight,
} from "lucide-react";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type {
  MangaSeriesDto,
  SubmissionSummaryDto,
} from "../../shared/types/mangaErp";
import { useToast } from "../../shared/components/toastContext";

export default function MangakaDashboardPage() {
  const toast = useToast();

  const [submissions, setSubmissions] = useState<SubmissionSummaryDto[]>([]);
  const [series, setSeries] = useState<MangaSeriesDto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);

    try {
      const [submissionResult, seriesResult] = await Promise.all([
        mangaErpApi.getMySubmissions(),
        mangaErpApi.getMySeries(),
      ]);

      setSubmissions(submissionResult);
      setSeries(seriesResult);
    } catch (e) {
      toast.error(
        "Could not load MF1 dashboard",
        e instanceof Error ? e.message : "Unknown error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = [
    {
      label: "Drafts",
      value: submissions.filter((x) => x.status === "Draft").length,
      icon: FilePenLine,
      color: "text-amber-300",
      bg: "bg-amber-300/10",
      border: "border-amber-300/20",
    },
    {
      label: "Pending EB Review",
      value: submissions.filter((x) => x.status === "Pending_EB_Review")
        .length,
      icon: Send,
      color: "text-cyan-300",
      bg: "bg-cyan-300/10",
      border: "border-cyan-300/20",
    },
    {
      label: "Requires Revision",
      value: submissions.filter((x) => x.status === "Requires_Revision")
        .length,
      icon: RefreshCw,
      color: "text-rose-300",
      bg: "bg-rose-300/10",
      border: "border-rose-300/20",
    },
    {
      label: "Active Series",
      value: series.filter((x) => x.status === "Active").length,
      icon: BookOpen,
      color: "text-emerald-300",
      bg: "bg-emerald-300/10",
      border: "border-emerald-300/20",
    },
  ];

  return (
    <div className="space-y-6 fade-in-up">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 p-7 shadow-2xl shadow-cyan-950/20">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-rose-400/10 blur-3xl" />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Mangaka · MF1
          </p>

          <h1 className="mt-3 text-3xl font-black text-white md:text-4xl">
            Series Submission Dashboard
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Manage your manga proposals, check Editorial Board review status,
            and continue production after your series is approved.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/app/mangaka/submissions"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
            >
              Create proposal
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/app/mangaka/series"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              View official series
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className={`rounded-2xl border ${item.border} bg-slate-900/75 p-5 shadow-lg shadow-black/20`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{item.label}</p>
                  <p className="mt-3 text-3xl font-black text-white">
                    {loading ? "…" : item.value}
                  </p>
                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.bg}`}
                >
                  <Icon size={22} className={item.color} />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          to="/app/mangaka/submissions"
          className="group rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-6 transition hover:-translate-y-1 hover:bg-cyan-300/15"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">
                Create or manage proposal
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Draft, update manuscript, submit to Editor, and resubmit after
                revision requests.
              </p>
            </div>

            <ArrowRight
              size={20}
              className="text-cyan-200 transition group-hover:translate-x-1"
            />
          </div>
        </Link>

        <Link
          to="/app/mangaka/series"
          className="group rounded-2xl border border-white/10 bg-slate-900/75 p-6 transition hover:-translate-y-1 hover:bg-white/10"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Official Series</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Approved proposals become active series and allow chapter
                creation.
              </p>
            </div>

            <ArrowRight
              size={20}
              className="text-slate-300 transition group-hover:translate-x-1"
            />
          </div>
        </Link>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-900/75 p-6 shadow-xl shadow-black/20">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">
              Recent submissions
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Latest manga proposals sent by your account.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/15"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {submissions.slice(0, 5).map((x) => (
            <div
              key={x.id}
              className="flex flex-col justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/60 p-4 transition hover:bg-slate-950/80 sm:flex-row sm:items-center"
            >
              <div>
                <p className="font-semibold text-white">{x.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(x.createdAt).toLocaleString()}
                </p>
              </div>

              <span className="h-fit w-fit rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                {x.status}
              </span>
            </div>
          ))}

          {!loading && !submissions.length ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/40 p-6 text-center">
              <p className="text-sm text-slate-400">No submissions yet.</p>
              <Link
                to="/app/mangaka/submissions"
                className="mt-3 inline-flex text-sm font-semibold text-cyan-200 hover:text-cyan-100"
              >
                Create your first proposal
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}