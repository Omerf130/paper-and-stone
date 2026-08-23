"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { addProductToProjectAction } from "@/app/professional/projects/actions";
import { getProjectRoomsForPickerAction } from "@/app/professional/projects/room-actions";
import type { ProjectOptionView } from "@/types/project";
import styles from "./AddToProjectDialog.module.scss";

type AddToProjectSelection = {
  productSlug: string;
  selectedMaterialId?: string;
  selectedColorId?: string;
  selectedSizeKey?: string;
  quantity: number;
};

type AddToProjectDialogProps = {
  projectOptions: ProjectOptionView[];
  profileReady: boolean;
  selection: AddToProjectSelection;
  isOpen: boolean;
  onClose: () => void;
};

export default function AddToProjectDialog({
  projectOptions,
  profileReady,
  selection,
  isOpen,
  onClose,
}: AddToProjectDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [selectedProjectId, setSelectedProjectId] = useState(
    projectOptions[0]?.id ?? "",
  );
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [roomOptions, setRoomOptions] = useState<Array<{ id: string; name: string }>>(
    [],
  );
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (isOpen && !dialog.open) {
      dialog.showModal();
      setError(undefined);
      setSuccessMessage(undefined);
      const initialProjectId = projectOptions[0]?.id ?? "";
      setSelectedProjectId(initialProjectId);
      if (initialProjectId) {
        queueMicrotask(() => {
          void loadRoomsForProject(initialProjectId);
        });
      }
    }

    if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen, projectOptions]);

  async function loadRoomsForProject(projectId: string) {
    setRoomsLoading(true);
    const result = await getProjectRoomsForPickerAction(projectId);
    setRoomsLoading(false);

    if (result.error || result.rooms.length === 0) {
      setRoomOptions([]);
      setSelectedRoomId("");
      return;
    }

    setRoomOptions(result.rooms);
    setSelectedRoomId(result.rooms[0]?.id ?? "");
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  const requiresRoom = roomOptions.length > 0;

  const handleSubmit = () => {
    if (!profileReady) {
      return;
    }

    if (!selectedProjectId) {
      setError("נא לבחור פרויקט.");
      return;
    }

    if (requiresRoom && !selectedRoomId) {
      setError("נא לבחור חדר.");
      return;
    }

    setError(undefined);
    setSuccessMessage(undefined);

    startTransition(async () => {
      const result = await addProductToProjectAction({
        projectId: selectedProjectId,
        productSlug: selection.productSlug,
        selectedMaterialId: selection.selectedMaterialId,
        selectedColorId: selection.selectedColorId,
        selectedSizeKey: selection.selectedSizeKey,
        quantity: selection.quantity,
        roomId: requiresRoom ? selectedRoomId : undefined,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccessMessage("המוצר נוסף לפרויקט.");
      const destination = requiresRoom
        ? `/professional/projects/${selectedProjectId}?room=${selectedRoomId}`
        : `/professional/projects/${selectedProjectId}`;
      router.push(destination);
      onClose();
    });
  };

  return (
    <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="add-to-project-title">
      <div className={styles.panel}>
        <header className={styles.header}>
          <h2 id="add-to-project-title" className={styles.title}>
            הוספה לפרויקט
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

        {!profileReady ? (
          <div className={styles.messageBlock}>
            <p className={styles.message}>
              יש להשלים שם מלא וטלפון בפרופיל לפני הוספת מוצרים לפרויקט.
            </p>
            <Link href="/professional/profile" className={styles.linkButton}>
              השלמת פרופיל
            </Link>
          </div>
        ) : projectOptions.length === 0 ? (
          <div className={styles.messageBlock}>
            <p className={styles.message}>עדיין לא יצרת פרויקטים.</p>
            <Link href="/professional/projects/new" className={styles.linkButton}>
              צור פרויקט ראשון
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.field}>
              <label htmlFor="project-select" className={styles.label}>
                בחר פרויקט
              </label>
              <select
                id="project-select"
                className={styles.select}
                value={selectedProjectId}
                onChange={(event) => {
                  const nextProjectId = event.target.value;
                  setSelectedProjectId(nextProjectId);
                  void loadRoomsForProject(nextProjectId);
                }}
                disabled={isPending || roomsLoading}
              >
                {projectOptions.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {requiresRoom ? (
              <div className={styles.field}>
                <label htmlFor="room-select" className={styles.label}>
                  בחר חדר
                </label>
                <select
                  id="room-select"
                  className={styles.select}
                  value={selectedRoomId}
                  onChange={(event) => setSelectedRoomId(event.target.value)}
                  disabled={isPending || roomsLoading}
                >
                  {roomOptions.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {error ? (
              <p className={styles.error} role="alert">
                {error}
              </p>
            ) : null}

            {successMessage ? (
              <p className={styles.success} role="status">
                {successMessage}
              </p>
            ) : null}

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleSubmit}
                disabled={isPending || roomsLoading}
              >
                {isPending ? "מוסיף..." : "הוספה לפרויקט"}
              </button>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={onClose}
              >
                סגירה
              </button>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
