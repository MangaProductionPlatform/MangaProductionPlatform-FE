import type { ReactNode } from "react";
import { ToastProvider } from "../shared/components/ToastProvider";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return <ToastProvider>{children}</ToastProvider>;
}
