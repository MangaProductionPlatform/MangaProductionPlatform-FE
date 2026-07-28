import { useEffect, useState } from "react";
import { MailPlus, RefreshCw, XCircle } from "lucide-react";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type {
  AssistantCandidateDto,
  MangaSeriesDto,
  StudioInvitationDto,
} from "../../shared/types/mangaErp";
import { useToast } from "../../shared/components/toastContext";

export default function AssistantsPage() {
  const toast = useToast();
  const [series, setSeries] = useState<MangaSeriesDto[]>([]);
  const [seriesId, setSeriesId] = useState("");
  const [assistants, setAssistants] = useState<AssistantCandidateDto[]>([]);
  const [assistantId, setAssistantId] = useState("");
  const [message, setMessage] = useState("");
  const [invitations, setInvitations] = useState<StudioInvitationDto[]>([]);
  const [busy, setBusy] = useState(false);
  const loadInvitations = async (id = seriesId) => {
    if (!id) return;
    try {
      setInvitations(await mangaErpApi.getSeriesInvitations(id));
    } catch (e) {
      toast.error(
        "Could not load invitations",
        e instanceof Error ? e.message : "Unknown error",
      );
    }
  };
  useEffect(() => {
    Promise.all([
      mangaErpApi.getMySeries(),
      mangaErpApi.getMyManagedAssistants(),
    ])
      .then(([seriesItems, assistantItems]) => {
        setSeries(seriesItems);
        setAssistants(assistantItems);
        if (seriesItems[0]) setSeriesId(seriesItems[0].id);
      })
      .catch((e) =>
        toast.error(
          "Could not load series",
          e instanceof Error ? e.message : "Unknown error",
        ),
      );
  }, [toast]);
  useEffect(() => {
    // Fetch the selected series invitation history.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (seriesId) void loadInvitations(seriesId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seriesId]);
  const invite = async () => {
    const selectedAssistant = assistants.find(
      (assistant) => assistant.assistantId === assistantId,
    );

    if (!seriesId || !selectedAssistant?.email) {
      toast.error(
        "Assistant is required",
        "Select an Assistant managed by you before sending an invitation.",
      );
      return;
    }

    setBusy(true);
    try {
      await mangaErpApi.inviteAssistant(seriesId, {
        assistantEmail: selectedAssistant.email,
        message: message.trim() || null,
      });
      toast.success("Invitation sent");
      setAssistantId("");
      setMessage("");
      await loadInvitations();
    } catch (e) {
      toast.error(
        "Invitation failed",
        e instanceof Error ? e.message : "Unknown error",
      );
    } finally {
      setBusy(false);
    }
  };
  const cancel = async (invitationId: string) => {
    setBusy(true);
    try {
      await mangaErpApi.cancelSeriesInvitation(invitationId);
      toast.success("Invitation cancelled");
      await loadInvitations();
    } catch (e) {
      toast.error(
        "Could not cancel invitation",
        e instanceof Error ? e.message : "Unknown error",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[.28em] text-cyan-200">
          Mangaka · Studio
        </p>
        <h2 className="mt-2 text-3xl font-black text-white">
          Assistant invitations
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Invite an Assistant by email and track invitation status for each
          series.
        </p>
      </div>
      <section className="grid gap-3 rounded-lg border border-white/10 bg-slate-900/75 p-5 md:grid-cols-2">
        <select
          className="input"
          value={seriesId}
          onChange={(e) => setSeriesId(e.target.value)}
        >
          <option value="">Select series</option>
          {series.map((x) => (
            <option key={x.id} value={x.id}>
              {x.title}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={assistantId}
          onChange={(e) => setAssistantId(e.target.value)}
        >
          <option value="">Select an Assistant</option>
          {assistants.map((assistant) => (
            <option key={assistant.assistantId} value={assistant.assistantId}>
              {assistant.displayName}
              {assistant.email ? ` (${assistant.email})` : ""}
            </option>
          ))}
        </select>
        <textarea
          className="input min-h-24 md:col-span-2"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Invitation message (optional)"
        />
        <button
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 font-bold text-slate-950"
          onClick={() => void invite()}
        >
          <MailPlus size={16} />
          Send invitation
        </button>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-white"
          onClick={() => void loadInvitations()}
        >
          <RefreshCw size={16} />
          Refresh history
        </button>
      </section>
      <section className="space-y-3">
        {invitations.map((x) => (
          <article
            key={x.invitationId}
            className="rounded-lg border border-white/10 bg-slate-900/75 p-4"
          >
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <h3 className="font-bold text-white">{x.assistantEmail}</h3>
                <p className="mt-1 text-sm text-slate-400">
                  {x.message || "No message"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-fit rounded-md bg-cyan-300/10 px-2 py-1 text-sm text-cyan-100">
                  {x.status}
                </span>
                {x.status.toLowerCase() === "pending" ? (
                  <button
                    type="button"
                    title="Cancel invitation"
                    disabled={busy}
                    onClick={() => void cancel(x.invitationId)}
                    className="icon-button text-rose-200"
                  >
                    <XCircle size={16} />
                  </button>
                ) : null}
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Expires {new Date(x.expiresAt).toLocaleString()}
            </p>
          </article>
        ))}
        {!invitations.length ? (
          <p className="rounded-lg border border-white/10 bg-slate-900/75 p-5 text-sm text-slate-400">
            No invitations for this series.
          </p>
        ) : null}
      </section>
    </div>
  );
}
