export default function SubmissionPage() {
  return (
    <div>
      <h2 className="text-3xl font-bold">Submit Manuscript</h2>
      <p className="mt-1 text-slate-400">Upload chapter or page manuscript.</p>

      <form className="mt-8 grid gap-5 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <input className="input" placeholder="Series ID" />
        <input className="input" placeholder="Chapter title" />
        <input className="input" type="file" />
        <textarea className="input min-h-32" placeholder="Note" />
        <button className="rounded-xl bg-indigo-600 py-3 font-semibold">
          Submit Manuscript
        </button>
      </form>
    </div>
  );
}