import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import { useToast } from "../../shared/components/toastContext";

// Settings giữ nguyên JSON từ backend để không áp đặt schema chưa được cung cấp.
export default function AdminSystemSettingsPage() {
  const toast = useToast();

  const [value, setValue] = useState("{}");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    setIsLoading(true);

    try {
      const settings = await mangaErpApi.getAdminSettings();
      setValue(JSON.stringify(settings, null, 2));
    } catch (error) {
      toast.error(
        "Could not load settings",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
    // Chỉ tải cấu hình một lần khi mở trang; Reload do Admin chủ động thực hiện.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    setIsSaving(true);

    try {
      const settings = JSON.parse(value) as Record<string, unknown>;
      await mangaErpApi.updateAdminSettings(settings);
      toast.success("Settings saved", "System settings were updated.");
    } catch (error) {
      toast.error(
        "Could not save settings",
        error instanceof Error
          ? error.message
          : "Enter valid JSON matching backend settings.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[.28em] text-cyan-200">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-black text-white">System settings</h1>
        <p className="mt-2 text-sm text-slate-400">
          Configuration returned by the backend. Edit only keys supported by
          your backend.
        </p>
      </header>

      <section
        className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
        aria-busy={isLoading || isSaving}
      >
        <textarea
          className="input min-h-96 font-mono text-xs leading-6"
          value={value}
          disabled={isLoading || isSaving}
          onChange={(event) => setValue(event.target.value)}
          aria-label="System settings JSON"
        />

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void load()}
            disabled={isLoading || isSaving}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Reload"}
          </button>

          <button
            type="button"
            onClick={() => void save()}
            disabled={isLoading || isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={16} />
            {isSaving ? "Saving..." : "Save settings"}
          </button>
        </div>
      </section>
    </div>
  );
}
