import { createContext, useContext } from "react";

export type ToastType = "success" | "error" | "info";

export type Toast = {
  id: number;
  title: string;
  description?: string;
  type: ToastType;
};

export type ToastInput = Omit<Toast, "id">;

export type ToastContextValue = {
  notify: (toast: ToastInput) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }

  return context;
}
