"use client";

import Link from "next/link";
import { logoutAction } from "@/lib/auth/logout-action";
import styles from "./AdminAccountMenu.module.scss";

type AdminAccountMenuProps = {
  adminEmail: string;
  initials: string;
};

export default function AdminAccountMenu({
  adminEmail,
  initials,
}: AdminAccountMenuProps) {
  return (
    <details className={styles.menu}>
      <summary className={styles.trigger}>
        <span className={styles.avatar} aria-hidden="true">
          {initials}
        </span>
        <span className={styles.meta}>
          <span className={styles.email} title={adminEmail}>
            {adminEmail}
          </span>
          <span className={styles.role}>מנהל/ת</span>
        </span>
        <span className={styles.chevron} aria-hidden="true">
          ▾
        </span>
      </summary>

      <div className={styles.panel}>
        <Link href="/" className={styles.link}>
          חזרה לאתר
        </Link>
        <form action={logoutAction}>
          <button type="submit" className={styles.logoutButton}>
            התנתקות
          </button>
        </form>
      </div>
    </details>
  );
}
