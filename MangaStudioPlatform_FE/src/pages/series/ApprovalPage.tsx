export default function ApprovalPage() {
  return (
    <div>
      <h2 className="text-3xl font-bold">Series Approval</h2>
      <p className="mt-1 text-slate-400">
        Editorial Board reviews and approves submitted series.
      </p>

      <div className="mt-8 rounded-2xl border border-dashed border-slate-700 p-10 text-center text-slate-400">
        No pending approvals.
      </div>
    </div>
  );
}