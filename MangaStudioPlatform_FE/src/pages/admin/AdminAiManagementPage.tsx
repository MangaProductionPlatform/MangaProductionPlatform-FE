import { useState, type FormEvent } from "react";
import { Bot, Save } from "lucide-react";
import { useToast } from "../../shared/components/toastContext";
import { mangaErpApi } from "../../shared/services/mangaErpService";

export default function AdminAiManagementPage() {
  const toast = useToast();
  const [url, setUrl] = useState("");
  const [internalApiKey, setInternalApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const result = await mangaErpApi.updateSamConfig({
        Url: url.trim(),
        InternalApiKey: internalApiKey,
      });
      toast.success("SAM config updated", result.message);
      setInternalApiKey("");
    } catch (error) {
      toast.error("Could not update SAM config", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">Admin</p>
        <h2 className="mt-2 text-3xl font-black text-white">AI management</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Runtime configuration for the SAM service used by segmentation and image validation.
        </p>
      </header>

      <form onSubmit={submit} className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-200">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white">SAM service configuration</h3>
            <p className="text-sm text-slate-400">Backend endpoint: PATCH /api/v1/admin/sam-config</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <label className="text-sm text-slate-400">
            SAM service URL
            <input
              required
              className="input mt-2"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://sam-service.example.com"
            />
          </label>
          <label className="text-sm text-slate-400">
            Internal API key
            <input
              className="input mt-2"
              type="password"
              value={internalApiKey}
              onChange={(event) => setInternalApiKey(event.target.value)}
              placeholder="Leave blank only if backend accepts blank key"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={isSaving || !url.trim()}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-50"
        >
          <Save size={16} />
          {isSaving ? "Saving..." : "Save SAM config"}
        </button>
      </form>
    </div>
  );
}
