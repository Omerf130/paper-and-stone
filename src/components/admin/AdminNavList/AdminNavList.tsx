"use client";

import Link from "next/link";
import type { AdminNavGroup } from "@/config/admin-nav";
import { getAdminNavIcon } from "@/components/admin/admin-nav-icons";
import { isActiveAdminPath } from "@/lib/admin/is-active-admin-path";
import NavBadge from "@/components/shared/NavBadge/NavBadge";
import styles from "./AdminNavList.module.scss";

type AdminNavListProps = {
  groups: AdminNavGroup[];
  pathname: string;
  onNavigate?: () => void;
  variant?: "sidebar" | "mobile";
  collapsed?: boolean;
};

function buildNavLinkLabel(label: string, badgeCount?: number): string {
  if (badgeCount && badgeCount > 0) {
    return `${label} (${badgeCount})`;
  }

  return label;
}

export default function AdminNavList({
  groups,
  pathname,
  onNavigate,
  variant = "sidebar",
  collapsed = false,
}: AdminNavListProps) {
  const isCollapsedSidebar = variant === "sidebar" && collapsed;
  const rootClassName = isCollapsedSidebar
    ? `${styles.root} ${styles.collapsedRoot}`
    : variant === "mobile"
      ? styles.mobileRoot
      : styles.root;

  return (
    <div className={rootClassName}>
      {groups.map((group) => (
        <section
          key={group.id}
          className={
            isCollapsedSidebar
              ? `${styles.group} ${styles.collapsedGroup}`
              : styles.group
          }
          {...(group.label ? { "aria-label": group.label } : {})}
        >
          {group.label && !isCollapsedSidebar ? (
            <h2 className={styles.groupLabel}>{group.label}</h2>
          ) : null}

          <ul className={styles.list}>
            {group.items.map((item) => {
              const isActive = isActiveAdminPath(pathname, item.href);
              const Icon = getAdminNavIcon(item.href);
              const linkLabel = buildNavLinkLabel(item.label, item.badgeCount);
              const linkClassName = isActive
                ? isCollapsedSidebar
                  ? `${styles.link} ${styles.collapsedLink} ${styles.active}`
                  : `${styles.link} ${styles.active}`
                : isCollapsedSidebar
                  ? `${styles.link} ${styles.collapsedLink}`
                  : styles.link;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={linkClassName}
                    aria-current={isActive ? "page" : undefined}
                    aria-label={isCollapsedSidebar ? linkLabel : undefined}
                    title={isCollapsedSidebar ? linkLabel : undefined}
                    onClick={onNavigate}
                  >
                    {Icon ? (
                      <span
                        className={
                          isCollapsedSidebar ? styles.iconWrap : styles.iconInline
                        }
                        aria-hidden="true"
                      >
                        <Icon className={styles.icon} />
                        {isCollapsedSidebar &&
                        item.badgeCount &&
                        item.badgeCount > 0 ? (
                          <span className={styles.collapsedBadgeDot} />
                        ) : null}
                      </span>
                    ) : null}

                    <span
                      className={
                        isCollapsedSidebar ? styles.srOnlyLabel : styles.linkContent
                      }
                    >
                      {item.label}
                      {!isCollapsedSidebar &&
                      item.badgeCount &&
                      item.badgeCount > 0 ? (
                        <NavBadge
                          count={item.badgeCount}
                          ariaLabel={`${item.badgeCount} פריטים ממתינים`}
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
