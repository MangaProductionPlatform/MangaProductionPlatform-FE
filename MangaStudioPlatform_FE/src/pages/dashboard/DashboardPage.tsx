import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  TrendingUp,
  Upload,
} from "lucide-react";
import { analyticsTimeline, chapterPipeline, mangakaSeries, mangakaStats, notifications, reviewResults } from "../../shared/constants/mangakaWorkSpace";


const statIcons = [BookOpen, FileText, CheckCircle2, Bell] as const;

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-lg border border-white/10 bg-slate-900/80">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.4fr_0.6fr] lg:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
              Mangaka Dashboard
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-black text-white sm:text-4xl">
              Control series, chapters, assistants, reviews, and publishing from one workspace.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
              Aurora Blade is the hottest series this week with stronger views,
              rising ranking, and three assistant submissions waiting for your review.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/app/chapters"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-100"
              >
                <Upload size={16} />
                Upload Manuscript
              </Link>
              <Link
                to="/app/tasks"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Assign Task
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  Publish Queue
                </p>
                <p className="mt-2 text-2xl font-bold text-white">3 chapters</p>
              </div>
              <Clock className="text-amber-200" />
            </div>
            <div className="mt-5 space-y-3">
              {chapterPipeline.slice(0, 3).map((chapter) => (
                <div key={chapter.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-200">
                      {chapter.series}
                    </span>
                    <span className="text-slate-400">{chapter.progress}%</span>
</div>
                  <div className="mt-2 h-2 rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-amber-300"
                      style={{ width: `${chapter.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {mangakaStats.map((item, index) => {
          const Icon = statIcons[index];

          return (
            <article
              key={item.label}
              className="rounded-lg border border-white/10 bg-slate-900/75 p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-400">{item.label}</p>
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${item.tone} text-slate-950`}
                >
                  <Icon size={18} />
                </span>
              </div>
              <p className="mt-4 text-3xl font-black text-white">
                {item.value}
              </p>
              <p className="mt-1 text-sm text-slate-400">{item.note}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <article className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">
                Ranking, Views, Engagement
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Weekly performance across current titles.
              </p>
            </div>
            <div className="flex gap-2 text-xs text-slate-300">
              <span className="rounded-md bg-cyan-400/10 px-2 py-1 text-cyan-100">
                ranking
              </span>
              <span className="rounded-md bg-amber-400/10 px-2 py-1 text-amber-100">
                views
              </span>
              <span className="rounded-md bg-emerald-400/10 px-2 py-1 text-emerald-100">
                engagement
              </span>
            </div>
          </div>

          <div className="mt-6 grid h-64 grid-cols-7 items-end gap-3">
            {analyticsTimeline.map((item) => (
              <div key={item.label} className="flex h-full flex-col justify-end">
                <div className="flex flex-1 items-end gap-1.5">
                  <div
                    className="w-full rounded-t-md bg-cyan-300/80"
                    style={{ height: `${item.ranking}%` }}
                  />
                  <div
                    className="w-full rounded-t-md bg-amber-300/80"
                    style={{ height: `${item.views}%` }}
/>
                  <div
                    className="w-full rounded-t-md bg-emerald-300/80"
                    style={{ height: `${item.engagement}%` }}
                  />
                </div>
                <p className="mt-3 text-center text-xs text-slate-500">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Series Ranking</h3>
            <TrendingUp size={18} className="text-emerald-200" />
          </div>
          <div className="mt-5 space-y-4">
            {mangakaSeries.slice(0, 4).map((series) => (
              <div
                key={series.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={series.cover}
                    alt={series.title}
                    className="h-14 w-10 rounded-md object-cover"
                  />
                  <div>
                    <p className="font-semibold text-white">{series.title}</p>
                    <p className="text-xs text-slate-400">
                      {series.latestChapter}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-amber-200">{series.ranking}</p>
                  <p className="text-xs text-slate-500">{series.views}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <Panel title="Current Chapters" icon={<FileText size={18} />}>
          {chapterPipeline.slice(0, 3).map((chapter) => (
            <div key={chapter.id} className="rounded-lg bg-white/5 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-white">
                  {chapter.chapter} - {chapter.title}
                </p>
                <span className="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-300">
                  {chapter.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-400">
                {chapter.series} • {chapter.pages}
              </p>
            </div>
          ))}
        </Panel>

        <Panel title="Pending Reviews" icon={<CheckCircle2 size={18} />}>
          {reviewResults.slice(0, 3).map((review) => (
            <div key={review.chapter} className="rounded-lg bg-white/5 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-white">{review.chapter}</p>
<span className="text-xs text-amber-200">
                  {review.annotations} notes
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-400">{review.result}</p>
            </div>
          ))}
        </Panel>

        <Panel title="Deadline Alerts" icon={<Bell size={18} />}>
          {notifications.slice(0, 3).map((notice) => (
            <div key={notice.title} className="rounded-lg bg-white/5 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-white">{notice.title}</p>
                <span className="text-xs text-slate-500">{notice.time}</span>
              </div>
              <p className="mt-1 text-sm text-slate-400">{notice.meta}</p>
            </div>
          ))}
        </Panel>
      </section>
    </div>
  );
}

function Panel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <article className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
      <div className="flex items-center justify-between text-white">
        <h3 className="text-lg font-bold">{title}</h3>
        <span className="text-cyan-200">{icon}</span>
      </div>
      <div className="mt-5 space-y-3">{children}</div>
    </article>
  );
}