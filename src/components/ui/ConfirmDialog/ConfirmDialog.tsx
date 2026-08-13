"use client";

import { useEffect, useRef } from "react";
import Button from "@/components/ui/Button/Button";
import styles from "./ConfirmDialog.module.scss";

export type ConfirmDialogTone = "default" | "danger";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: ConfirmDialogTone;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "ביטול",
  tone = "default",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    const handleCancel = (event: Event) => {
      event.preventDefault();
      onCancel();
    };

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onCancel]);

  return (
    <dialog ref={dialogRef} className={styles.dialog}>
      <div className={styles.content}>
        <h2 id="confirm-dialog-title" className={styles.title}>
          {title}
        </h2>
        <p id="confirm-dialog-description" className={styles.description}>
          {description}
        </p>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
            loadingLabel={confirmLabel}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
