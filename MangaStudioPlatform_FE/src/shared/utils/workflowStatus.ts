export type WorkflowStatusMeta = {
  label: string;
  className: string;
  progress: number;
};

const statusMeta: Record<string, WorkflowStatusMeta> = {
  drafting: {
    label: "Drafting",
    className: "border-slate-400/20 bg-slate-500/10 text-slate-300",
    progress: 15,
  },
  draft: {
    label: "Drafting",
    className: "border-slate-400/20 bg-slate-500/10 text-slate-300",
    progress: 15,
  },
  incomplete: {
    label: "Incomplete",
    className: "border-amber-400/20 bg-amber-500/10 text-amber-200",
    progress: 30,
  },
  assigned: {
    label: "Assigned",
    className: "border-cyan-400/20 bg-cyan-500/10 text-cyan-200",
    progress: 40,
  },
  active: {
    label: "Active",
    className: "border-cyan-400/20 bg-cyan-500/10 text-cyan-200",
    progress: 40,
  },
  submitted: {
    label: "Submitted",
    className: "border-blue-400/20 bg-blue-500/10 text-blue-200",
    progress: 65,
  },
  reviewing: {
    label: "Reviewing",
    className: "border-violet-400/20 bg-violet-500/10 text-violet-200",
    progress: 75,
  },
  revisionrequired: {
    label: "Revision Required",
    className: "border-rose-400/20 bg-rose-500/10 text-rose-200",
    progress: 55,
  },
  approved: {
    label: "Approved",
    className: "border-emerald-400/20 bg-emerald-500/10 text-emerald-200",
    progress: 90,
  },
  accepted: {
    label: "Approved",
    className: "border-emerald-400/20 bg-emerald-500/10 text-emerald-200",
    progress: 90,
  },
  rejected: {
    label: "Rejected",
    className: "border-rose-400/20 bg-rose-500/10 text-rose-200",
    progress: 0,
  },
  completed: {
    label: "Completed",
    className: "border-emerald-400/20 bg-emerald-500/10 text-emerald-200",
    progress: 100,
  },
  published: {
    label: "Published",
    className: "border-emerald-400/20 bg-emerald-500/10 text-emerald-200",
    progress: 100,
  },
  complete: {
    label: "Completed",
    className: "border-emerald-400/20 bg-emerald-500/10 text-emerald-200",
    progress: 100,
  },
  submittedtoqa: {
    label: "Submitted to QA",
    className: "border-blue-400/20 bg-blue-500/10 text-blue-200",
    progress: 100,
  },
  inqa: {
    label: "Submitted to QA",
    className: "border-blue-400/20 bg-blue-500/10 text-blue-200",
    progress: 100,
  },
  pendingqa: {
    label: "Submitted to QA",
    className: "border-blue-400/20 bg-blue-500/10 text-blue-200",
    progress: 100,
  },
  qapending: {
    label: "Submitted to QA",
    className: "border-blue-400/20 bg-blue-500/10 text-blue-200",
    progress: 100,
  },
};

function normalizeStatus(status?: string | null) {
  return status?.replace(/[\s_-]/g, "").toLowerCase() ?? "";
}

export function getWorkflowStatusMeta(
  status?: string | null,
): WorkflowStatusMeta {
  return (
    statusMeta[normalizeStatus(status)] ?? {
      label: "Unknown",
      className: "border-slate-500/20 bg-slate-500/10 text-slate-400",
      progress: 0,
    }
  );
}
