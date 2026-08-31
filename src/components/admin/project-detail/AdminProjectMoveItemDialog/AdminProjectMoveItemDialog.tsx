"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { moveProjectItemToRoomAsAdminAction } from "@/app/admin/projects/room-actions";
import Button from "@/components/ui/Button/Button";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import type { ProjectRoomView } from "@/types/project-room";
import dialogStyles from "@/components/professional/projects/project-room-dialog.module.scss";

type AdminProjectMoveItemDialogProps = {
  projectId: string;
  itemId: string;
  itemName: string;
  currentRoomId: string | null;
  rooms: ProjectRoomView[];
  open: boolean;
  onClose: () => void;
};

export default function AdminProjectMoveItemDialog({
  projectId,
  itemId,
  itemName,
  currentRoomId,
  rooms,
  open,
  onClose,
}: AdminProjectMoveItemDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const { toast } = useToast();
  const [targetRoomId, setTargetRoomId] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const hasOrphanOption = currentRoomId != null;
  const roomOptions = rooms.filter((room) => room.id !== currentRoomId);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
      setTargetRoomId(hasOrphanOption ? "" : roomOptions[0]?.id ?? "");
      setError(undefined);
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, hasOrphanOption, roomOptions]);

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
    if (!hasOrphanOption && !targetRoomId) {
      setError("נא לבחור חדר יעד.");
      return;
    }

    setError(undefined);

    startTransition(async () => {
      const result = await moveProjectItemToRoomAsAdminAction(
        projectId,
        itemId,
        targetRoomId || null,
      );

      if (result.error) {
        setError(result.error);
        return;
      }

      toast({ type: "success", message: "המוצר הועבר בהצלחה" });
      router.refresh();
      onClose();
    });
  };

  if (!hasOrphanOption && roomOptions.length === 0) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      className={dialogStyles.dialog}
      aria-labelledby="admin-move-item-title"
    >
      <div className={dialogStyles.panel}>
        <header className={dialogStyles.header}>
          <h2 id="admin-move-item-title" className={dialogStyles.title}>
            העברת מוצר
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

        <p className={dialogStyles.description}>{itemName}</p>

        <FormField
          label="יעד"
          htmlFor="admin-target-room"
          error={error}
        >
          <select
            id="admin-target-room"
            className={formFieldStyles.select}
            value={targetRoomId}
            onChange={(event) => setTargetRoomId(event.target.value)}
            disabled={isPending}
            aria-invalid={error ? true : undefined}
          >
            {hasOrphanOption ? (
              <option value="">ללא חדר</option>
            ) : null}
            {roomOptions.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
        </FormField>

        <div className={dialogStyles.actions}>
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            ביטול
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isPending}
            loadingLabel="מעביר..."
          >
            העברה
          </Button>
        </div>
      </div>
    </dialog>
  );
}
