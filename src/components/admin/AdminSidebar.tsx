"use client";

import { usePathname } from "next/navigation";
import type { AdminNavGroup } from "@/config/admin-nav";
import {
  SidebarCollapseIcon,
  SidebarExpandIcon,
} from "@/components/ui/icons/admin-icons";
import AdminBrand from "./AdminBrand";
import AdminNavList from "./AdminNavList/AdminNavList";
import styles from "./AdminSidebar.module.scss";

type AdminSidebarProps = {
  navGroups: AdminNavGroup[];
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

export default function AdminSidebar({
  navGroups,
  collapsed,
  onToggleCollapsed,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const toggleLabel = collapsed ? "הרחבת תפריט" : "כיווץ תפריט";

  return (
    <aside
      className={collapsed ? `${styles.sidebar} ${styles.collapsed}` : styles.sidebar}
      aria-label="ניווט ניהול"
    >
      <div className={styles.header}>
        <div className={styles.headerControls}>
          <button
            type="button"
            className={styles.toggleButton}
            aria-label={toggleLabel}
            title={toggleLabel}
            onClick={onToggleCollapsed}
          >
            {collapsed ? <SidebarExpandIcon /> : <SidebarCollapseIcon />}
          </button>
        </div>

        <div className={styles.brandBlock}>
          <AdminBrand compact={collapsed} sidebarCompact={collapsed} />
        </div>
      </div>

      <nav className={styles.nav}>
        <AdminNavList
          groups={navGroups}
          pathname={pathname}
          variant="sidebar"
          collapsed={collapsed}
        />
      </nav>
    </aside>
  );
}
