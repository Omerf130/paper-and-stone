import type { Metadata } from "next";
import NotificationItem from "@/components/professional/notifications/NotificationItem/NotificationItem";
import NotificationMarkAllButton from "@/components/professional/notifications/NotificationMarkAllButton/NotificationMarkAllButton";
import NotificationsPagination from "@/components/professional/notifications/NotificationsPagination/NotificationsPagination";
import { requireProfessional } from "@/lib/auth/authorization";
import { parseNotificationsParams } from "@/lib/notifications/notification-params";
import {
  getProfessionalNotifications,
  getUnreadNotificationCount,
} from "@/lib/notifications/notification-queries";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "התראות | Paper & Stone",
};

type ProfessionalNotificationsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProfessionalNotificationsPage({
  searchParams,
}: ProfessionalNotificationsPageProps) {
  const user = await requireProfessional();
  const resolvedSearchParams = await searchParams;
  const params = parseNotificationsParams(resolvedSearchParams);
  const [result, unreadCount] = await Promise.all([
    getProfessionalNotifications(user.id, params),
    getUnreadNotificationCount(user.id),
  ]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>התראות</h1>
          <p className={styles.description}>
            עדכונים על פרויקטים שנשלחו לבדיקה.
          </p>
        </div>
        <NotificationMarkAllButton disabled={unreadCount === 0} />
      </header>

      {result.notifications.length === 0 ? (
        <p className={styles.empty}>אין התראות.</p>
      ) : (
        <ul className={styles.list}>
          {result.notifications.map((notification) => (
            <li key={notification.id}>
              <NotificationItem notification={notification} />
            </li>
          ))}
        </ul>
      )}

      <NotificationsPagination
        page={result.page}
        totalPages={result.totalPages}
      />
    </div>
  );
}
