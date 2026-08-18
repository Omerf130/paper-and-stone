"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { resubmitProjectOnboardingAction } from "@/app/professional/projects/actions";
import Button from "@/components/ui/Button/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import styles from "./ProjectResubmitOnboardingButton.module.scss";

type ProjectResubmitOnboardingButtonProps = {
  projectId: string;
};

export default function ProjectResubmitOnboardingButton({
  projectId,
}: ProjectResubmitOnboardingButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await resubmitProjectOnboardingAction(projectId);

      if (result.error) {
        toast({ type: "error", message: result.error });
        setConfirmOpen(false);
        return;
      }

      toast({ type: "success", message: "הפרויקט נשלח מחדש לאישור פתיחה." });
      setConfirmOpen(false);
      router.refresh();
    });
  };

  return (
    <div className={styles.wrap}>
      <Button onClick={() => setConfirmOpen(true)} loading={isPending} loadingLabel="שולח...">
        שליחה מחדש לאישור
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        title="שליחה מחדש לאישור"
        description="לשלוח את הפרויקט מחדש לאישור פתיחה?"
        confirmLabel="שליחה"
        loading={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
