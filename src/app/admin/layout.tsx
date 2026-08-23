import { requireAdmin } from "@/lib/auth/authorization";
import { adminNavGroups, applyAdminNavBadges } from "@/config/admin-nav";
import { getAdminProjectAttentionCount } from "@/lib/projects/getAdminProjects";
import { countPendingArchitectRequests } from "@/lib/users/architect-request-queries";
import { countPendingClientRequests } from "@/lib/users/client-request-queries";
import AdminShell from "@/components/admin/AdminShell";
import InternalUiProviders from "@/components/ui/InternalUiProviders";

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const user = await requireAdmin();
  const [
    attentionProjectCount,
    pendingArchitectRequestCount,
    pendingClientRequestCount,
  ] = await Promise.all([
    getAdminProjectAttentionCount(),
    countPendingArchitectRequests(),
    countPendingClientRequests(),
  ]);
  const navGroups = applyAdminNavBadges(adminNavGroups, {
    attentionProjectCount,
    pendingArchitectRequestCount,
    pendingClientRequestCount,
  });

  return (
    <InternalUiProviders>
      <AdminShell navGroups={navGroups} adminEmail={user.email}>
        {children}
      </AdminShell>
    </InternalUiProviders>
  );
}
