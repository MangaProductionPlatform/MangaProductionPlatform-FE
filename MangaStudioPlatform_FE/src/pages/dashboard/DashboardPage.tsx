import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, FileText, PlusCircle, Trophy } from "lucide-react";
import CoverMarquee from "../../shared/components/CoverMarquee";
import { mangaWorkspaceImage } from "../../shared/visuals/mangaVisuals";

const workspaceSections = [
  {
    title: "Series",
    description: "View and manage your approved series.",
    path: "/app/series",
    icon: BookOpen,
  },
  {
    title: "Submit Proposal",
    description: "Create and submit a new series proposal.",
    path: "/app/series/create",
    icon: PlusCircle,
  },
  {
    title: "Chapters",
    description: "Create chapters and follow their production progress.",
    path: "/app/chapters",
    icon: FileText,
  },
  {
    title: "Ranking",
    description: "View current series ranking and performance.",
    path: "/app/ranking",
    icon: Trophy,
  },
] as const;

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="grid overflow-hidden rounded-lg border border-white/10 bg-slate-900/80 lg:grid-cols-[1fr_24rem]">
        <div className="p-6 lg:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Mangaka Dashboard
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-black text-white sm:text-4xl">
            Manga production workspace
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
            Manage your series, proposals, chapters, and performance in one
            workspace.
          </p>
        </div>
        <div className="relative min-h-56 overflow-hidden border-t border-white/10 lg:border-l lg:border-t-0">
          <img
              src={mangaWorkspaceImage}
            alt="Manga production desk"
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.25),rgba(5,8,22,0.88))]" />
        </div>
      </section>

      <CoverMarquee compact />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {workspaceSections.map((section) => {
          const Icon = section.icon;

          return (
            <Link
              key={section.path}
              to={section.path}
              className="group rounded-lg border border-white/10 bg-slate-900/75 p-5 transition hover:border-cyan-300/30 hover:bg-slate-900"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-300 text-slate-950">
                <Icon size={19} />
              </span>
              <h3 className="mt-5 text-lg font-bold text-white">{section.title}</h3>
              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-400">
                {section.description}
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200">
                Open
                <ArrowRight size={15} className="transition group-hover:translate-x-1" />
              </span>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
