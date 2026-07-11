import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ClipboardCheck, RefreshCw } from "lucide-react";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { PageTaskDto } from "../../shared/types/mangaErp";
import { useToast } from "../../shared/components/toastContext";

export default function TaskDetailPage() {
  const { id = "" } = useParams(); const toast = useToast(); const [task, setTask] = useState<PageTaskDto | null>(null); const [loading, setLoading] = useState(true);
  const load = async () => { if (!id) return; setLoading(true); try { setTask(await mangaErpApi.getPageTask(id)); } catch (error) { toast.error("Could not load task detail", error instanceof Error ? error.message : "Unknown error"); } finally { setLoading(false); } };
  // Initial backend load only.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [id]);
  return <div className="space-y-5"><div className="flex items-center justify-between"><Link to="/app/tasks" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200"><ArrowLeft size={16}/>Back to Tasks</Link><button type="button" title="Refresh task" onClick={() => void load()} className="icon-button"><RefreshCw size={17}/></button></div><section className="border border-white/10 bg-slate-900 p-6"><ClipboardCheck size={22} className="text-cyan-200"/><h1 className="mt-4 text-2xl font-black text-white">{task?.chapterTitle ?? "Task detail"} {task ? `· Page ${task.pageNumber}` : ""}</h1>{loading ? <p className="mt-4 text-sm text-slate-400">Loading task...</p> : task ? <dl className="mt-6 grid gap-4 md:grid-cols-2 text-sm"><Info label="Status" value={task.status}/><Info label="Task type" value={task.taskType ?? "General"}/><Info label="Deadline" value={task.deadline ? new Date(task.deadline).toLocaleString() : "No deadline"}/><Info label="Assigned assistant" value={task.assignedAssistantId ?? "-"}/><Info label="Description" value={task.description ?? "No description"}/></dl> : <p className="mt-4 text-sm text-slate-500">Task not found.</p>}</section></div>;
}
function Info({ label, value }: { label: string; value: string }) { return <div className="border border-white/10 bg-slate-950 p-4"><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 break-words text-slate-200">{value}</dd></div>; }
