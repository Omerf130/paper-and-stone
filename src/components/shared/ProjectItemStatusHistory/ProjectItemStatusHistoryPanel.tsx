"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { formatDateTime } from "@/lib/ui/format-date-time";
import { getProjectItemStatusPresentation } from "@/lib/project-items/project-item-status-presentation";
import type {
  ProjectItemStatusChangeRole,
  ProjectItemStatusHistoryEntry,
} from "@/types/project-item-status";
import styles from "./ProjectItemStatusHistoryPanel.module.scss";

type ProjectItemStatusHistoryPanelProps = {
  history: ProjectItemStatusHistoryEntry[];
  role: "admin" | "architect";
};

const ROLE_LABELS: Record<ProjectItemStatusChangeRole, string> = {
  admin: "מנהל",
  architect: "אדריכל",
  client: "לקוח",
};

function getPresentationRole(
  viewerRole: "admin" | "architect",
  changedByRole: ProjectItemStatusChangeRole,
): "admin" | "architect" | "client" {
  if (changedByRole === "client") {
    return "client";
  }

  return viewerRole;
}

export default function ProjectItemStatusHistoryPanel({
  history,
  role,
}: ProjectItemStatusHistoryPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (isOpen && !dialog.open) {
      dialog.showModal();
    }

    if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    const handleCancel = (event: Event) => {
      event.preventDefault();
      closeDialog();
    };

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [closeDialog]);

  if (history.length === 0) {
    return null;
  }

  const entries = [...history].reverse();

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        היסטוריית סטטוס
      </button>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby={titleId}
      >
        <div className={styles.content}>
          <header className={styles.header}>
            <h3 id={titleId} className={styles.title}>
              היסטוריית סטטוס
            </h3>
            <button
              type="button"
              className={styles.closeButton}
              aria-label="סגירה"
              onClick={closeDialog}
            >
              ×
            </button>
          </header>

          <ol className={styles.list}>
            {entries.map((entry, index) => {
              const presentationRole = getPresentationRole(role, entry.changedByRole);
              const fromLabel = getProjectItemStatusPresentation(
                entry.from,
                presentationRole,
              ).label;
              const toLabel = getProjectItemStatusPresentation(
                entry.to,
                presentationRole,
              ).label;

              return (
                <li key={`${entry.changedAt}-${index}`} className={styles.item}>
                  <div className={styles.itemHeader}>
                    <span className={styles.role}>
                      {ROLE_LABELS[entry.changedByRole]}
                    </span>
                    <time className={styles.time} dateTime={entry.changedAt}>
                      {formatDateTime(entry.changedAt)}
                    </time>
                  </div>
                  <p className={styles.transition}>
                    {fromLabel} → {toLabel}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </dialog>
    </>
  );
}
