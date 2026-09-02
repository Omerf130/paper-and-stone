"use client";

import { usePathname } from "next/navigation";
import type { AdminNavGroup } from "@/config/admin-nav";
import { logoutAction } from "@/lib/auth/logout-action";
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
        <div className={styles.brandBlock}>
          <AdminBrand compact={collapsed} sidebarCompact={collapsed} />
        </div>

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
      </div>

      <nav className={styles.nav}>
        <AdminNavList
          groups={navGroups}
          pathname={pathname}
          variant="sidebar"
          collapsed={collapsed}
        />
      </nav>

      <div className={styles.footer}>
        {!collapsed ? (
          <div className={styles.helpBox}>
            <p className={styles.helpTitle}>צריכים עזרה?</p>
            <p className={styles.helpText}>פנו לצוות Paper &amp; Stone לתמיכה תפעולית.</p>
          </div>
        ) : null}
        <form action={logoutAction}>
          <button type="submit" className={styles.footerLogout} title="התנתקות">
            <span>התנתקות</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
