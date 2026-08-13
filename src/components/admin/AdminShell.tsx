import Link from "next/link";
import type { AdminNavGroup } from "@/config/admin-nav";
import { logoutAction } from "@/lib/auth/logout-action";
import AdminBrand from "./AdminBrand";
import AdminMobileNav from "./AdminMobileNav";
import AdminSidebar from "./AdminSidebar";
import styles from "./AdminShell.module.scss";

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
    <div className={styles.shell}>
      <AdminSidebar navGroups={navGroups} />

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
