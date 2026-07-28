import { useEffect, useState } from "react";
import { Activity, Mail, ShieldCheck, User, UserCheck, Users } from "lucide-react";
import { useToast } from "../../shared/components/toastContext";
import {
  mangaErpApi,
  type AssistantCandidateDto,
} from "../../shared/services/mangaErpService";
import type { CurrentUser, CurrentUserProfileDto } from "../../shared/types/mangaErp";

export default function MangakaProfilePage() {
  const toast = useToast();
  const [profile, setProfile] = useState<CurrentUserProfileDto | null>(null);
  const [assistants, setAssistants] = useState<AssistantCandidateDto[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingAssistants, setIsLoadingAssistants] = useState(true);
  const currentUser = JSON.parse(
    localStorage.getItem("currentUser") || "null"
  ) as CurrentUser | null;

  useEffect(() => {
    let ignore = false;

    async function loadProfile() {
      try {
        const result = await mangaErpApi.getCurrentUserProfile();
        if (!ignore) setProfile(result);
      } catch (error) {
        if (!ignore) {
          toast.error(
            "Could not load profile",
            error instanceof Error ? error.message : "Please try again.",
          );
        }
      } finally {
        if (!ignore) setIsLoadingProfile(false);
      }
    }

    async function loadAssistants() {
      try {
        const result = await mangaErpApi.getMyManagedAssistants();
        if (!ignore) setAssistants(result);
      } catch (error) {
        if (!ignore) {
          toast.error(
            "Could not load Assistants",
            error instanceof Error ? error.message : "Please try again.",
          );
        }
      } finally {
        if (!ignore) setIsLoadingAssistants(false);
      }
    }

    void loadProfile();
    void loadAssistants();
    return () => {
      ignore = true;
    };
  }, [toast]);

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
          Mangaka Profile
        </p>

        <h1 className="mt-2 text-3xl font-black text-white">
          Profile
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Thông tin tài khoản Mangaka đang đăng nhập.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-cyan-500/10">
            <User size={34} className="text-cyan-300" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Mangaka Account
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Creator responsible for chapter production workflow.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Mail size={16} />
              Email
            </div>

            <p className="mt-2 font-semibold text-white">
              {profile?.email ?? currentUser?.email ?? "mangaka@studio.com"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldCheck size={16} />
              Role
            </div>

            <p className="mt-2 font-semibold text-cyan-300">
              {profile?.role ?? currentUser?.role ?? "mangaka"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center gap-2 text-slate-400">
              <UserCheck size={16} />
              Managing Tantou
            </div>

            <p className="mt-2 break-all font-semibold text-fuchsia-200">
              {isLoadingProfile
                ? "Loading..."
                : profile?.managingTantouId ?? "No Tantou assigned"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-fuchsia-500/10">
              <Users size={26} className="text-fuchsia-200" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">
                Managed Assistants
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Assistant accounts currently managed by this Mangaka.
              </p>
            </div>
          </div>

          <span className="rounded-xl border border-fuchsia-300/20 bg-fuchsia-300/10 px-3 py-2 text-sm font-bold text-fuchsia-100">
            {assistants.length}/4 assigned
          </span>
        </div>

        <div className="mt-6">
          {isLoadingAssistants ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm font-semibold text-slate-400">
              Loading managed Assistants...
            </div>
          ) : assistants.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {assistants.map((assistant) => {
                const displayName =
                  assistant.displayName || assistant.email || "Unnamed Assistant";
                const workload =
                  assistant.totalWorkload ?? assistant.activeTaskCount ?? 0;
                const capacity =
                  assistant.maxWorkload ??
                  (assistant.remainingCapacity !== null
                    ? workload + assistant.remainingCapacity
                    : null);

                return (
                  <article
                    key={assistant.assistantId || assistant.email}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-bold text-white">
                          {displayName}
                        </h3>
                        <p className="mt-1 break-all text-sm text-slate-400">
                          {assistant.email || "No email provided"}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-lg bg-emerald-300/10 px-2.5 py-1 text-xs font-bold text-emerald-200">
                        Active
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border border-slate-800 bg-slate-900/75 p-3">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          <Activity size={14} />
                          Workload
                        </div>
                        <p className="mt-2 font-bold text-cyan-100">
                          {capacity !== null ? `${workload}/${capacity}` : workload}
                        </p>
                      </div>

                      <div className="rounded-lg border border-slate-800 bg-slate-900/75 p-3">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          <UserCheck size={14} />
                          Assistant ID
                        </div>
                        <p className="mt-2 break-all text-sm font-semibold text-fuchsia-100">
                          {assistant.assistantId || "-"}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950 p-5 text-sm text-slate-400">
              This Mangaka is not managing any Assistants yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
