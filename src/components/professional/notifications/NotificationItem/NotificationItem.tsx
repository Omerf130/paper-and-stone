"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { markNotificationReadAction } from "@/app/professional/notifications/actions";
import type { NotificationView } from "@/types/notification";
import styles from "./NotificationItem.module.scss";

type NotificationItemProps = {
  notification: NotificationView;
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

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
    <article className={styles.card}>
      <div className={styles.header}>
        <p className={styles.readState}>
          {notification.isRead ? "נקרא" : "לא נקרא"}
        </p>
        <time className={styles.time} dateTime={notification.createdAt}>
          {formatDate(notification.createdAt)}
        </time>
      </div>

      <h2 className={styles.title}>{notification.title}</h2>

      {notification.bodyPreview ? (
        <p className={styles.preview}>{notification.bodyPreview}</p>
      ) : null}

      <button
        type="button"
        className={styles.openButton}
        onClick={handleOpen}
        disabled={isPending}
      >
        {isPending ? "פותח..." : "פתיחת פרויקט"}
      </button>
    </article>
  );
}
