"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createProjectRoomAsAdminAction } from "@/app/admin/projects/room-actions";
import Button from "@/components/ui/Button/Button";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import dialogStyles from "@/components/professional/projects/project-room-dialog.module.scss";

type AdminProjectRoomCreateDialogProps = {
  projectId: string;
  open: boolean;
  onClose: () => void;
  onCreated?: (roomId: string) => void;
};

export default function AdminProjectRoomCreateDialog({
  projectId,
  open,
  onClose,
  onCreated,
}: AdminProjectRoomCreateDialogProps) {
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
      const result = await createProjectRoomAsAdminAction(projectId, name);

      if (result.error) {
        setError(result.error);
        return;
      }

      onCreated?.(result.roomId ?? "");
      onClose();
    });
  };

  return (
    <dialog
      ref={dialogRef}
      className={dialogStyles.dialog}
      aria-labelledby="admin-create-room-title"
    >
      <div className={dialogStyles.panel}>
        <header className={dialogStyles.header}>
          <h2 id="admin-create-room-title" className={dialogStyles.title}>
            יצירת חדר
          </h2>
          <button
            type="button"
            className={dialogStyles.closeButton}
            aria-label="סגירה"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <FormField
          label="שם החדר"
          htmlFor="admin-room-name"
          required
          error={error}
        >
          <input
            id="admin-room-name"
            type="text"
            className={formFieldStyles.input}
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={isPending}
            aria-invalid={error ? true : undefined}
          />
        </FormField>

        <div className={dialogStyles.actions}>
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
