"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { submitProjectAction } from "@/app/professional/projects/actions";
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
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const canSubmit =
    (status === "draft" || status === "changes_requested") && itemCount > 0;

  if (!canSubmit) {
    return null;
  }

  const isResubmit = status === "changes_requested";
  const confirmMessage = isResubmit
    ? "לשלוח את הפרויקט מחדש לבדיקה?"
    : "לשלוח את הפרויקט לבדיקה? לאחר השליחה לא ניתן יהיה לערוך עד לקבלת תשובה.";

  const handleSubmit = () => {
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setError(undefined);
    startTransition(async () => {
      const result = await submitProjectAction(projectId);
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
        onClick={handleSubmit}
        disabled={isPending}
      >
        {isPending
          ? "שולח..."
          : isResubmit
            ? "שליחה מחדש לבדיקה"
            : "שליחה לבדיקה"}
      </button>
    </div>
  );
}
