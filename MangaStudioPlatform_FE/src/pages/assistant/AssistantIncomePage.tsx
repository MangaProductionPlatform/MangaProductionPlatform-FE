import { useEffect, useState } from "react";
import { Banknote, RefreshCw } from "lucide-react";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { AssistantIncomeDto } from "../../shared/types/mangaErp";
import { useToast } from "../../shared/components/toastContext";

export default function AssistantIncomePage() {
  const toast = useToast(); const [data, setData] = useState<AssistantIncomeDto | null>(null); const [loading, setLoading] = useState(true);
  const load = async () => { setLoading(true); try { setData(await mangaErpApi.getAssistantIncome()); } catch (error) { toast.error("Could not load income", error instanceof Error ? error.message : "Unknown error"); } finally { setLoading(false); } };
  // Initial backend load only.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, []);
  const money = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: data?.currency || "VND", maximumFractionDigits: 0 }).format(value);
  return <div className="space-y-6"><header className="flex items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.28em] text-cyan-200">Assistant</p><h1 className="mt-2 text-3xl font-black text-white">Income</h1></div><button type="button" title="Refresh income" onClick={() => void load()} className="icon-button"><RefreshCw size={17}/></button></header><section className="grid gap-4 md:grid-cols-3">{[["Finished tasks", data?.totalFinishedTasks ?? 0], ["Estimated income", money(data?.estimatedIncome ?? 0)], ["Rate per task", money(data?.ratePerTask ?? 0)]].map(([label, value]) => <article key={String(label)} className="border border-white/10 bg-slate-900 p-5"><Banknote size={19} className="text-cyan-200"/><p className="mt-4 text-xs uppercase tracking-[.16em] text-slate-400">{label}</p><p className="mt-2 text-2xl font-black text-white">{loading ? "..." : value}</p></article>)}</section></div>;
}
