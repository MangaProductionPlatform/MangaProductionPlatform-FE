import { useEffect, useState } from "react";
import { Bell, RefreshCw } from "lucide-react";
import { useToast } from "../../shared/components/toastContext";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { NotificationDto } from "../../shared/types/mangaErp";

// Trang dùng luồng notification chung nhưng được giới hạn bởi quyền Admin từ backend.
export default function AdminNotificationsPage() {
  const toast = useToast();
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = async (nextUnreadOnly = unreadOnly, showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      setNotifications(await mangaErpApi.getMyNotifications(nextUnreadOnly));
    } catch (error) {
      toast.error("Could not load notifications", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function loadInitialNotifications() {
      try {
        const result = await mangaErpApi.getMyNotifications(false);
        if (!ignore) setNotifications(result);
      } catch (error) {
        if (!ignore) toast.error("Could not load notifications", error instanceof Error ? error.message : "Unknown error");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    void loadInitialNotifications();
    return () => {
      ignore = true;
    };
    // Initial backend load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">Admin</p>
          <h2 className="mt-2 text-3xl font-black text-white">Admin notifications</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Notifications for the current admin account from the Publishing notification service.
          </p>
        </div>
        <button type="button" onClick={() => void loadNotifications()} disabled={isLoading} className="btn-secondary inline-flex items-center gap-2">
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </header>

      <label className="inline-flex items-center gap-3 rounded-lg border border-white/10 bg-slate-900/75 px-4 py-3 text-sm text-slate-300">
        <input
          type="checkbox"
          className="accent-cyan-300"
          checked={unreadOnly}
          onChange={(event) => {
            setUnreadOnly(event.target.checked);
            void loadNotifications(event.target.checked);
          }}
        />
        Unread only
      </label>

      <section className="space-y-3">
        {isLoading ? <p className="rounded-lg border border-white/10 bg-slate-900/75 p-5 text-sm text-slate-300">Loading notifications...</p> : null}
        {!isLoading && notifications.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">
            <Bell className="mx-auto text-slate-500" />
            <p className="mt-3">No notifications returned by backend.</p>
          </div>
        ) : null}
        {notifications.map((item) => (
          <article key={item.id} className={`rounded-lg border p-4 ${item.isRead ? "border-white/10 bg-slate-900/75" : "border-cyan-300/25 bg-cyan-300/10"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-sm text-slate-300">{item.message}</p>
                <p className="mt-2 text-xs text-slate-500">{item.notifyType} - {new Date(item.createdAt).toLocaleString()}</p>
              </div>
              <span className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-300">
                {item.isRead ? "Read" : "Unread"}
              </span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
