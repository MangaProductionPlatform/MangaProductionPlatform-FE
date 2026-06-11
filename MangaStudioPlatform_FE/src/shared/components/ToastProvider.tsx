import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: number;
  title: string;
  description?: string;
  type: ToastType;
};

type ToastInput = Omit<Toast, "id">;

type ToastContextValue = {
  notify: (toast: ToastInput) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toastStyles: Record<ToastType, string> = {
  success: "border-emerald-300/25 bg-emerald-500/15 text-emerald-50",
  error: "border-rose-300/25 bg-rose-500/15 text-rose-50",
  info: "border-cyan-300/25 bg-cyan-500/15 text-cyan-50",
};

const iconStyles: Record<ToastType, string> = {
  success: "text-emerald-200",
  error: "text-rose-200",
  info: "text-cyan-200",
};

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((items) => items.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (toast: ToastInput) => {
      const id = Date.now() + Math.random();
      setToasts((items) => [...items, { ...toast, id }].slice(-4));
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      notify,
      success: (title, description) => notify({ type: "success", title, description }),
      error: (title, description) => notify({ type: "error", title, description }),
      info: (title, description) => notify({ type: "info", title, description }),
    }),
    [notify],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
        {toasts.map((toast) => {
          const Icon = icons[toast.type];

          return (
            <div
              key={toast.id}
              className={`flex items-start gap-3 rounded-lg border p-4 shadow-2xl shadow-slate-950/35 backdrop-blur-xl ${toastStyles[toast.type]}`}
            >
              <Icon className={`mt-0.5 shrink-0 ${iconStyles[toast.type]}`} size={20} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-1 text-sm leading-5 text-slate-200">
                    {toast.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="rounded-md p-1 text-slate-300 transition hover:bg-white/10 hover:text-white"
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }

  return context;
}
