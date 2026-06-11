import { EmptyBackendState } from "../../shared/components/EmptyBackendState";

export default function AdminUsersPage() {
  return (
    <EmptyBackendState
      eyebrow="Admin"
      title="Users"
      description="Identity currently has auth endpoints but no admin user listing API."
    />
  );
}
