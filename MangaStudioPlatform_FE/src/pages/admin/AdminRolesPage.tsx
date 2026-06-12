import { EmptyBackendState } from "../../shared/components/EmptyBackendState";

export default function AdminRolesPage() {
  return (
    <EmptyBackendState
      eyebrow="Admin"
      title="Roles and permissions"
      description="The backend does not expose roles or permission management APIs yet."
    />
  );
}
