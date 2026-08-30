import Link from "next/link";
import { logoutAction } from "@/lib/auth/logout-action";
import { canAccessArchitectWorkspace, canAccessClientWorkspace } from "@/lib/auth/account-access";
import type { SafeUser } from "@/types/user";
import styles from "./HeaderAccount.module.scss";

type HeaderAccountProps = {
  user: SafeUser | null;
};

export default function HeaderAccount({ user }: HeaderAccountProps) {
  if (!user) {
    return (
      <div className={styles.auth}>
        <Link href="/login" className={styles.link}>
          התחברות
        </Link>
        <Link href="/register" className={styles.secondaryLink}>
          הרשמה
        </Link>
      </div>
    );
  }

  const showClientLink = canAccessClientWorkspace(user);
  const showArchitectLink = canAccessArchitectWorkspace(user);
  const showAccountStatusLink =
    !showClientLink && !showArchitectLink && user.role !== "admin";

  return (
    <div className={styles.auth}>
      <span className={styles.accountLabel}>החשבון שלי</span>
      <Link href="/wishlist" className={styles.link}>
        מועדפים
      </Link>
      {user.role === "admin" && (
        <Link href="/admin" className={styles.adminLink}>
          ניהול
        </Link>
      )}
      {showArchitectLink && (
        <Link href="/professional" className={styles.professionalLink}>
          אזור אדריכל
        </Link>
      )}
      {showClientLink && (
        <Link href="/client" className={styles.clientLink}>
          אזור לקוח
        </Link>
      )}
      {showAccountStatusLink && (
        <Link href="/account/status" className={styles.link}>
          סטטוס חשבון
        </Link>
      )}
      <form action={logoutAction}>
        <button type="submit" className={styles.logoutButton}>
          התנתקות
        </button>
      </form>
    </div>
  );
}
