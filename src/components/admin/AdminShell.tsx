import type { AdminNavGroup } from "@/config/admin-nav";
import AdminShellFrame from "./AdminShellFrame";

type AdminShellProps = {
  children: React.ReactNode;
  navGroups: AdminNavGroup[];
  adminEmail: string;
};

export default function AdminShell({
  children,
  navGroups,
  adminEmail,
}: AdminShellProps) {
  return (
    <AdminShellFrame navGroups={navGroups} adminEmail={adminEmail}>
      {children}
    </AdminShellFrame>
  );
}
