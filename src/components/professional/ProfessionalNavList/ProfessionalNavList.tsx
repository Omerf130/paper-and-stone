"use client";

import Link from "next/link";
import type { ProfessionalNavItem } from "@/config/professional-nav";
import { isActiveInternalPath } from "@/lib/navigation/is-active-internal-path";
import NavBadge from "@/components/shared/NavBadge/NavBadge";
import styles from "./ProfessionalNavList.module.scss";

type ProfessionalNavListProps = {
  items: ProfessionalNavItem[];
  pathname: string;
  onNavigate?: () => void;
  variant?: "sidebar" | "mobile";
};

export default function ProfessionalNavList({
  items,
  pathname,
  onNavigate,
  variant = "sidebar",
}: ProfessionalNavListProps) {
  const listClassName = variant === "mobile" ? styles.mobileRoot : styles.root;

  return (
    <ul className={listClassName}>
      {items.map((item) => {
        const isActive = isActiveInternalPath(pathname, item.href);

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
                    ariaLabel={`${item.badgeCount} התראות שלא נקראו`}
                  />
                ) : null}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
