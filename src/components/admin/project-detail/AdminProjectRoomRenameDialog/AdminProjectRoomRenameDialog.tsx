"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { renameProjectRoomAsAdminAction } from "@/app/admin/projects/room-actions";
import Button from "@/components/ui/Button/Button";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import dialogStyles from "@/components/professional/projects/project-room-dialog.module.scss";

type AdminProjectRoomRenameDialogProps = {
  projectId: string;
  roomId: string;
  initialName: string;
  open: boolean;
  onClose: () => void;
  onRenamed?: () => void;
};

export default function AdminProjectRoomRenameDialog({
  projectId,
  roomId,
  initialName,
  open,
  onClose,
  onRenamed,
}: AdminProjectRoomRenameDialogProps) {
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
      const result = await renameProjectRoomAsAdminAction(projectId, roomId, name);

      if (result.error) {
        setError(result.error);
        return;
      }

      onRenamed?.();
      onClose();
    });
  };

  return (
    <dialog
      ref={dialogRef}
      className={dialogStyles.dialog}
      aria-labelledby="admin-rename-room-title"
    >
      <div className={dialogStyles.panel}>
        <header className={dialogStyles.header}>
          <h2 id="admin-rename-room-title" className={dialogStyles.title}>
            שינוי שם חדר
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
          htmlFor="admin-rename-room-name"
          required
          error={error}
        >
          <input
            id="admin-rename-room-name"
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
            loadingLabel="שומר..."
          >
            שמירה
          </Button>
        </div>
      </div>
    </dialog>
  );
}
