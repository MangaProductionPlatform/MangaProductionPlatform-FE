export default function ReviewPage() {
  return (
    <div>
      <h2 className="text-3xl font-bold">Manuscript Review</h2>
      <p className="mt-1 text-slate-400">
        Tantou Editor reviews scripts, dialogues, and panels.
      </p>

      <div className="mt-8 rounded-2xl border border-dashed border-slate-700 p-10 text-center text-slate-400">
        No manuscripts waiting for review.
      </div>
    </div>
  );
}