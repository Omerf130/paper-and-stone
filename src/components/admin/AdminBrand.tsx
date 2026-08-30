import Link from "next/link";
import styles from "./AdminBrand.module.scss";

type AdminBrandProps = {
  compact?: boolean;
  sidebarCompact?: boolean;
  className?: string;
};

export default function AdminBrand({
  compact = false,
  sidebarCompact = false,
  className,
}: AdminBrandProps) {
  const rootClassName = [
    styles.brand,
    compact ? styles.compact : "",
    sidebarCompact ? styles.sidebarCompact : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link href="/admin" className={rootClassName} title="Paper & Stone">
      <span className={styles.wordmark}>Paper &amp; Stone</span>
      {!compact ? <span className={styles.descriptor}>ניהול</span> : null}
    </Link>
  );
}
