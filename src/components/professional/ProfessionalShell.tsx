import Link from "next/link";
import { professionalNavItems } from "@/config/professional-nav";
import { logoutAction } from "@/lib/auth/logout-action";
import ProfessionalMobileNav from "./ProfessionalMobileNav";
import ProfessionalSidebar from "./ProfessionalSidebar";
import styles from "./ProfessionalShell.module.scss";

type ProfessionalShellProps = {
  children: React.ReactNode;
};

export default function ProfessionalShell({ children }: ProfessionalShellProps) {
  return (
    <div className={styles.shell}>
      <ProfessionalSidebar items={professionalNavItems} />

      <div className={styles.mainColumn}>
        <header className={styles.topBar}>
          <div className={styles.topBarStart}>
            <ProfessionalMobileNav items={professionalNavItems} />
            <Link href="/professional" className={styles.brand}>
              Paper &amp; Stone — אזור מקצועי
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
