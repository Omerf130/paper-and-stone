"use client";

import Link from "next/link";
import type { ClientNavItem } from "@/config/client-nav";
import { isActiveInternalPath } from "@/lib/navigation/is-active-internal-path";
import styles from "./ClientNavList.module.scss";

type ClientNavListProps = {
  items: ClientNavItem[];
  pathname: string;
  onNavigate?: () => void;
  variant?: "sidebar" | "mobile";
};

export default function ClientNavList({
  items,
  pathname,
  onNavigate,
  variant = "sidebar",
}: ClientNavListProps) {
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
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
