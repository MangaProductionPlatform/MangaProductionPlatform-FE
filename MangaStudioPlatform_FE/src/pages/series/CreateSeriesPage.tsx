export default function CreateSeriesPage() {
  return (
    <div>
      <h2 className="text-3xl font-bold">Create Series</h2>
      <p className="mt-1 text-slate-400">Submit a new manga series.</p>

      <form className="mt-8 grid gap-5 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <input className="input" placeholder="Series title" />
        <input className="input" placeholder="Genre" />
        <textarea className="input min-h-32" placeholder="Description" />
        <button className="rounded-xl bg-indigo-600 py-3 font-semibold">
          Submit Series
        </button>
      </form>
    </div>
  );
}