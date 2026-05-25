import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Eye, TrendingUp } from "lucide-react";
import { chapterPipeline, mangakaSeries } from "../../shared/constants/mangakaWorkSpace";


export default function SeriesDetailPage() {
  const params = useParams();
  const series =
    mangakaSeries.find((item) => item.id === params.id) ?? mangakaSeries[0];
  const chapters = chapterPipeline.filter((chapter) => chapter.series === series.title);

  return (
    <div className="space-y-6">
      <Link
        to="/app/series"
        className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 hover:text-cyan-100"
      >
        <ArrowLeft size={16} />
        Back to My Series
      </Link>

      <section className="grid gap-5 rounded-lg border border-white/10 bg-slate-900/75 p-5 lg:grid-cols-[13rem_1fr]">
        <img
          src={series.cover}
          alt={series.title}
          className="aspect-[2/3] w-full rounded-lg object-cover shadow-xl shadow-slate-950/30"
        />
        <div>
          <span className="rounded-md border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-xs font-semibold text-cyan-100">
            {series.status}
          </span>
          <h2 className="mt-3 text-3xl font-black text-white">{series.title}</h2>
          <p className="mt-2 text-sm text-slate-400">{series.genre}</p>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">
            Managed by the Mangaka workspace with chapter production, assistant
            task assignment, review approvals, analytics, and publish handoff
            connected in one flow.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Metric icon={<TrendingUp size={16} />} label="Ranking" value={series.ranking} />
            <Metric icon={<Eye size={16} />} label="Views" value={series.views} />
            <Metric icon={<Calendar size={16} />} label="Deadline" value={series.deadline} />
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Production progress</span>
              <span className="font-semibold text-white">{series.progress}%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-amber-300"
                style={{ width: `${series.progress}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white">Chapter Activity</h3>
            <p className="mt-1 text-sm text-slate-400">
Latest chapter status connected to production tasks.
            </p>
          </div>
          <Link
            to="/app/chapters"
            className="rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-100"
          >
            Open Chapters
          </Link>
        </div>

        <div className="mt-5 space-y-3">
          {(chapters.length ? chapters : chapterPipeline.slice(0, 2)).map((chapter) => (
            <article
              key={chapter.id}
              className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-bold text-white">
                  {chapter.chapter} - {chapter.title}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {chapter.manuscript} • {chapter.pages}
                </p>
              </div>
              <span className="rounded-md bg-slate-950/70 px-2 py-1 text-sm text-slate-300">
                {chapter.status}
              </span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <div className="flex items-center gap-2 text-cyan-200">{icon}</div>
      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-bold text-white">{value}</p>
    </div>
  );
}