import { createContext, useContext } from "react";

export type ThemeMode = "dark" | "light";
export type AccentPreset = "cyan" | "violet" | "emerald" | "amber" | "rose";
export type SidebarStyle = "pinned" | "icons";
export type FontSizePreference = "small" | "medium" | "large";

export type ThemeContextValue = {
  mode: ThemeMode;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
  accent: AccentPreset;
  setAccent: (accent: AccentPreset) => void;
  sidebarStyle: SidebarStyle;
  setSidebarStyle: (style: SidebarStyle) => void;
  fontSize: FontSizePreference;
  setFontSize: (size: FontSizePreference) => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  resetPreferences: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeMode must be used inside ThemeProvider");
  }
  return context;
}
