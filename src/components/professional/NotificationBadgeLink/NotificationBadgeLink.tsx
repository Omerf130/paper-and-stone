import Link from "next/link";
import { formatBadgeCount } from "@/lib/notifications/formatBadgeCount";
import styles from "./NotificationBadgeLink.module.scss";

type NotificationBadgeLinkProps = {
  unreadCount: number;
};

export default function NotificationBadgeLink({
  unreadCount,
}: NotificationBadgeLinkProps) {
  const displayCount = formatBadgeCount(unreadCount);

  return (
    <Link
      href="/professional/notifications"
      className={styles.link}
      aria-label={
        unreadCount > 0
          ? `התראות שלא נקראו: ${displayCount}`
          : "התראות"
      }
    >
      התראות
      {unreadCount > 0 ? (
        <span className={styles.count} aria-hidden="true">
          ({displayCount})
        </span>
      ) : null}
    </Link>
  );
}
