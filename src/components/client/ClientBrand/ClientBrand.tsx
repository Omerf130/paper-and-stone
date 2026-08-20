import Link from "next/link";
import styles from "./ClientBrand.module.scss";

type ClientBrandProps = {
  compact?: boolean;
  className?: string;
};

export default function ClientBrand({
  compact = false,
  className,
}: ClientBrandProps) {
  const rootClassName = compact
    ? `${styles.brand} ${styles.compact} ${className ?? ""}`.trim()
    : `${styles.brand} ${className ?? ""}`.trim();

  return (
    <Link href="/client" className={rootClassName}>
      <span className={styles.wordmark}>Paper &amp; Stone</span>
      {!compact ? <span className={styles.descriptor}>אזור לקוח</span> : null}
    </Link>
  );
}
