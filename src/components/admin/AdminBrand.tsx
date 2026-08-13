import Link from "next/link";
import styles from "./AdminBrand.module.scss";

type AdminBrandProps = {
  compact?: boolean;
  className?: string;
};

export default function AdminBrand({ compact = false, className }: AdminBrandProps) {
  const rootClassName = compact
    ? `${styles.brand} ${styles.compact} ${className ?? ""}`.trim()
    : `${styles.brand} ${className ?? ""}`.trim();

  return (
    <Link href="/admin" className={rootClassName}>
      <span className={styles.wordmark}>Paper &amp; Stone</span>
      {!compact ? <span className={styles.descriptor}>ניהול</span> : null}
    </Link>
  );
}
