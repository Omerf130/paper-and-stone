"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { renameProjectRoomAction } from "@/app/professional/projects/room-actions";
import Button from "@/components/ui/Button/Button";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import styles from "../project-room-dialog.module.scss";

type ProjectRoomRenameDialogProps = {
  projectId: string;
  roomId: string;
  initialName: string;
  open: boolean;
  onClose: () => void;
  onRenamed?: () => void;
};

export default function ProjectRoomRenameDialog({
  projectId,
  roomId,
  initialName,
  open,
  onClose,
  onRenamed,
}: ProjectRoomRenameDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
      setName(initialName);
      setError(undefined);
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, initialName]);

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
      const result = await renameProjectRoomAction(projectId, roomId, name);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.fieldErrors?.name) {
        setError(result.fieldErrors.name);
        return;
      }

      onRenamed?.();
      onClose();
    });
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="rename-room-title"
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <h2 id="rename-room-title" className={styles.title}>
            שינוי שם חדר
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
          htmlFor="rename-room-name"
          required
          error={error}
        >
          <input
            id="rename-room-name"
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
            loadingLabel="שומר..."
          >
            שמירה
          </Button>
        </div>
      </div>
    </dialog>
  );
}
