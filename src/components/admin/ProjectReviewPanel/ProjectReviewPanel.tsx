"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  approveProjectAction,
  rejectProjectAction,
  requestProjectChangesAction,
} from "@/app/admin/projects/actions";
import Button from "@/components/ui/Button/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import { FieldError, formFieldStyles } from "@/components/ui/FormField/FormField";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import type { AdminReviewActionState } from "@/types/project";
import styles from "./ProjectReviewPanel.module.scss";

type ProjectReviewPanelProps = {
  projectId: string;
  status: "submitted" | "approved" | "changes_requested" | "rejected" | "draft";
};

type PendingAction = "approve" | "reject" | "changes" | null;

const initialState: AdminReviewActionState = {};

export default function ProjectReviewPanel({
  projectId,
  status,
}: ProjectReviewPanelProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [formState, setFormState] = useState(initialState);
  const [approveNote, setApproveNote] = useState("");
  const [changesMessage, setChangesMessage] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(
    null,
  );
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [isPending, startTransition] = useTransition();

  if (status !== "submitted") {
    return null;
  }

  const fieldErrors = formState.fieldErrors ?? {};

  const runApprove = () => {
    setFormState(initialState);
    setPendingAction("approve");
    startTransition(async () => {
      const result = await approveProjectAction(projectId, approveNote);
      setPendingAction(null);
      setFormState(result);
      if (result.fieldErrors) {
        setConfirmAction(null);
        return;
      }
      if (result.error) {
        toast({ type: "error", message: result.error });
        setConfirmAction(null);
        return;
      }
      toast({ type: "success", message: "הפרויקט אושר" });
      setConfirmAction(null);
      router.refresh();
    });
  };

  const runReject = () => {
    setFormState(initialState);
    setPendingAction("reject");
    startTransition(async () => {
      const result = await rejectProjectAction(projectId, rejectReason);
      setPendingAction(null);
      setFormState(result);
      if (result.fieldErrors) {
        setConfirmAction(null);
        return;
      }
      if (result.error) {
        toast({ type: "error", message: result.error });
        setConfirmAction(null);
        return;
      }
      toast({ type: "success", message: "הפרויקט נדחה" });
      setConfirmAction(null);
      router.refresh();
    });
  };

  const handleRequestChanges = () => {
    setFormState(initialState);
    setPendingAction("changes");
    startTransition(async () => {
      const result = await requestProjectChangesAction(
        projectId,
        changesMessage,
      );
      setPendingAction(null);
      setFormState(result);
      if (result.fieldErrors) {
        return;
      }
      if (result.error) {
        toast({ type: "error", message: result.error });
        return;
      }
      toast({ type: "success", message: "נשלחה בקשה לשינויים" });
      router.refresh();
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

      <div className={styles.actionsGrid}>
        <div className={styles.actionBlock}>
          <h3 className={styles.actionTitle}>אישור</h3>
          <label className={styles.label} htmlFor="approve-note">
            הערה (אופציונלי)
          </label>
          <textarea
            id="approve-note"
            className={formFieldStyles.textarea}
            value={approveNote}
            onChange={(event) => setApproveNote(event.target.value)}
            rows={3}
            disabled={isPending}
          />
          {fieldErrors.note ? (
            <FieldError message={fieldErrors.note} />
          ) : null}
          <Button
            onClick={() => setConfirmAction("approve")}
            loading={pendingAction === "approve"}
            loadingLabel="מאשר..."
            disabled={isPending}
          >
            אישור פרויקט
          </Button>
        </div>

        <div className={styles.actionBlock}>
          <h3 className={styles.actionTitle}>בקשת שינויים</h3>
          <label className={styles.label} htmlFor="changes-message">
            הודעה (חובה)
          </label>
          <textarea
            id="changes-message"
            className={formFieldStyles.textarea}
            value={changesMessage}
            onChange={(event) => setChangesMessage(event.target.value)}
            rows={3}
            required
            disabled={isPending}
            aria-invalid={Boolean(fieldErrors.message)}
          />
          {fieldErrors.message ? (
            <FieldError message={fieldErrors.message} />
          ) : null}
          <Button
            variant="secondary"
            onClick={handleRequestChanges}
            loading={pendingAction === "changes"}
            loadingLabel="שולח..."
            disabled={isPending}
          >
            בקשת שינויים
          </Button>
        </div>

        <div className={styles.actionBlock}>
          <h3 className={styles.actionTitle}>דחייה</h3>
          <label className={styles.label} htmlFor="reject-reason">
            סיבת דחייה (חובה)
          </label>
          <textarea
            id="reject-reason"
            className={formFieldStyles.textarea}
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            rows={3}
            required
            disabled={isPending}
            aria-invalid={Boolean(fieldErrors.reason)}
          />
          {fieldErrors.reason ? (
            <FieldError message={fieldErrors.reason} />
          ) : null}
          <Button
            variant="danger"
            onClick={() => setConfirmAction("reject")}
            loading={pendingAction === "reject"}
            loadingLabel="דוחה..."
            disabled={isPending}
          >
            דחיית פרויקט
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmAction === "approve"}
        title="אישור פרויקט"
        description="לאשר את הפרויקט? פעולה זו תסמן את הפרויקט כמאושר."
        confirmLabel="אישור פרויקט"
        loading={pendingAction === "approve"}
        onConfirm={runApprove}
        onCancel={() => setConfirmAction(null)}
      />

      <ConfirmDialog
        open={confirmAction === "reject"}
        title="דחיית פרויקט"
        description="לדחות את הפרויקט? פעולה זו תסמן את הפרויקט כנדחה."
        confirmLabel="דחיית פרויקט"
        tone="danger"
        loading={pendingAction === "reject"}
        onConfirm={runReject}
        onCancel={() => setConfirmAction(null)}
      />
    </section>
  );
}
