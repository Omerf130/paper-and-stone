"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { markNotificationReadAction } from "@/app/professional/notifications/actions";
import Button from "@/components/ui/Button/Button";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { formatDateTime } from "@/lib/ui/format-date-time";
import type { NotificationView } from "@/types/notification";
import styles from "./NotificationItem.module.scss";

type NotificationItemProps = {
  notification: NotificationView;
};

export default function NotificationItem({ notification }: NotificationItemProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleOpen = () => {
    startTransition(async () => {
      if (!notification.isRead) {
        await markNotificationReadAction(notification.id);
      }

      router.push(notification.href);
    });
  };

  return (
    <article className={styles.row}>
      <div className={styles.header}>
        <StatusBadge tone={notification.isRead ? "neutral" : "info"}>
          {notification.isRead ? "נקרא" : "לא נקרא"}
        </StatusBadge>
        <time className={styles.time} dateTime={notification.createdAt}>
          {formatDateTime(notification.createdAt)}
        </time>
      </div>

      <h2 className={styles.title}>{notification.title}</h2>

      {notification.bodyPreview ? (
        <p className={styles.preview}>{notification.bodyPreview}</p>
      ) : null}

      <Button
        variant="secondary"
        size="sm"
        onClick={handleOpen}
        loading={isPending}
        loadingLabel="פותח..."
      >
        פתיחת פרויקט
      </Button>
    </article>
  );
}
