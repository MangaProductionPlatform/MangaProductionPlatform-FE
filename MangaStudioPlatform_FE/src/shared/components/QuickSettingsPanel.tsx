import { useEffect, type ReactNode } from "react";
import {
  Eye,
  Moon,
  PanelLeftClose,
  PanelLeftDashed,
  PanelLeftOpen,
  Pin,
  RotateCcw,
  Settings,
  Sun,
  X,
} from "lucide-react";
import { useThemeMode, type AccentPreset, type FontSizePreference, type SidebarStyle } from "./themeModeContext";
import "./quickSettingsPanel.css";

const accents: Array<{ value: AccentPreset; label: string; color: string }> = [
  { value: "cyan", label: "Ocean", color: "#22d3ee" },
  { value: "violet", label: "Violet", color: "#a78bfa" },
  { value: "emerald", label: "Forest", color: "#34d399" },
  { value: "amber", label: "Sunset", color: "#fbbf24" },
  { value: "rose", label: "Sakura", color: "#fb7185" },
];

const sidebarOptions: Array<{ value: SidebarStyle; label: string; icon: typeof Pin }> = [
  { value: "pinned", label: "Pinned", icon: Pin },
  { value: "collapsed", label: "Collapsed", icon: PanelLeftClose },
  { value: "icons", label: "Icons only", icon: PanelLeftDashed },
  { value: "auto-hide", label: "Auto hide", icon: Eye },
];

const fontOptions: Array<{ value: FontSizePreference; label: string; sample: string }> = [
  { value: "small", label: "Small", sample: "Aa" },
  { value: "medium", label: "Medium", sample: "Aa" },
  { value: "large", label: "Large", sample: "Aa" },
];

export function QuickSettingsTrigger({ className = "" }: { className?: string }) {
  const { setSettingsOpen } = useThemeMode();
  return (
    <button type="button" onClick={() => setSettingsOpen(true)} className={`quick-settings-trigger ${className}`} aria-label="Open quick settings" title="Quick settings">
      <Settings size={18} />
    </button>
  );
}

export default function QuickSettingsPanel() {
  const {
    mode, setMode, accent, setAccent, sidebarStyle, setSidebarStyle,
    sidebarPeekOpen, setSidebarPeekOpen,
    fontSize, setFontSize, settingsOpen, setSettingsOpen, resetPreferences,
  } = useThemeMode();

  useEffect(() => {
    if (!settingsOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSettingsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [settingsOpen, setSettingsOpen]);

  return (
    <>
      <QuickSettingsTrigger className="quick-settings-floating-trigger" />
      <button
        type="button"
        className="sidebar-reveal-trigger"
        onClick={() => setSidebarPeekOpen(true)}
        aria-label="Temporarily open sidebar"
        title="Open sidebar"
      >
        <PanelLeftOpen size={19} />
      </button>
      {sidebarPeekOpen ? (
        <button
          type="button"
          className="sidebar-peek-backdrop"
          onClick={() => setSidebarPeekOpen(false)}
          aria-label="Close temporary sidebar"
        />
      ) : null}
      {settingsOpen ? (
        <div className="quick-settings-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSettingsOpen(false); }}>
          <aside className="quick-settings-panel" role="dialog" aria-modal="true" aria-labelledby="quick-settings-title">
            <header className="quick-settings-panel__header">
              <div><p>Personalize</p><h2 id="quick-settings-title">Quick Settings</h2></div>
              <button type="button" onClick={() => setSettingsOpen(false)} aria-label="Close quick settings"><X size={19} /></button>
            </header>

            <section className="quick-settings-section">
              <div className="quick-settings-section__heading"><h3>Appearance</h3><span>Choose interface brightness</span></div>
              <div className="quick-settings-segmented">
                <OptionButton active={mode === "light"} onClick={() => setMode("light")} icon={<Sun size={17} />} label="Light" />
                <OptionButton active={mode === "dark"} onClick={() => setMode("dark")} icon={<Moon size={17} />} label="Dark" />
              </div>
            </section>

            <section className="quick-settings-section">
              <div className="quick-settings-section__heading"><h3>Accent color</h3><span>System theme preset</span></div>
              <div className="quick-settings-accents">
                {accents.map((item) => (
                  <button key={item.value} type="button" className={accent === item.value ? "is-active" : ""} onClick={() => setAccent(item.value)} title={item.label} aria-label={`${item.label} accent`}>
                    <span style={{ backgroundColor: item.color }} /><small>{item.label}</small>
                  </button>
                ))}
              </div>
            </section>

            <section className="quick-settings-section">
              <div className="quick-settings-section__heading"><h3>Sidebar style</h3><span>Desktop navigation behavior</span></div>
              <div className="quick-settings-grid">
                {sidebarOptions.map(({ value, label, icon: Icon }) => (
                  <OptionButton key={value} active={sidebarStyle === value} onClick={() => setSidebarStyle(value)} icon={<Icon size={17} />} label={label} />
                ))}
              </div>
            </section>

            <section className="quick-settings-section">
              <div className="quick-settings-section__heading"><h3>Font size</h3><span>Scale interface content</span></div>
              <div className="quick-settings-fonts">
                {fontOptions.map((item, index) => (
                  <button key={item.value} type="button" className={fontSize === item.value ? "is-active" : ""} onClick={() => setFontSize(item.value)}>
                    <b style={{ fontSize: `${0.85 + index * 0.18}rem` }}>{item.sample}</b><small>{item.label}</small>
                  </button>
                ))}
              </div>
            </section>

            <footer>
              <button type="button" onClick={resetPreferences}><RotateCcw size={16} />Reset defaults</button>
              <span>Saved on this device</span>
            </footer>
          </aside>
        </div>
      ) : null}
    </>
  );
}

function OptionButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return <button type="button" className={active ? "is-active" : ""} onClick={onClick}>{icon}<span>{label}</span></button>;
}
