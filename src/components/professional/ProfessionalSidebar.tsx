"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ProfessionalNavItem } from "@/config/professional-nav";
import styles from "./ProfessionalSidebar.module.scss";

type ProfessionalSidebarProps = {
  items: ProfessionalNavItem[];
};

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/professional") {
    return pathname === "/professional";
  }

  return pathname.startsWith(href);
}

export default function ProfessionalSidebar({
  items,
}: ProfessionalSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar} aria-label="ניווט אזור מקצועי">
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
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
