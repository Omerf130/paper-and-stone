import { requireAdmin } from "@/lib/auth/authorization";
import { adminNavGroups, applyAdminNavBadges } from "@/config/admin-nav";
import {
  getPendingOnboardingProjectCount,
  getSubmittedProjectCount,
} from "@/lib/projects/getSubmittedProjectCount";
import { countPendingArchitectRequests } from "@/lib/users/architect-request-queries";
import AdminShell from "@/components/admin/AdminShell";
import InternalUiProviders from "@/components/ui/InternalUiProviders";

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const user = await requireAdmin();
  const [
    submittedProjectCount,
    pendingOnboardingProjectCount,
    pendingArchitectRequestCount,
  ] = await Promise.all([
    getSubmittedProjectCount(),
    getPendingOnboardingProjectCount(),
    countPendingArchitectRequests(),
  ]);
  const navGroups = applyAdminNavBadges(adminNavGroups, {
    submittedProjectCount,
    pendingOnboardingProjectCount,
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
