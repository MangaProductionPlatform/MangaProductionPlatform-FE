import type { ReactNode } from "react";
import { ToastProvider } from "../shared/components/ToastProvider";
import { ThemeProvider } from "../shared/components/themeContext";
import QuickSettingsPanel from "../shared/components/QuickSettingsPanel";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <QuickSettingsPanel />
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}
