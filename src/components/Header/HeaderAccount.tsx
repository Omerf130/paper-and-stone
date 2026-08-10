import Link from "next/link";
import { logoutAction } from "@/lib/auth/logout-action";
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

  return (
    <div className={styles.auth}>
      <span className={styles.accountLabel}>החשבון שלי</span>
      {user.role === "admin" && (
        <Link href="/admin" className={styles.adminLink}>
          ניהול
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
