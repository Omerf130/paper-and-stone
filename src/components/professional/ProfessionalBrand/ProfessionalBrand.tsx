import Link from "next/link";
import styles from "./ProfessionalBrand.module.scss";

type ProfessionalBrandProps = {
  compact?: boolean;
  className?: string;
};

export default function ProfessionalBrand({
  compact = false,
  className,
}: ProfessionalBrandProps) {
  const rootClassName = compact
    ? `${styles.brand} ${styles.compact} ${className ?? ""}`.trim()
    : `${styles.brand} ${className ?? ""}`.trim();

  return (
    <Link href="/professional" className={rootClassName}>
      <span className={styles.wordmark}>Paper &amp; Stone</span>
      {!compact ? <span className={styles.descriptor}>אזור מקצועי</span> : null}
    </Link>
  );
}
