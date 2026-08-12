import { requireAdmin } from "@/lib/auth/authorization";
import { adminNavItems } from "@/config/admin-nav";
import { getSubmittedProjectCount } from "@/lib/projects/getSubmittedProjectCount";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  await requireAdmin();

  const submittedProjectCount = await getSubmittedProjectCount();
  const navItems = adminNavItems.map((item) =>
    item.href === "/admin/projects"
      ? { ...item, badgeCount: submittedProjectCount }
      : item,
  );

  return <AdminShell navItems={navItems}>{children}</AdminShell>;
}
