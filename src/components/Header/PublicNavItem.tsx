"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/config/navigation";
import { isActivePublicPath } from "@/lib/navigation/is-active-public-path";
import styles from "./PublicNavItem.module.scss";

type PublicNavItemProps = {
  item: NavItem;
  className?: string;
  onNavigate?: () => void;
  tone?: "light" | "dark";
};

export default function PublicNavItem({
  item,
  className,
  onNavigate,
  tone = "light",
}: PublicNavItemProps) {
  const pathname = usePathname();
  const toneClass = tone === "dark" ? styles.dark : styles.light;
  const classes = className
    ? `${styles.item} ${toneClass} ${className}`
    : `${styles.item} ${toneClass}`;

  if (!item.href) {
    return (
      <span className={`${classes} ${styles.placeholder}`}>{item.label}</span>
    );
  }

  const isActive = isActivePublicPath(pathname, item.href);

  return (
    <Link
      href={item.href}
      className={isActive ? `${classes} ${styles.active}` : classes}
      aria-current={isActive ? "page" : undefined}
      onClick={onNavigate}
    >
      {item.label}
    </Link>
  );
}
