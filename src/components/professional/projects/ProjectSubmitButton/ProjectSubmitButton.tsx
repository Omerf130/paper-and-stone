"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { submitProjectAction } from "@/app/professional/projects/actions";
import Button from "@/components/ui/Button/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import type { ProjectStatus } from "@/types/project";
import styles from "./ProjectSubmitButton.module.scss";

type ProjectSubmitButtonProps = {
  projectId: string;
  status: ProjectStatus;
  itemCount: number;
};

export default function ProjectSubmitButton({
  projectId,
  status,
  itemCount,
}: ProjectSubmitButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const canSubmit =
    (status === "draft" || status === "changes_requested") && itemCount > 0;

  if (!canSubmit) {
    return null;
  }

  const isResubmit = status === "changes_requested";

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await submitProjectAction(projectId);
      if (result.error) {
        toast({ type: "error", message: result.error });
        setConfirmOpen(false);
        return;
      }

      toast({
        type: "success",
        message: isResubmit
          ? "הפרויקט נשלח מחדש לאישור"
          : "הפרויקט נשלח לאישור",
      });
      setConfirmOpen(false);
      router.refresh();
    });
  };

  return (
    <div className={styles.wrap}>
      <Button onClick={() => setConfirmOpen(true)} loading={isPending} loadingLabel="שולח...">
        {isResubmit ? "שליחה מחדש לבדיקה" : "שליחה לבדיקה"}
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        title={isResubmit ? "שליחה מחדש לבדיקה" : "שליחה לבדיקה"}
        description={
          isResubmit
            ? "לשלוח את הפרויקט מחדש לבדיקה?"
            : "לשלוח את הפרויקט לבדיקה? לאחר השליחה לא ניתן יהיה לערוך עד לקבלת תשובה."
        }
        confirmLabel={isResubmit ? "שליחה מחדש" : "שליחה לבדיקה"}
        loading={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
