import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Send, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { AdminUserDto, ProvisionRole } from "../../shared/types/mangaErp";
import { useToast } from "../../shared/components/toastContext";

const provisionRoles: { value: ProvisionRole; label: string }[] = [
  { value: 1, label: "Editorial Board" },
  { value: 2, label: "Tantou Editor" },
  { value: 3, label: "Mangaka" },
  { value: 4, label: "Assistant" },
  { value: 5, label: "Editor-in-Chief" },
];

// Chỉ Admin có thể provision tài khoản; tài khoản mới vẫn cần đi qua bước kích hoạt riêng.
export default function AdminCreateUserPage() {
  const toast = useToast();
  const [fullName, setFullName] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState<ProvisionRole>(3);
  const [managingTantouId, setManagingTantouId] = useState("");
  const [tantouUsers, setTantouUsers] = useState<AdminUserDto[]>([]);
  const [isLoadingEditors, setIsLoadingEditors] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedRole = useMemo(
    () => provisionRoles.find((item) => item.value === role),
    [role],
  );

  useEffect(() => {
    let ignore = false;

    async function loadTantouEditors() {
      try {
        const result = await mangaErpApi.listUsers({ roleFilter: 2 });
        if (!ignore) {
          setTantouUsers(result.users);
        }
      } catch (err) {
        if (!ignore) {
          toast.error(
            "Could not load Tantou editors",
            err instanceof Error ? err.message : "Please try again.",
          );
        }
      } finally {
        if (!ignore) setIsLoadingEditors(false);
      }
    }

    loadTantouEditors();
    return () => {
      ignore = true;
    };
  }, [toast]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
    if (nameParts.length < 2) {
      toast.error(
        "Full name is invalid",
        "Backend requires at least first and last name, for example: Cuong FPT.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await mangaErpApi.provisionAccount({
        fullName: fullName.trim(),
        personalEmail: personalEmail.trim(),
        phoneNumber: phoneNumber.trim() || null,
        role,
        managingTantouId: role === 3 && managingTantouId ? managingTantouId : null,
      });

      toast.success(
        "Account created",
        `Activation email sent. Username: ${result.generatedUsername}`,
      );
      setFullName("");
      setPersonalEmail("");
      setPhoneNumber("");
      setManagingTantouId("");
      setRole(3);
    } catch (err) {
      toast.error(
        "Could not create account",
        err instanceof Error ? err.message : "Please check the form and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 hover:text-cyan-100"
      >
        <ArrowLeft size={16} />
        Back to Users
      </Link>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Admin
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            Create staff account
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Provision an internal account and send the activation link by email.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-300">
          <UserPlus size={16} className="text-cyan-200" />
          {selectedRole?.label}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-5 rounded-lg border border-white/10 bg-slate-900/75 p-5 lg:grid-cols-2"
      >
        <Field label="Full name">
          <input
            required
            className="input"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Nguyen Van A (at least 2 words)"
          />
        </Field>

        <Field label="Email">
          <input
            required
            type="email"
            className="input"
            value={personalEmail}
            onChange={(event) => setPersonalEmail(event.target.value)}
            placeholder="staff@example.com"
          />
        </Field>

        <Field label="Phone number">
          <input
            type="tel"
            className="input"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            placeholder="090..."
          />
        </Field>

        <Field label="Role">
          <select
            className="input"
            value={role}
            onChange={(event) => {
              setRole(Number(event.target.value) as ProvisionRole);
              setManagingTantouId("");
            }}
          >
            {provisionRoles.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>

        {role === 3 ? (
          <Field label="Managing Tantou editor">
            <select
              required
              className="input"
              value={managingTantouId}
              onChange={(event) => setManagingTantouId(event.target.value)}
              disabled={isLoadingEditors}
            >
              <option value="">
                {isLoadingEditors
                  ? "Loading editors..."
                  : tantouUsers.length
                    ? "Select Tantou editor"
                    : "No Tantou Editor found — create one first"}
              </option>
              {tantouUsers.map((user) => (
                <option key={user.userId} value={user.userId}>
                  {user.fullName ?? user.username}
                </option>
              ))}
            </select>
            {!isLoadingEditors && tantouUsers.length === 0 ? (
              <p className="mt-2 text-xs text-amber-200">
                Mangaka can be created without a managing Tantou Editor. Admin
                can assign one later from the account detail page.
              </p>
            ) : null}
          </Field>
        ) : null}

        <div className="flex items-end lg:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send size={16} />
            {isSubmitting ? "Creating..." : "Create account & send activation link"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-200">
        {label}
      </span>
      {children}
    </label>
  );
}
