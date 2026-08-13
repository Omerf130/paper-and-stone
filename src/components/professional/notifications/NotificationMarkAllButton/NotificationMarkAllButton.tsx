"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { markAllNotificationsReadAction } from "@/app/professional/notifications/actions";
import Button from "@/components/ui/Button/Button";
import { useToast } from "@/components/ui/Toast/ToastProvider";

type NotificationMarkAllButtonProps = {
  disabled?: boolean;
};

export default function NotificationMarkAllButton({
  disabled = false,
}: NotificationMarkAllButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const result = await markAllNotificationsReadAction();
      if (result.error) {
        toast({ type: "error", message: result.error });
        return;
      }

      router.refresh();
    });
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleClick}
      disabled={disabled}
      loading={isPending}
      loadingLabel="מעדכן..."
    >
      סמן הכל כנקרא
    </Button>
  );
}
