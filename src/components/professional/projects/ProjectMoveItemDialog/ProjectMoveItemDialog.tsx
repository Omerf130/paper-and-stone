"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { moveProjectItemToRoomAction } from "@/app/professional/projects/room-actions";
import Button from "@/components/ui/Button/Button";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import type { ProjectRoomView } from "@/types/project-room";
import styles from "../project-room-dialog.module.scss";

type ProjectMoveItemDialogProps = {
  projectId: string;
  itemId: string;
  itemName: string;
  currentRoomId: string;
  rooms: ProjectRoomView[];
  open: boolean;
  onClose: () => void;
};

export default function ProjectMoveItemDialog({
  projectId,
  itemId,
  itemName,
  currentRoomId,
  rooms,
  open,
  onClose,
}: ProjectMoveItemDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const { toast } = useToast();
  const targetRooms = rooms.filter((room) => room.id !== currentRoomId);
  const [targetRoomId, setTargetRoomId] = useState(targetRooms[0]?.id ?? "");
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
      setTargetRoomId(targetRooms[0]?.id ?? "");
      setError(undefined);
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, targetRooms]);

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
    if (!targetRoomId) {
      setError("נא לבחור חדר יעד.");
      return;
    }

    setError(undefined);

    startTransition(async () => {
      const result = await moveProjectItemToRoomAction(
        projectId,
        itemId,
        targetRoomId,
      );

      if (result.error) {
        setError(result.error);
        return;
      }

      toast({ type: "success", message: "המוצר הועבר לחדר אחר" });
      router.refresh();
      onClose();
    });
  };

  if (targetRooms.length === 0) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="move-item-title"
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <h2 id="move-item-title" className={styles.title}>
            העברת מוצר לחדר אחר
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

        <p className={styles.description}>{itemName}</p>

        <FormField
          label="חדר יעד"
          htmlFor="target-room"
          required
          error={error}
        >
          <select
            id="target-room"
            className={formFieldStyles.select}
            value={targetRoomId}
            onChange={(event) => setTargetRoomId(event.target.value)}
            disabled={isPending}
            aria-invalid={error ? true : undefined}
          >
            {targetRooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
        </FormField>

        <div className={styles.actions}>
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
