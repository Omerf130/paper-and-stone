import type { Metadata } from "next";
import NotificationItem from "@/components/professional/notifications/NotificationItem/NotificationItem";
import NotificationMarkAllButton from "@/components/professional/notifications/NotificationMarkAllButton/NotificationMarkAllButton";
import AdminPagination from "@/components/admin/list/AdminPagination";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import InternalPage from "@/components/internal/InternalPage/InternalPage";
import InternalPageHeader from "@/components/internal/InternalPageHeader/InternalPageHeader";
import { requireProfessional } from "@/lib/auth/authorization";
import {
  buildNotificationsHref,
  parseNotificationsParams,
} from "@/lib/notifications/notification-params";
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
    <InternalPage width="default">
      <InternalPageHeader
        title="התראות"
        description="עדכונים על פרויקטים שנשלחו לבדיקה."
        actions={<NotificationMarkAllButton disabled={unreadCount === 0} />}
      />

      {result.notifications.length === 0 ? (
        <EmptyState
          title="אין התראות"
          description="כאשר יהיו עדכונים על פרויקטים, הם יופיעו כאן."
        />
      ) : (
        <ul className={styles.list}>
          {result.notifications.map((notification) => (
            <li key={notification.id}>
              <NotificationItem notification={notification} />
            </li>
          ))}
        </ul>
      )}

      <AdminPagination
        page={result.page}
        totalPages={result.totalPages}
        hrefForPage={(pageNumber) => buildNotificationsHref({ page: pageNumber })}
      />
    </InternalPage>
  );
}
