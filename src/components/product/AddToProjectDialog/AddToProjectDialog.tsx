"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { addProductToProjectAction } from "@/app/professional/projects/actions";
import { getProjectRoomsForPickerAction } from "@/app/professional/projects/room-actions";
import { buildAddToProjectConfigurationView } from "@/lib/products/build-add-to-project-configuration-view";
import { MAX_PRODUCT_QUANTITY } from "@/lib/products/useProductConfiguratorState";
import type { AddToProjectConfigurationView } from "@/lib/products/build-add-to-project-configuration-view";
import type { ProjectPickerOptionView, RoomPickerOptionView } from "@/types/project";
import AddToProjectConfigurationSummary from "./AddToProjectConfigurationSummary";
import AddToProjectDestinationNotice from "./AddToProjectDestinationNotice";
import AddToProjectProjectPicker from "./AddToProjectProjectPicker";
import AddToProjectQuantityStepper from "./AddToProjectQuantityStepper";
import AddToProjectRoomPicker from "./AddToProjectRoomPicker";
import styles from "./AddToProjectDialog.module.scss";

type AddToProjectSelection = {
  productSlug: string;
  selectedMaterialId?: string;
  selectedColorId?: string;
  selectedSizeKey?: string;
  quantity: number;
};

type AddToProjectDialogProps = {
  projectOptions: ProjectPickerOptionView[];
  profileReady: boolean;
  selection: AddToProjectSelection;
  configuration: AddToProjectConfigurationView;
  quantity: number;
  decreaseQuantity: () => void;
  increaseQuantity: () => void;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (payload: {
    projectId: string;
    projectName: string;
    roomId?: string;
    roomName?: string;
  }) => void;
};

export default function AddToProjectDialog({
  projectOptions,
  profileReady,
  selection,
  configuration,
  quantity,
  decreaseQuantity,
  increaseQuantity,
  isOpen,
  onClose,
  onSuccess,
}: AddToProjectDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedProjectId, setSelectedProjectId] = useState(
    projectOptions[0]?.id ?? "",
  );
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [roomOptions, setRoomOptions] = useState<RoomPickerOptionView[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomLoadError, setRoomLoadError] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const selectedProject =
    projectOptions.find((project) => project.id === selectedProjectId) ?? null;
  const selectedRoom =
    roomOptions.find((room) => room.id === selectedRoomId) ?? null;

  async function loadRoomsForProject(projectId: string) {
    setRoomsLoading(true);
    setRoomLoadError(undefined);

    const result = await getProjectRoomsForPickerAction(projectId);
    setRoomsLoading(false);

    if (result.error) {
      setRoomOptions([]);
      setSelectedRoomId("");
      setRoomLoadError(result.error);
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

    if (isOpen && !dialog.open) {
      dialog.showModal();
      setError(undefined);
      setRoomLoadError(undefined);
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

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  const requiresRoom = Boolean(selectedProjectId);
  const canSubmit =
    profileReady &&
    Boolean(selectedProjectId) &&
    roomOptions.length > 0 &&
    Boolean(selectedRoomId) &&
    !roomsLoading &&
    !isPending;

  const submitLabel = selectedRoom
    ? `הוספה ל${selectedRoom.name}`
    : "הוספה לפרויקט";

  const handleSubmit = () => {
    if (!profileReady) {
      return;
    }

    if (!selectedProjectId) {
      setError("נא לבחור פרויקט.");
      return;
    }

    if (requiresRoom && roomOptions.length === 0) {
      setError("לפרויקט זה אין חדרים. הוסיפו חדר בפרויקט לפני הוספת מוצר.");
      return;
    }

    if (requiresRoom && !selectedRoomId) {
      setError("נא לבחור חדר.");
      return;
    }

    setError(undefined);

    startTransition(async () => {
      const result = await addProductToProjectAction({
        projectId: selectedProjectId,
        productSlug: selection.productSlug,
        selectedMaterialId: selection.selectedMaterialId,
        selectedColorId: selection.selectedColorId,
        selectedSizeKey: selection.selectedSizeKey,
        quantity,
        roomId: selectedRoomId,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      onSuccess?.({
        projectId: selectedProjectId,
        projectName: selectedProject?.name ?? "",
        roomId: selectedRoomId || undefined,
        roomName: selectedRoom?.name,
      });
      onClose();
    });
  };

  return (
    <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="add-to-project-title">
      <div className={styles.panel}>
        <header className={styles.header}>
          <div className={styles.headerText}>
            <h2 id="add-to-project-title" className={styles.title}>
              הוספה לפרויקט
            </h2>
            <p className={styles.description}>
              הוסיפו את המוצר לאחד הפרויקטים והחדרים שלכם.
            </p>
          </div>
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
            <div className={styles.body}>
              <AddToProjectProjectPicker
                options={projectOptions}
                selectedId={selectedProjectId}
                onSelect={(projectId) => {
                  setSelectedProjectId(projectId);
                  setSelectedRoomId("");
                  void loadRoomsForProject(projectId);
                }}
                disabled={isPending}
              />

              <AddToProjectRoomPicker
                options={roomOptions}
                selectedId={selectedRoomId}
                onSelect={setSelectedRoomId}
                disabled={isPending}
                loading={roomsLoading}
                projectId={selectedProjectId}
                projectSelected={Boolean(selectedProjectId)}
              />

              <AddToProjectQuantityStepper
                quantity={quantity}
                onDecrease={decreaseQuantity}
                onIncrease={increaseQuantity}
                max={MAX_PRODUCT_QUANTITY}
                disabled={isPending}
              />

              <AddToProjectConfigurationSummary configuration={configuration} />

              <AddToProjectDestinationNotice
                projectName={selectedProject?.name}
                roomName={selectedRoom?.name}
              />

              {roomLoadError ? (
                <p className={styles.error} role="alert">
                  {roomLoadError}
                </p>
              ) : null}

              {error ? (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              ) : null}
            </div>

            <footer className={styles.footer}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={onClose}
                disabled={isPending}
              >
                ביטול
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleSubmit}
                disabled={!canSubmit}
              >
                {isPending ? "מוסיף..." : submitLabel}
              </button>
            </footer>
          </>
        )}
      </div>
    </dialog>
  );
}