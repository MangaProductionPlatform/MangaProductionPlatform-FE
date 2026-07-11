import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ThemeContext,
  type AccentPreset,
  type FontSizePreference,
  type SidebarStyle,
  type ThemeMode,
} from "./themeModeContext";

const storageKeys = {
  mode: "mangaStudioTheme",
  accent: "mangaStudioAccent",
  sidebar: "mangaStudioSidebar",
  fontSize: "mangaStudioFontSize",
} as const;

function getInitialMode(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  const saved = window.localStorage.getItem(storageKeys.mode);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function getStoredValue<T extends string>(
  key: string,
  allowed: readonly T[],
  fallback: T,
): T {
  if (typeof window === "undefined") return fallback;
  const saved = window.localStorage.getItem(key) as T | null;
  return saved && allowed.includes(saved) ? saved : fallback;
}

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(getInitialMode);
  const [accent, setAccent] = useState<AccentPreset>(() =>
    getStoredValue(
      storageKeys.accent,
      ["cyan", "violet", "emerald", "amber", "rose"],
      "cyan",
    ),
  );
  const [sidebarStyle, setSidebarStyleState] = useState<SidebarStyle>(() =>
    getStoredValue(storageKeys.sidebar, ["pinned", "icons"], "pinned"),
  );
  const [fontSize, setFontSize] = useState<FontSizePreference>(() =>
    getStoredValue(
      storageKeys.fontSize,
      ["small", "medium", "large"],
      "medium",
    ),
  );
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = mode;
    root.classList.toggle("dark", mode === "dark");
    root.style.colorScheme = mode;
    window.localStorage.setItem(storageKeys.mode, mode);
  }, [mode]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.accent = accent;
    root.dataset.sidebar = sidebarStyle;
    root.dataset.fontSize = fontSize;
    window.localStorage.setItem(storageKeys.accent, accent);
    window.localStorage.setItem(storageKeys.sidebar, sidebarStyle);
    window.localStorage.setItem(storageKeys.fontSize, fontSize);
  }, [accent, sidebarStyle, fontSize]);

  const setMode = useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode);
  }, []);

  const setSidebarStyle = useCallback((nextStyle: SidebarStyle) => {
    setSidebarStyleState(nextStyle);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  const resetPreferences = useCallback(() => {
    setModeState("dark");
    setAccent("cyan");
    setSidebarStyle("pinned");
    setFontSize("medium");
  }, [setSidebarStyle]);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      toggleMode,
      accent,
      setAccent,
      sidebarStyle,
      setSidebarStyle,
      fontSize,
      setFontSize,
      settingsOpen,
      setSettingsOpen,
      resetPreferences,
    }),
    [
      mode,
      setMode,
      toggleMode,
      accent,
      sidebarStyle,
      setSidebarStyle,
      fontSize,
      settingsOpen,
      resetPreferences,
    ],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
