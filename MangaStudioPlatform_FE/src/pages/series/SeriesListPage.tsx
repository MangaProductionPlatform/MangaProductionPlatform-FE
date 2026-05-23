import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type PageProps = {
  title: string;
  desc: string;
  children: ReactNode;
};

export default function SeriesListPage() {
  return (
    <Page title="Series Management" desc="Manage manga series submissions.">
      <Link to="/series/create" className="rounded-xl bg-indigo-600 px-5 py-3">
        + Create Series
      </Link>
      <Empty text="No series found." />
    </Page>
  );
}

function Page({ title, desc, children }: PageProps) {
  return (
    <div>
      <h2 className="text-3xl font-bold">{title}</h2>
      <p className="mt-1 text-slate-400">{desc}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-slate-700 p-10 text-center text-slate-400">
      {text}
    </div>
  );
}