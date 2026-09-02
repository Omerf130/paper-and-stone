"use client";

import type { AdminNavGroup } from "@/config/admin-nav";
import AdminAccountMenu from "./AdminAccountMenu";
import AdminBrand from "./AdminBrand";
import AdminMobileNav from "./AdminMobileNav";
import AdminSidebar from "./AdminSidebar";
import AdminTopbarSearch from "./AdminTopbarSearch";
import styles from "./AdminShell.module.scss";
import {
  useAdminSidebarCollapsed,
  useAdminSidebarTransitionsEnabled,
} from "./useAdminSidebarCollapsed";

type AdminShellFrameProps = {
  children: React.ReactNode;
  navGroups: AdminNavGroup[];
  adminEmail: string;
};

function deriveInitials(email: string): string {
  const local = email.split("@")[0] ?? "";
  const parts = local.split(/[._-]+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }

  return local.slice(0, 2).toUpperCase();
}

export default function AdminShellFrame({
  children,
  navGroups,
  adminEmail,
}: AdminShellFrameProps) {
  const { collapsed, toggleCollapsed } = useAdminSidebarCollapsed();
  const transitionsEnabled = useAdminSidebarTransitionsEnabled();
  const initials = deriveInitials(adminEmail);

  return (
    <div
      className={styles.shell}
      data-sidebar-collapsed={collapsed ? "true" : "false"}
      data-sidebar-transitions={transitionsEnabled ? "true" : "false"}
    >
      <AdminSidebar
        navGroups={navGroups}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
      />

      <div className={styles.mainColumn}>
        <header className={styles.topBar}>
          <div className={styles.topBarStart}>
            <AdminMobileNav navGroups={navGroups} />
            <AdminBrand className={styles.mobileBrand} compact />
            <div className={styles.desktopSearch}>
              <AdminTopbarSearch />
            </div>
          </div>

          <div className={styles.topBarActions}>
            <AdminAccountMenu adminEmail={adminEmail} initials={initials} />
          </div>
        </header>

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
