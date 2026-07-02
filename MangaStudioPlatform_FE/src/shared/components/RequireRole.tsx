import { Navigate, Outlet } from "react-router-dom";
import type { AppRole, CurrentUser } from "../types/mangaErp";

const roleHome: Record<AppRole, string> = {
  reader: "/app/dashboard",
  mangaka: "/mangaka/dashboard",
  assistant: "/assistant/dashboard",
  editor: "/app/editor/dashboard",
  editorial_board: "/app/board/dashboard",
  editor_in_chief: "/app/board/dashboard",
  admin: "/admin/dashboard",
};

export function RequireRole({ roles }: { roles: AppRole[] }) {
  const currentUser = readCurrentUser();

  if (!currentUser) return <Navigate to="/login" replace />;
  if (!roles.includes(currentUser.role)) return <Navigate to={roleHome[currentUser.role] ?? "/"} replace />;
  return <Outlet />;
}

function readCurrentUser(): CurrentUser | null {
  try { return JSON.parse(localStorage.getItem("currentUser") || "null") as CurrentUser | null; }
  catch { return null; }
}
