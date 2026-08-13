import { requireAdmin } from "@/lib/auth/authorization";
import { adminNavGroups, applyAdminNavBadges } from "@/config/admin-nav";
import { getSubmittedProjectCount } from "@/lib/projects/getSubmittedProjectCount";
import AdminShell from "@/components/admin/AdminShell";
import InternalUiProviders from "@/components/ui/InternalUiProviders";

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const user = await requireAdmin();
  const submittedProjectCount = await getSubmittedProjectCount();
  const navGroups = applyAdminNavBadges(adminNavGroups, submittedProjectCount);

  return (
    <InternalUiProviders>
      <AdminShell navGroups={navGroups} adminEmail={user.email}>
        {children}
      </AdminShell>
    </InternalUiProviders>
  );
}
