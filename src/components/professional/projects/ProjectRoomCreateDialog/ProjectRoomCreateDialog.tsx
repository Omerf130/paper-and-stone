"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createProjectRoomAction } from "@/app/professional/projects/room-actions";
import Button from "@/components/ui/Button/Button";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import styles from "../project-room-dialog.module.scss";

type ProjectRoomCreateDialogProps = {
  projectId: string;
  open: boolean;
  onClose: () => void;
  onCreated?: (roomId: string) => void;
};

export default function ProjectRoomCreateDialog({
  projectId,
  open,
  onClose,
  onCreated,
}: ProjectRoomCreateDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
      setName("");
      setError(undefined);
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

    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  const handleSubmit = () => {
    setError(undefined);

    startTransition(async () => {
      const result = await createProjectRoomAction(projectId, name);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.fieldErrors?.name) {
        setError(result.fieldErrors.name);
        return;
      }

      onCreated?.(result.roomId ?? "");
      onClose();
    });
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="create-room-title"
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <h2 id="create-room-title" className={styles.title}>
            יצירת חדר
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="סגירה"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <FormField
          label="שם החדר"
          htmlFor="room-name"
          required
          error={error}
        >
          <input
            id="room-name"
            type="text"
            className={formFieldStyles.input}
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={isPending}
            aria-invalid={error ? true : undefined}
          />
        </FormField>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            ביטול
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isPending}
            loadingLabel="יוצר..."
          >
            יצירת חדר
          </Button>
        </div>
      </div>
    </dialog>
  );
}
