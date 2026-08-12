"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  approveProjectAction,
  rejectProjectAction,
  requestProjectChangesAction,
} from "@/app/admin/projects/actions";
import type { AdminReviewActionState } from "@/types/project";
import styles from "./ProjectReviewPanel.module.scss";

type ProjectReviewPanelProps = {
  projectId: string;
  status: "submitted" | "approved" | "changes_requested" | "rejected" | "draft";
};

const initialState: AdminReviewActionState = {};

export default function ProjectReviewPanel({
  projectId,
  status,
}: ProjectReviewPanelProps) {
  const router = useRouter();
  const [formState, setFormState] = useState(initialState);
  const [approveNote, setApproveNote] = useState("");
  const [changesMessage, setChangesMessage] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [isPending, startTransition] = useTransition();

  if (status !== "submitted") {
    return null;
  }

  const fieldErrors = formState.fieldErrors ?? {};

  const handleApprove = () => {
    setFormState(initialState);
    startTransition(async () => {
      const result = await approveProjectAction(projectId, approveNote);
      setFormState(result);
      if (result.success) {
        router.refresh();
      }
    });
  };

  const handleRequestChanges = () => {
    setFormState(initialState);
    startTransition(async () => {
      const result = await requestProjectChangesAction(
        projectId,
        changesMessage,
      );
      setFormState(result);
      if (result.success) {
        router.refresh();
      }
    });
  };

  const handleReject = () => {
    setFormState(initialState);
    startTransition(async () => {
      const result = await rejectProjectAction(projectId, rejectReason);
      setFormState(result);
      if (result.success) {
        router.refresh();
      }
    });
  };

  return (
    <section className={styles.panel} aria-labelledby="review-panel-title">
      <h2 id="review-panel-title" className={styles.title}>
        בדיקת פרויקט
      </h2>

      {formState.error ? (
        <p className={styles.error} role="alert">
          {formState.error}
        </p>
      ) : null}

      {formState.success ? (
        <p className={styles.success} role="status">
          הפעולה בוצעה בהצלחה.
        </p>
      ) : null}

      <div className={styles.actionsGrid}>
        <div className={styles.actionBlock}>
          <h3 className={styles.actionTitle}>אישור</h3>
          <label className={styles.label} htmlFor="approve-note">
            הערה (אופציונלי)
          </label>
          <textarea
            id="approve-note"
            className={styles.textarea}
            value={approveNote}
            onChange={(event) => setApproveNote(event.target.value)}
            rows={3}
          />
          {fieldErrors.note ? (
            <p className={styles.fieldError}>{fieldErrors.note}</p>
          ) : null}
          <button
            type="button"
            className={styles.approveButton}
            onClick={handleApprove}
            disabled={isPending}
          >
            אישור פרויקט
          </button>
        </div>

        <div className={styles.actionBlock}>
          <h3 className={styles.actionTitle}>בקשת שינויים</h3>
          <label className={styles.label} htmlFor="changes-message">
            הודעה (חובה)
          </label>
          <textarea
            id="changes-message"
            className={styles.textarea}
            value={changesMessage}
            onChange={(event) => setChangesMessage(event.target.value)}
            rows={3}
            required
          />
          {fieldErrors.message ? (
            <p className={styles.fieldError}>{fieldErrors.message}</p>
          ) : null}
          <button
            type="button"
            className={styles.changesButton}
            onClick={handleRequestChanges}
            disabled={isPending}
          >
            בקשת שינויים
          </button>
        </div>

        <div className={styles.actionBlock}>
          <h3 className={styles.actionTitle}>דחייה</h3>
          <label className={styles.label} htmlFor="reject-reason">
            סיבת דחייה (חובה)
          </label>
          <textarea
            id="reject-reason"
            className={styles.textarea}
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            rows={3}
            required
          />
          {fieldErrors.reason ? (
            <p className={styles.fieldError}>{fieldErrors.reason}</p>
          ) : null}
          <button
            type="button"
            className={styles.rejectButton}
            onClick={handleReject}
            disabled={isPending}
          >
            דחיית פרויקט
          </button>
        </div>
      </div>
    </section>
  );
}
