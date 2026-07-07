import { Moon, Sun } from "lucide-react";
import { useThemeMode } from "./themeModeContext";

type ModeToggleProps = {
  className?: string;
  label?: boolean;
};

export default function ModeToggle({ className = "", label = false }: ModeToggleProps) {
  const { mode, toggleMode } = useThemeMode();
  const isDark = mode === "dark";

  return (
    <button
      type="button"
      onClick={toggleMode}
      className={`mode-toggle ${className}`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
      {label ? <span>{isDark ? "Light" : "Dark"}</span> : null}
    </button>
  );
}
