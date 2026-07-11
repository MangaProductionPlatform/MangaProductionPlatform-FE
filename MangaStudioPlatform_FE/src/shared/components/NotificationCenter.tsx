import { useEffect, useState } from "react";
import { Bell, CheckCheck, RefreshCw, Trash2 } from "lucide-react";
import { mangaErpApi } from "../services/mangaErpService";
import type { NotificationDto } from "../types/mangaErp";
import { useToast } from "./toastContext";

export function NotificationCenter({ eyebrow }: { eyebrow: string }) {
  const toast = useToast();
  const [items, setItems] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await mangaErpApi.getMyNotifications());
    } catch (error) {
      toast.error("Could not load notifications", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Initial backend load only.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, []);

  const markRead = async (id: string) => {
    try {
      await mangaErpApi.markNotificationRead(id);
      setItems((current) => current.map((item) => item.id === id ? { ...item, isRead: true } : item));
    } catch (error) {
      toast.error("Could not mark notification read", error instanceof Error ? error.message : "Unknown error");
    }
  };

  const markAllRead = async () => {
    try {
      await mangaErpApi.markAllNotificationsRead();
      setItems((current) => current.map((item) => ({ ...item, isRead: true })));
    } catch (error) {
      toast.error("Could not mark all read", error instanceof Error ? error.message : "Unknown error");
    }
  };

  const remove = async (id: string) => {
    try {
      await mangaErpApi.deleteNotification(id);
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      toast.error("Could not delete notification", error instanceof Error ? error.message : "Unknown error");
    }
  };

  return <div className="space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div><p className="text-xs font-semibold uppercase tracking-[.28em] text-cyan-200">{eyebrow}</p><h1 className="mt-2 text-3xl font-black text-white">Notifications</h1></div>
      <div className="flex gap-2"><button type="button" title="Refresh notifications" onClick={() => void load()} className="icon-button"><RefreshCw size={17} /></button><button type="button" onClick={() => void markAllRead()} className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/30 px-3 py-2 text-sm font-semibold text-cyan-100"><CheckCheck size={16} />Mark all read</button></div>
    </header>
    {loading ? <p className="text-sm text-slate-400">Loading notifications...</p> : null}
    {!loading && !items.length ? <div className="flex min-h-48 flex-col items-center justify-center border border-dashed border-slate-700 px-6 text-center"><Bell size={28} className="text-cyan-200"/><p className="mt-3 font-semibold text-white">No notifications</p></div> : null}
    <div className="space-y-3">{items.map((item) => <article key={item.id} className={`flex gap-4 border p-4 ${item.isRead ? "border-slate-800 bg-slate-950/40" : "border-cyan-300/30 bg-cyan-300/5"}`}>
      <div className="min-w-0 flex-1"><div className="flex flex-wrap justify-between gap-2"><h2 className="font-bold text-white">{item.title}</h2><time className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</time></div><p className="mt-1 text-sm text-slate-300">{item.message}</p></div>
      <div className="flex items-start gap-1">{!item.isRead ? <button type="button" title="Mark read" onClick={() => void markRead(item.id)} className="icon-button"><CheckCheck size={16}/></button> : null}<button type="button" title="Delete notification" onClick={() => void remove(item.id)} className="icon-button text-rose-200"><Trash2 size={16}/></button></div>
    </article>)}</div>
  </div>;
}
