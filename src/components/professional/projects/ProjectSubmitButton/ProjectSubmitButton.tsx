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
  commercialDirty?: boolean;
  pricingComplete?: boolean;
  pricingBlockedReason?: string | null;
};

export default function ProjectSubmitButton({
  projectId,
  status,
  itemCount,
  commercialDirty = false,
  pricingComplete = true,
  pricingBlockedReason = null,
}: ProjectSubmitButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isInitialSubmit =
    status === "draft" || status === "changes_requested";
  const isDirtyResubmit = status === "approved" && commercialDirty;
  const canSubmit =
    (isInitialSubmit || isDirtyResubmit) && itemCount > 0 && pricingComplete;

  if (!isInitialSubmit && !isDirtyResubmit) {
    return null;
  }

  const isResubmit = status === "changes_requested" || isDirtyResubmit;
  const submitLabel = isDirtyResubmit
    ? "שליחה מחדש לבדיקה"
    : isResubmit
      ? "שליחה מחדש לבדיקה"
      : "שליחה לבדיקה";

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
      {pricingBlockedReason && isDirtyResubmit ? (
        <p className={styles.hint} role="status">
          {pricingBlockedReason}
        </p>
      ) : null}
      <Button
        onClick={() => setConfirmOpen(true)}
        loading={isPending}
        loadingLabel="שולח..."
        disabled={!canSubmit}
      >
        {submitLabel}
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        title={submitLabel}
        description={
          isDirtyResubmit
            ? "לשלוח את השינויים לבדיקה מסחרית מחדש?"
            : isResubmit
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
