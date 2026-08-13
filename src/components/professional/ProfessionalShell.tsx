import Link from "next/link";
import type { ProfessionalNavItem } from "@/config/professional-nav";
import { logoutAction } from "@/lib/auth/logout-action";
import NotificationBadgeLink from "@/components/professional/NotificationBadgeLink/NotificationBadgeLink";
import ProfessionalBrand from "@/components/professional/ProfessionalBrand/ProfessionalBrand";
import ProfessionalMobileNav from "./ProfessionalMobileNav";
import ProfessionalSidebar from "./ProfessionalSidebar";
import styles from "./ProfessionalShell.module.scss";

type ProfessionalShellProps = {
  children: React.ReactNode;
  unreadNotificationCount: number;
  navItems: ProfessionalNavItem[];
};

export default function ProfessionalShell({
  children,
  unreadNotificationCount,
  navItems,
}: ProfessionalShellProps) {
  return (
    <div className={styles.shell}>
      <ProfessionalSidebar items={navItems} />

      <div className={styles.mainColumn}>
        <header className={styles.topBar}>
          <div className={styles.topBarStart}>
            <ProfessionalMobileNav items={navItems} />
            <ProfessionalBrand className={styles.mobileBrand} compact />
          </div>

          <div className={styles.topBarActions}>
            <NotificationBadgeLink unreadCount={unreadNotificationCount} />
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
