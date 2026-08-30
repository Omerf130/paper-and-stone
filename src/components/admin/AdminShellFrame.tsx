"use client";

import Link from "next/link";
import type { AdminNavGroup } from "@/config/admin-nav";
import { logoutAction } from "@/lib/auth/logout-action";
import AdminBrand from "./AdminBrand";
import AdminMobileNav from "./AdminMobileNav";
import AdminSidebar from "./AdminSidebar";
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

export default function AdminShellFrame({
  children,
  navGroups,
  adminEmail,
}: AdminShellFrameProps) {
  const { collapsed, toggleCollapsed } = useAdminSidebarCollapsed();
  const transitionsEnabled = useAdminSidebarTransitionsEnabled();

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
          </div>

          <div className={styles.topBarActions}>
            <span className={styles.adminEmail} title={adminEmail}>
              {adminEmail}
            </span>
            <Link href="/" className={styles.publicLink}>
              חזרה לאתר
            </Link>
            <form action={logoutAction}>
              <button type="submit" className={styles.logoutButton}>
                התנתקות
              </button>
            </form>
          </div>
        </header>

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
