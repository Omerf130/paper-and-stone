import Link from "next/link";
import type { NavItem } from "@/config/navigation";
import styles from "./NavItemDisplay.module.scss";

type NavItemDisplayProps = {
  item: NavItem;
  className?: string;
};

export default function NavItemDisplay({
  item,
  className,
}: NavItemDisplayProps) {
  const classes = className
    ? `${styles.item} ${className}`
    : styles.item;

  if (item.href) {
    return (
      <Link href={item.href} className={classes}>
        {item.label}
      </Link>
    );
  }

  return <span className={classes}>{item.label}</span>;
}
