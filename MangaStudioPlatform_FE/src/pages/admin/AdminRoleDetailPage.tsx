import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BadgeCheck, BriefcaseBusiness, ListChecks, ShieldCheck, Users } from "lucide-react";
import { useToast } from "../../shared/components/toastContext";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { AdminRoleDto } from "../../shared/types/mangaErp";

type RoleProfile = {
  summary: string;
  responsibilities: string[];
  workflow: string[];
  permissions: string[];
};

const roleProfiles: Record<string, RoleProfile> = {
  admin: {
    summary: "Quản trị vận hành hệ thống, tạo tài khoản, phân quyền và theo dõi tình trạng nền tảng.",
    responsibilities: [
      "Tạo và quản lý tài khoản nhân sự, Mangaka, Tantou Editor, EB và Assistant.",
      "Thiết lập thông tin vận hành như trạng thái tài khoản, role và dữ liệu quản trị.",
      "Theo dõi dashboard để phát hiện queue, tài khoản hoặc workflow cần xử lý.",
    ],
    workflow: [
      "Provision tài khoản đúng role.",
      "Gán Tantou phụ trách khi tạo Mangaka nếu nghiệp vụ yêu cầu.",
      "Giám sát hệ thống, không thay EB/Tantou xử lý nghiệp vụ chuyên môn.",
    ],
    permissions: ["Account management", "Role management", "Admin dashboard", "Operational monitoring"],
  },
  editorialboard: {
    summary: "Ban biên tập duyệt series submission, bỏ phiếu và quyết định hướng xử lý bản thảo.",
    responsibilities: [
      "Xem các submission ở trạng thái Pending_EB_Review.",
      "Bỏ phiếu approve, reject hoặc yêu cầu chỉnh sửa theo flow duyệt.",
      "Quản lý hoạt động xuất bản như lịch phát hành và ranking tùy màn hình được cấp.",
    ],
    workflow: [
      "Mangaka submit series.",
      "Submission chuyển vào EB queue.",
      "EB review nội dung, vote và hệ thống tổng hợp kết quả.",
    ],
    permissions: ["Submission review", "Editorial voting", "Publishing schedule", "Board reports"],
  },
  tantoueditor: {
    summary: "Biên tập viên phụ trách 1-1 với Mangaka, theo dõi sản xuất chapter và QA bản vẽ.",
    responsibilities: [
      "Đồng hành cùng Mangaka sau khi series đã được duyệt và đi vào sản xuất.",
      "Kiểm tra QA chapter, ghim lỗi, gửi feedback và approve chapter đạt chuẩn.",
      "Theo dõi các series/Mangaka được gán phụ trách.",
    ],
    workflow: [
      "Sau khi series được duyệt, Tantou được gán phụ trách Mangaka hoặc series.",
      "Mangaka tạo chapter và gửi QA.",
      "Tantou kiểm tra bản vẽ, yêu cầu sửa hoặc approve.",
    ],
    permissions: ["QA review", "Bug pins", "Assigned series monitoring", "Chapter feedback"],
  },
  mangaka: {
    summary: "Tác giả manga, người tạo proposal series, quản lý series và điều phối studio vẽ.",
    responsibilities: [
      "Tạo draft series submission và nộp bản thảo cho EB duyệt.",
      "Cập nhật bản thảo khi EB yêu cầu chỉnh sửa.",
      "Tạo chapter, giao task cho Assistant và xử lý feedback QA.",
    ],
    workflow: [
      "Tạo submission series.",
      "Submit để chuyển sang Pending_EB_Review.",
      "Khi approved, tạo chapter và quản lý tiến độ sản xuất.",
    ],
    permissions: ["Series submission", "Chapter creation", "Studio task assignment", "QA revision handling"],
  },
  assistant: {
    summary: "Trợ lý vẽ hỗ trợ Mangaka hoàn thành các phần việc trong chapter theo task được giao.",
    responsibilities: [
      "Nhận task từ Mangaka hoặc hệ thống phân công.",
      "Submit tiến độ và layer artwork theo yêu cầu.",
      "Sửa lại phần việc khi có feedback hoặc yêu cầu QA.",
    ],
    workflow: [
      "Được mời vào studio hoặc được gán task.",
      "Thực hiện phần vẽ được giao.",
      "Submit layer/progress để Mangaka hoặc workflow liên quan review.",
    ],
    permissions: ["Assigned tasks", "Progress submission", "Layer submission", "Personal income view"],
  },
  editorinchief: {
    summary: "Tổng biên tập, xử lý các trường hợp xung đột hoặc quyết định cuối cùng của editorial workflow.",
    responsibilities: [
      "Xem các case bị escalated khi EB không đồng thuận.",
      "Ra quyết định cuối cùng cho conflict.",
      "Theo dõi toàn cảnh hoạt động biên tập ở cấp cao hơn EB thường.",
    ],
    workflow: [
      "EB vote bị split hoặc conflict.",
      "Case chuyển sang Conflict_Escalated.",
      "Editor-in-Chief review kết quả và chốt approve hoặc reject.",
    ],
    permissions: ["Conflict resolution", "Editorial oversight", "Board-level review", "Final decision"],
  },
};

function normalizeRoleName(name: string) {
  return name.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

function defaultProfile(roleName: string): RoleProfile {
  return {
    summary: `${roleName} là role hệ thống được backend trả về cho account provisioning và phân quyền truy cập.`,
    responsibilities: ["Kiểm soát quyền truy cập theo role.", "Chỉ thấy các màn hình và hành động được backend cho phép."],
    workflow: ["Đăng nhập bằng tài khoản role tương ứng.", "Truy cập module được cấp quyền trong hệ thống."],
    permissions: ["Role-based access"],
  };
}

export default function AdminRoleDetailPage() {
  const { roleValue = "" } = useParams();
  const toast = useToast();
  const [roles, setRoles] = useState<AdminRoleDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function loadRoles() {
      try {
        const result = await mangaErpApi.getAdminRoles();
        if (!ignore) setRoles(result);
      } catch (error) {
        if (!ignore) toast.error("Could not load role detail", error instanceof Error ? error.message : "Unknown error");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    void loadRoles();
    return () => {
      ignore = true;
    };
    // Initial backend load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const role = useMemo(
    () => roles.find((item) => String(item.value) === roleValue),
    [roleValue, roles],
  );
  const profile = role ? roleProfiles[normalizeRoleName(role.name)] ?? defaultProfile(role.name) : null;

  if (!isLoading && !role) {
    return (
      <div className="space-y-6">
        <Link to="/admin/roles" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 hover:text-cyan-100">
          <ArrowLeft size={16} />
          Back to roles
        </Link>
        <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">
          <ShieldCheck className="mx-auto text-slate-500" />
          <p className="mt-3">Role detail was not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/admin/roles" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 hover:text-cyan-100">
        <ArrowLeft size={16} />
        Back to roles
      </Link>

      <header className="rounded-lg border border-white/10 bg-slate-900/75 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">Role value {role?.value ?? roleValue}</p>
            <h2 className="mt-2 text-3xl font-black text-white">{role?.name ?? "Loading role"}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              {profile?.summary ?? "Loading role detail..."}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-200">
            <BadgeCheck size={22} />
          </div>
        </div>
        {role?.description ? (
          <p className="mt-5 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-slate-300">
            {role.description}
          </p>
        ) : null}
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        <DetailPanel icon={<Users size={18} />} title="Who They Are" items={profile?.responsibilities ?? []} />
        <DetailPanel icon={<BriefcaseBusiness size={18} />} title="Mainflow Role" items={profile?.workflow ?? []} />
        <DetailPanel icon={<ListChecks size={18} />} title="Access Scope" items={profile?.permissions ?? []} />
      </section>
    </div>
  );
}

function DetailPanel({ icon, title, items }: { icon: ReactNode; title: string; items: string[] }) {
  return (
    <article className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-200">{icon}</span>
        <h3 className="text-base font-bold text-white">{title}</h3>
      </div>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
        {items.map((item) => (
          <li key={item} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}
