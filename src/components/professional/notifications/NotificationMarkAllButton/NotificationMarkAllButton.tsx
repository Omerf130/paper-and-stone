"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { markAllNotificationsReadAction } from "@/app/professional/notifications/actions";
import styles from "./NotificationMarkAllButton.module.scss";

type NotificationMarkAllButtonProps = {
  disabled?: boolean;
};

export default function NotificationMarkAllButton({
  disabled = false,
}: NotificationMarkAllButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();

  const handleClick = () => {
    setError(undefined);
    startTransition(async () => {
      const result = await markAllNotificationsReadAction();
      if (result.error) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  };

  return (
    <div className={styles.wrap}>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        className={styles.button}
        onClick={handleClick}
        disabled={disabled || isPending}
      >
        {isPending ? "מעדכן..." : "סמן הכל כנקרא"}
      </button>
    </div>
  );
}
