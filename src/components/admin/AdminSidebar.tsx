"use client";

import { usePathname } from "next/navigation";
import type { AdminNavGroup } from "@/config/admin-nav";
import AdminBrand from "./AdminBrand";
import AdminNavList from "./AdminNavList/AdminNavList";
import styles from "./AdminSidebar.module.scss";

type AdminSidebarProps = {
  navGroups: AdminNavGroup[];
};

export default function AdminSidebar({ navGroups }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar} aria-label="ניווט ניהול">
      <div className={styles.brandBlock}>
        <AdminBrand />
      </div>

      <nav className={styles.nav}>
        <AdminNavList groups={navGroups} pathname={pathname} variant="sidebar" />
      </nav>
    </aside>
  );
}
