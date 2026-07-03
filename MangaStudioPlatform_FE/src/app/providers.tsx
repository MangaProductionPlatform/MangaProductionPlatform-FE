import type { ReactNode } from "react";
import { ToastProvider } from "../shared/components/ToastProvider";
import { ThemeProvider } from "../shared/components/themeContext";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}
