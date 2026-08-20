import Link from "next/link";
import type { ClientNavItem } from "@/config/client-nav";
import { logoutAction } from "@/lib/auth/logout-action";
import ClientBrand from "@/components/client/ClientBrand/ClientBrand";
import ClientMobileNav from "@/components/client/ClientMobileNav/ClientMobileNav";
import ClientSidebar from "@/components/client/ClientSidebar/ClientSidebar";
import styles from "./ClientShell.module.scss";

type ClientShellProps = {
  children: React.ReactNode;
  navItems: ClientNavItem[];
};

export default function ClientShell({ children, navItems }: ClientShellProps) {
  return (
    <div className={styles.shell}>
      <ClientSidebar items={navItems} />

      <div className={styles.mainColumn}>
        <header className={styles.topBar}>
          <div className={styles.topBarStart}>
            <ClientMobileNav items={navItems} />
            <ClientBrand className={styles.mobileBrand} compact />
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
