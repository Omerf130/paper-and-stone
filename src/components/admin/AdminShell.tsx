import Link from "next/link";
import { adminNavItems } from "@/config/admin-nav";
import { logoutAction } from "@/lib/auth/logout-action";
import AdminMobileNav from "./AdminMobileNav";
import AdminSidebar from "./AdminSidebar";
import styles from "./AdminShell.module.scss";

type AdminShellProps = {
  children: React.ReactNode;
};

export default function AdminShell({ children }: AdminShellProps) {
  return (
    <div className={styles.shell}>
      <AdminSidebar items={adminNavItems} />

      <div className={styles.mainColumn}>
        <header className={styles.topBar}>
          <div className={styles.topBarStart}>
            <AdminMobileNav items={adminNavItems} />
            <Link href="/admin" className={styles.brand}>
              Paper &amp; Stone — ניהול
            </Link>
          </div>

          <div className={styles.topBarActions}>
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
