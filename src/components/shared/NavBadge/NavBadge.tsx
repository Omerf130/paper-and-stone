import { formatBadgeCount } from "@/lib/notifications/formatBadgeCount";
import styles from "./NavBadge.module.scss";

type NavBadgeProps = {
  count: number;
  ariaLabel: string;
};

export default function NavBadge({ count, ariaLabel }: NavBadgeProps) {
  if (count <= 0) {
    return null;
  }

  return (
    <span className={styles.badge} aria-label={ariaLabel}>
      {formatBadgeCount(count)}
    </span>
  );
}
