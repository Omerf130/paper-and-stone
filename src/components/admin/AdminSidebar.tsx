"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AdminNavItem } from "@/config/admin-nav";
import NavBadge from "@/components/shared/NavBadge/NavBadge";
import styles from "./AdminSidebar.module.scss";

type AdminSidebarProps = {
  items: AdminNavItem[];
};

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname.startsWith(href);
}

export default function AdminSidebar({ items }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar} aria-label="ניווט ניהול">
      <nav className={styles.nav}>
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={
                  isActivePath(pathname, item.href)
                    ? `${styles.link} ${styles.active}`
                    : styles.link
                }
              >
                <span className={styles.linkContent}>
                  {item.label}
                  {item.badgeCount && item.badgeCount > 0 ? (
                    <NavBadge
                      count={item.badgeCount}
                      ariaLabel={`${item.badgeCount} פרויקטים ממתינים לבדיקה`}
                    />
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
