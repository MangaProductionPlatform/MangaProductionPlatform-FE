import { useEffect, useState } from "react";
import { useToast } from "../../shared/components/toastContext";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { StudioInvitationDto } from "../../shared/types/mangaErp";
import "./AssistantDashboardPage.css";

export default function AssistantDashboardPage() {
  const toast = useToast();
  const [items, setItems] = useState<StudioInvitationDto[]>([]);
  const [busy, setBusy] = useState("");

  const load = async () => {
    try {
      setItems(await mangaErpApi.getPendingInvitations());
    } catch (error) {
      toast.error(
        "Could not load invitations",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const respond = async (
    invitationId: string,
    response: "accept" | "decline",
  ) => {
    setBusy(invitationId);

    try {
      await mangaErpApi.respondToInvitation(invitationId, response);
      toast.success(
        response === "accept" ? "Invitation accepted" : "Invitation declined",
      );
      await load();
    } catch (error) {
      toast.error(
        "Response failed",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="assistant-dashboard-page space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[.28em] text-cyan-200">
          Assistant
        </p>
        <h2 className="mt-2 text-3xl font-black text-white">
          Pending studio invitations
        </h2>
      </header>

      <div className="space-y-3">
        {items.map((invitation) => (
          <article
            key={invitation.invitationId}
            className="rounded-lg border border-white/10 bg-slate-900/75 p-5"
          >
            <h3 className="font-bold text-white">
              Series {invitation.seriesId}
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              {invitation.message || "You were invited to join this studio."}
            </p>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                disabled={busy === invitation.invitationId}
                className="rounded-lg bg-cyan-300 px-4 py-2 font-bold text-slate-950"
                onClick={() => void respond(invitation.invitationId, "accept")}
              >
                Accept
              </button>
              <button
                type="button"
                disabled={busy === invitation.invitationId}
                className="rounded-lg border border-rose-400/30 px-4 py-2 text-rose-200"
                onClick={() => void respond(invitation.invitationId, "decline")}
              >
                Decline
              </button>
            </div>
          </article>
        ))}

        {items.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-slate-900/75 p-5 text-slate-400">
            No pending invitations.
          </div>
        ) : null}
      </div>
    </div>
  );
}
