import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Copy, Mail, Save, ShieldCheck, Trash2 } from "lucide-react";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { AdminUserDto } from "../../shared/types/mangaErp";
import { useToast } from "../../shared/components/toastContext";

type AdminAssistantCandidate = {
  assistantId: string;
  displayName: string;
  email: string;
  collaborationId?: string | null;
  concurrencyToken?: string | null;
  expectedConcurrencyToken?: string | null;
};

const roles = [
  [0, "Admin"],
  [1, "EditorialBoard"],
  [2, "TantouEditor"],
  [3, "Mangaka"],
  [4, "Assistant"],
  [5, "EditorInChief"],
  [99, "Reader"],
] as const;
const statuses = [
  [0, "PendingActivation"],
  [1, "Active"],
  [2, "Suspended"],
  [3, "Deactivated"],
] as const;

// Trang quản lý một tài khoản riêng lẻ; thay đổi role/status được gửi qua endpoint chuyên biệt.
export default function AdminUserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [user, setUser] = useState<AdminUserDto | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    personalEmail: "",
    phoneNumber: "",
    managingTantouId: "",
    role: 1,
    status: 1,
  });
  const [busy, setBusy] = useState(false);
  const [managedAssistants, setManagedAssistants] = useState<
    AdminAssistantCandidate[]
  >([]);
  const [unassignedAssistants, setUnassignedAssistants] = useState<
    AdminAssistantCandidate[]
  >([]);
  const [selectedAssistantIds, setSelectedAssistantIds] = useState<string[]>(
    [],
  );
  const [isLoadingManagedAssistants, setIsLoadingManagedAssistants] =
    useState(false);
  const [isLoadingAssistants, setIsLoadingAssistants] = useState(false);
  const [isAssigningAssistants, setIsAssigningAssistants] = useState(false);
  const [endingCollaborationId, setEndingCollaborationId] = useState<
    string | null
  >(null);

  const applyUser = (value: AdminUserDto) => {
    setUser(value);
    setForm({
      fullName: value.fullName ?? "",
      personalEmail: value.personalEmail ?? "",
      phoneNumber: value.phoneNumber ?? "",
      managingTantouId: value.managingTantouId ?? "",
      role: roles.find(([, name]) => name === value.role)?.[0] ?? 1,
      status:
        statuses.find(([, name]) => name === value.accountStatus)?.[0] ?? 1,
    });
  };
  const reload = async () => {
    if (id) applyUser(await mangaErpApi.getUser(id));
  };

  useEffect(() => {
    let ignore = false;
    if (!id) return;
    mangaErpApi
      .getUser(id)
      .then((value) => {
        if (!ignore) applyUser(value);
      })
      .catch((error) =>
        toast.error(
          "Could not load user",
          error instanceof Error ? error.message : "Unknown error",
        ),
      );
    return () => {
      ignore = true;
    };
  }, [id, toast]);

  const loadUnassignedAssistants = async () => {
    setIsLoadingAssistants(true);
    try {
      setUnassignedAssistants(await mangaErpApi.getUnassignedAssistants());
    } catch (error) {
      toast.error(
        "Could not load unassigned Assistants",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setIsLoadingAssistants(false);
    }
  };

  const loadManagedAssistants = async () => {
    if (!user) return;

    setIsLoadingManagedAssistants(true);
    try {
      setManagedAssistants(
        await mangaErpApi.getAdminMangakaAssistants(user.userId),
      );
    } catch (error) {
      toast.error(
        "Could not load this Mangaka's Assistants",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setIsLoadingManagedAssistants(false);
    }
  };

  useEffect(() => {
    if (user?.role !== "Mangaka") return;

    const loadTimer = window.setTimeout(() => {
      void loadUnassignedAssistants();
      void loadManagedAssistants();
    }, 0);

    return () => window.clearTimeout(loadTimer);
    // Loading is intentionally tied to the managed Mangaka account.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId, user?.role]);

  const toggleAssistant = (assistantId: string) => {
    setSelectedAssistantIds((current) => {
      if (current.includes(assistantId)) {
        return current.filter((id) => id !== assistantId);
      }

      return managedAssistants.length + current.length < 4
        ? [...current, assistantId]
        : current;
    });
  };

  const assignSelectedAssistants = async () => {
    if (!user || selectedAssistantIds.length === 0) return;

    setIsAssigningAssistants(true);
    try {
      for (const assistantId of selectedAssistantIds) {
        await mangaErpApi.assignAssistantToMangaka(assistantId, {
          MangakaId: user.userId,
        });
      }

      toast.success(
        `${selectedAssistantIds.length} Assistant(s) assigned to ${user.fullName || user.username}.`,
      );
      setSelectedAssistantIds([]);
      await Promise.all([loadUnassignedAssistants(), loadManagedAssistants()]);
    } catch (error) {
      toast.error(
        "Could not assign Assistants",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setIsAssigningAssistants(false);
    }
  };

  const endCollaboration = async (assistant: AdminAssistantCandidate) => {
    const expectedConcurrencyToken =
      assistant.expectedConcurrencyToken ?? assistant.concurrencyToken;
    if (!assistant.collaborationId || !expectedConcurrencyToken) return;

    const reason = window.prompt(
      `Reason for ending collaboration with ${assistant.displayName}:`,
    );
    if (reason === null || !reason.trim()) return;
    if (
      !window.confirm(
        `End collaboration with ${assistant.displayName}? This returns the Assistant to the Admin pool.`,
      )
    )
      return;

    setEndingCollaborationId(assistant.collaborationId);
    try {
      await mangaErpApi.endStudioCollaboration(assistant.collaborationId, {
        reason: reason.trim(),
        expectedConcurrencyToken,
      });
      toast.success(`${assistant.displayName} was removed from this Mangaka.`);
      await Promise.all([loadUnassignedAssistants(), loadManagedAssistants()]);
    } catch (error) {
      toast.error(
        "Could not end collaboration",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setEndingCollaborationId(null);
    }
  };

  const run = async (
    action: () => Promise<unknown>,
    success: string,
    refresh = true,
  ) => {
    setBusy(true);
    try {
      await action();
      toast.success(success);
      if (refresh) await reload();
      return true;
    } catch (error) {
      toast.error(
        "Admin action failed",
        error instanceof Error ? error.message : "Unknown error",
      );
      return false;
    } finally {
      setBusy(false);
    }
  };

  if (!user)
    return (
      <div className="rounded-lg border border-white/10 bg-slate-900/75 p-5 text-slate-300">
        Loading user...
      </div>
    );

  return (
    <div className="space-y-5">
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200"
      >
        <ArrowLeft size={16} />
        Back to Users
      </Link>
      <section className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[.28em] text-cyan-200">
              Admin · Account
            </p>
            <h2 className="mt-2 text-3xl font-black text-white">
              {user.fullName || user.username}
            </h2>
            <p className="text-sm text-slate-400">{user.username}</p>
          </div>
          <span className="h-fit rounded-lg bg-cyan-300/10 px-3 py-2 text-cyan-100">
            {user.accountStatus}
          </span>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cyan-300/20 bg-cyan-300/5 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-200">
              User ID / Tantou GUID
            </p>
            <code className="mt-1 block break-all text-sm text-white">
              {user.userId}
            </code>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-300 px-3 py-2 text-sm font-bold text-slate-950"
            onClick={() =>
              void navigator.clipboard
                .writeText(user.userId)
                .then(() => toast.success("User ID copied"))
            }
          >
            <Copy size={15} />
            Copy ID
          </button>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <label className="text-sm text-slate-400">
            Full name
            <input
              className="input mt-1"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </label>
          <label className="text-sm text-slate-400">
            Personal email
            <input
              className="input mt-1"
              type="email"
              value={form.personalEmail}
              onChange={(e) =>
                setForm({ ...form, personalEmail: e.target.value })
              }
            />
          </label>
          <label className="text-sm text-slate-400">
            Phone
            <input
              className="input mt-1"
              value={form.phoneNumber}
              onChange={(e) =>
                setForm({ ...form, phoneNumber: e.target.value })
              }
            />
          </label>
          <label className="text-sm text-slate-400">
            Managing Tantou ID
            <input
              className="input mt-1"
              value={form.managingTantouId}
              onChange={(e) =>
                setForm({ ...form, managingTantouId: e.target.value })
              }
            />
          </label>
          <label className="text-sm text-slate-400">
            Role
            <select
              className="input mt-1"
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: Number(e.target.value) })
              }
            >
              {roles.map(([value, name]) => (
                <option key={value} value={value}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-400">
            Status
            <select
              className="input mt-1"
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: Number(e.target.value) })
              }
            >
              {statuses.map(([value, name]) => (
                <option key={value} value={value}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-200 disabled:opacity-50"
            onClick={() =>
              void run(
                () =>
                  mangaErpApi.updateUser(user.userId, {
                    fullName: form.fullName,
                    personalEmail: form.personalEmail,
                    role: form.role,
                    phoneNumber: form.phoneNumber || null,
                    managingTantouId: form.managingTantouId || null,
                  }),
                "Account updated",
              )
            }
          >
            <Save size={16} />
            Save details
          </button>
          <button
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-50"
            onClick={() =>
              void run(
                () => mangaErpApi.updateUserRole(user.userId, form.role),
                "Role updated",
              )
            }
          >
            <ShieldCheck size={16} />
            Apply role
          </button>
          <button
            disabled={busy}
            className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-50"
            onClick={() =>
              void run(
                () => mangaErpApi.updateUserStatus(user.userId, form.status),
                "Status updated",
              )
            }
          >
            Apply status
          </button>
          <button
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-50"
            onClick={() =>
              void run(
                () => mangaErpApi.resendActivation(user.userId),
                "Activation email resent",
                false,
              )
            }
          >
            <Mail size={16} />
            Resend activation
          </button>
          <button
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-sm font-bold text-rose-200"
            onClick={() => {
              if (
                window.confirm(
                  `Delete ${user.username}? This cannot be undone.`,
                )
              )
                void run(
                  () => mangaErpApi.deleteUser(user.userId),
                  "Account deleted",
                  false,
                ).then((ok) => {
                  if (ok) navigate("/admin/users");
                });
            }}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </section>

      {user.role === "Mangaka" ? (
        <section className="rounded-lg border border-cyan-300/20 bg-slate-900/75 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-200">
                Assistant management
              </p>
              <h3 className="mt-1 text-xl font-black text-white">
                Assign Assistants to this Mangaka
              </h3>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                This Mangaka can manage up to four Assistants. Assigned
                Assistants leave the Admin pool and become available for this
                Mangaka to invite to a series.
              </p>
            </div>
            <span className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-cyan-100">
              {managedAssistants.length}/4 assigned
            </span>
          </div>

          <div className="mt-5">
            <h4 className="text-sm font-bold text-white">
              Assigned Assistants
            </h4>
            {isLoadingManagedAssistants ? (
              <p className="mt-3 text-sm text-slate-400">
                Loading assigned Assistants...
              </p>
            ) : managedAssistants.length ? (
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {managedAssistants.map((assistant) => (
                  <div
                    key={assistant.assistantId}
                    className="rounded-xl border border-cyan-300/30 bg-cyan-300/5 p-4"
                  >
                    <p className="font-semibold text-white">
                      {assistant.displayName}
                    </p>
                    <p className="mt-1 break-all text-sm text-slate-400">
                      {assistant.email || assistant.assistantId}
                    </p>
                    <button
                      type="button"
                      disabled={
                        !assistant.collaborationId ||
                        !(
                          assistant.expectedConcurrencyToken ??
                          assistant.concurrencyToken
                        ) ||
                        endingCollaborationId !== null
                      }
                      title={
                        !assistant.collaborationId ||
                        !(
                          assistant.expectedConcurrencyToken ??
                          assistant.concurrencyToken
                        )
                          ? "This Assistant record does not include the collaboration details required to end it."
                          : undefined
                      }
                      onClick={() => void endCollaboration(assistant)}
                      className="mt-4 rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {endingCollaborationId === assistant.collaborationId
                        ? "Ending collaboration..."
                        : "End collaboration"}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 rounded-xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">
                No Assistants are assigned to this Mangaka yet.
              </p>
            )}
          </div>

          <h4 className="mt-6 text-sm font-bold text-white">
            Available Assistant pool
          </h4>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {isLoadingAssistants ? (
              <p className="text-sm text-slate-400">
                Loading unassigned Assistants...
              </p>
            ) : unassignedAssistants.length ? (
              unassignedAssistants.map((assistant) => {
                const isSelected = selectedAssistantIds.includes(
                  assistant.assistantId,
                );
                const isSelectionLimitReached =
                  managedAssistants.length + selectedAssistantIds.length >= 4 &&
                  !isSelected;

                return (
                  <label
                    key={assistant.assistantId}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${isSelected ? "border-cyan-300 bg-cyan-300/10" : "border-slate-700 bg-slate-950/50"} ${isSelectionLimitReached ? "cursor-not-allowed opacity-50" : "hover:border-cyan-300/60"}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={
                        isSelectionLimitReached || isAssigningAssistants
                      }
                      onChange={() => toggleAssistant(assistant.assistantId)}
                      className="mt-1 h-4 w-4 accent-cyan-300"
                    />
                    <span className="min-w-0">
                      <span className="block font-semibold text-white">
                        {assistant.displayName}
                      </span>
                      <span className="mt-1 block break-all text-sm text-slate-400">
                        {assistant.email || assistant.assistantId}
                      </span>
                    </span>
                  </label>
                );
              })
            ) : (
              <p className="rounded-xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">
                No unassigned Assistants are currently available in the Admin
                pool.
              </p>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={
                selectedAssistantIds.length === 0 || isAssigningAssistants
              }
              onClick={() => void assignSelectedAssistants()}
              className="rounded-lg bg-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAssigningAssistants
                ? "Assigning Assistants..."
                : `Assign selected Assistants (${selectedAssistantIds.length}/4)`}
            </button>
            <button
              type="button"
              disabled={
                isLoadingAssistants ||
                isLoadingManagedAssistants ||
                isAssigningAssistants
              }
              onClick={() =>
                void Promise.all([
                  loadUnassignedAssistants(),
                  loadManagedAssistants(),
                ])
              }
              className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Refresh Assistants
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
