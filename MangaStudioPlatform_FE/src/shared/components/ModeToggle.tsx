import { Moon, Sun } from "lucide-react";
import { useThemeMode } from "./themeModeContext";

type ModeToggleProps = {
  compact?: boolean;
};

export default function ModeToggle({ compact = false }: ModeToggleProps) {
  const { mode, toggleMode } = useThemeMode();
  const isDark = mode === "dark";
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggleMode}
      className="mode-toggle"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="mode-toggle__icon">
        <Icon size={16} />
      </span>
      {compact ? null : <span className="mode-toggle__label">{isDark ? "Light" : "Dark"}</span>}
    </button>
  );
}
