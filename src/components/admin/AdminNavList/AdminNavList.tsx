"use client";

import Link from "next/link";
import type { AdminNavGroup } from "@/config/admin-nav";
import { isActiveAdminPath } from "@/lib/admin/is-active-admin-path";
import NavBadge from "@/components/shared/NavBadge/NavBadge";
import styles from "./AdminNavList.module.scss";

type AdminNavListProps = {
  groups: AdminNavGroup[];
  pathname: string;
  onNavigate?: () => void;
  variant?: "sidebar" | "mobile";
};

export default function AdminNavList({
  groups,
  pathname,
  onNavigate,
  variant = "sidebar",
}: AdminNavListProps) {
  return (
    <div className={variant === "mobile" ? styles.mobileRoot : styles.root}>
      {groups.map((group) => (
        <section
          key={group.id}
          className={styles.group}
          {...(group.label ? { "aria-label": group.label } : {})}
        >
          {group.label ? (
            <h2 className={styles.groupLabel}>{group.label}</h2>
          ) : null}

          <ul className={styles.list}>
            {group.items.map((item) => {
              const isActive = isActiveAdminPath(pathname, item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={isActive ? `${styles.link} ${styles.active}` : styles.link}
                    aria-current={isActive ? "page" : undefined}
                    onClick={onNavigate}
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
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
