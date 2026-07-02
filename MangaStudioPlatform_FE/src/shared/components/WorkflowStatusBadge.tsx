import { getWorkflowStatusMeta } from "../utils/workflowStatus";

type WorkflowStatusBadgeProps = {
  status?: string | null;
  className?: string;
};

export function WorkflowStatusBadge({
  status,
  className = "",
}: WorkflowStatusBadgeProps) {
  const meta = getWorkflowStatusMeta(status);
  const badgeClassName = [
    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
    meta.className,
    className,
  ].join(" ");

  return (
    <span
      title={
        meta.label === "Unknown" && status
          ? `Backend status: ${status}`
          : undefined
      }
      className={badgeClassName}
    >
      {meta.label}
    </span>
  );
}
