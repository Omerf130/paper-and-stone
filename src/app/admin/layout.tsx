import { requireAdmin } from "@/lib/auth/authorization";
import { adminNavGroups, applyAdminNavBadges } from "@/config/admin-nav";
import { getSubmittedProjectCount } from "@/lib/projects/getSubmittedProjectCount";
import { countPendingArchitectRequests } from "@/lib/users/architect-request-queries";
import AdminShell from "@/components/admin/AdminShell";
import InternalUiProviders from "@/components/ui/InternalUiProviders";

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const user = await requireAdmin();
  const [submittedProjectCount, pendingArchitectRequestCount] =
    await Promise.all([
      getSubmittedProjectCount(),
      countPendingArchitectRequests(),
    ]);
  const navGroups = applyAdminNavBadges(adminNavGroups, {
    submittedProjectCount,
    pendingArchitectRequestCount,
  });

  return (
    <InternalUiProviders>
      <AdminShell navGroups={navGroups} adminEmail={user.email}>
        {children}
      </AdminShell>
    </InternalUiProviders>
  );
}
