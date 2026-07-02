import { useEffect, useState } from "react";
import { ArrowLeft, FileImage, Send } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useToast } from "../../shared/components/toastContext";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { PageTaskDto, SubmitPageLayerPayload } from "../../shared/types/mangaErp";

const layerTypes: SubmitPageLayerPayload["LayerType"][] = ["LineArt", "Color", "Background"];

export default function AssistantTaskDetailPage() {
  const { id } = useParams();
  const toast = useToast();
  const [task, setTask] = useState<PageTaskDto | null>(null);
  const [layerType, setLayerType] = useState<SubmitPageLayerPayload["LayerType"]>("LineArt");
  const [fileUrlOriginal, setFileUrlOriginal] = useState("");
  const [fileUrlOptimized, setFileUrlOptimized] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTask, setIsLoadingTask] = useState(Boolean(id));

  useEffect(() => {
    if (!id) return;
    void mangaErpApi.getAssignedPageTasks()
      .then((items) => {
        const match = items.find((item) => item.id === id) ?? null;
        setTask(match);
        if (!match) toast.error("Task not found", "This task is no longer in your assigned work.");
      })
      .catch((error: unknown) => {
        setTask(null);
        toast.error("Could not load task details", error instanceof Error ? error.message : "Unknown error");
      })
      .finally(() => setIsLoadingTask(false));
  }, [id, toast]);

  const submit = async () => {
    if (!id || !fileUrlOriginal.trim() || !fileUrlOptimized.trim()) {
      toast.error("Layer URLs are required", "Enter both the original artwork URL and optimized preview URL.");
      return;
    }
    setIsSubmitting(true);
    try {
      await mangaErpApi.submitPageTaskLayer(id, {
        LayerType: layerType,
        FileUrlOriginal: fileUrlOriginal.trim(),
        FileUrlOptimized: fileUrlOptimized.trim(),
      });
      toast.success(task?.status.toLowerCase() === "revisionrequired" ? "Corrected layer resubmitted" : "Layer submitted", "The Mangaka can now review this page task.");
      setFileUrlOriginal("");
      setFileUrlOptimized("");
    } catch (error) {
      toast.error("Could not submit layer", error instanceof Error ? error.message : "Unknown error");
    } finally { setIsSubmitting(false); }
  };

  return <div className="space-y-6">
    <Link to="/assistant/tasks" className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200"><ArrowLeft size={16} />Back to tasks</Link>
    <header className="rounded-2xl border border-slate-800 bg-slate-900 p-7"><p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">Assistant · MF2</p><h1 className="mt-2 text-3xl font-black text-white">Submit Artwork Layer</h1><p className="mt-2 text-sm text-slate-400">{isLoadingTask ? "Loading task details…" : task ? `${task.chapterTitle ?? "Chapter"} · Page ${task.pageNumber}` : `Task ${id ?? "not found"}`}</p></header>
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><h2 className="flex items-center gap-2 text-lg font-bold text-white"><FileImage size={20} className="text-cyan-300" />Assignment</h2><dl className="mt-5 space-y-4 text-sm"><Info label="Status" value={task?.status ?? "Assigned"} /><Info label="Page" value={task ? String(task.pageNumber) : "—"} />{task?.rejectionNote ? <Info label="Revision alert" value={task.rejectionNote} alert /> : null}</dl></section>
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><h2 className="text-lg font-bold text-white">Layer submission</h2><p className="mt-2 text-sm text-slate-400">Submitting again replaces the previous layer for this page task.</p><div className="mt-5 space-y-4"><label className="block text-sm text-slate-400">Layer type<select className="input mt-2" value={layerType} onChange={(event) => setLayerType(event.target.value as SubmitPageLayerPayload["LayerType"])}>{layerTypes.map((type) => <option key={type}>{type}</option>)}</select></label><label className="block text-sm text-slate-400">Original artwork URL<input className="input mt-2" value={fileUrlOriginal} onChange={(event) => setFileUrlOriginal(event.target.value)} placeholder="https://storage.example/page-layer.psd" /></label><label className="block text-sm text-slate-400">Optimized preview URL<input className="input mt-2" value={fileUrlOptimized} onChange={(event) => setFileUrlOptimized(event.target.value)} placeholder="https://storage.example/page-preview.webp" /></label><button type="button" onClick={() => void submit()} disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"><Send size={18} />{isSubmitting ? "Submitting…" : "Submit layer"}</button></div></section>
    </div>
  </div>;
}

function Info({ label, value, alert = false }: { label: string; value: string; alert?: boolean }) {
  return <div className={`rounded-xl border p-4 ${alert ? "border-rose-400/20 bg-rose-500/10" : "border-slate-800 bg-slate-950"}`}><dt className="text-xs text-slate-500">{label}</dt><dd className={`mt-1 ${alert ? "text-rose-200" : "text-slate-200"}`}>{value}</dd></div>;
}
