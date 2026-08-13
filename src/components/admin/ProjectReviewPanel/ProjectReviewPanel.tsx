"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  approveProjectAction,
  rejectProjectAction,
  requestProjectChangesAction,
} from "@/app/admin/projects/actions";
import Button from "@/components/ui/Button/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import type { AdminReviewActionState } from "@/types/project";
import styles from "./ProjectReviewPanel.module.scss";

type ProjectReviewPanelProps = {
  projectId: string;
  status: "submitted" | "approved" | "changes_requested" | "rejected" | "draft";
};

type PendingAction = "approve" | "reject" | "changes" | null;
type SelectedAction = "approve" | "changes" | "reject" | null;

const initialState: AdminReviewActionState = {};

export default function ProjectReviewPanel({
  projectId,
  status,
}: ProjectReviewPanelProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [formState, setFormState] = useState(initialState);
  const [selectedAction, setSelectedAction] = useState<SelectedAction>(null);
  const [approveNote, setApproveNote] = useState("");
  const [changesMessage, setChangesMessage] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(
    null,
  );
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [isPending, startTransition] = useTransition();
  const changesRef = useRef<HTMLTextAreaElement>(null);
  const rejectRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (selectedAction === "changes") {
      changesRef.current?.focus();
    }

    if (selectedAction === "reject") {
      rejectRef.current?.focus();
    }
  }, [selectedAction]);

  if (status !== "submitted") {
    return null;
  }

  const fieldErrors = formState.fieldErrors ?? {};

  const resetSelection = () => {
    setSelectedAction(null);
    setFormState(initialState);
    setConfirmAction(null);
  };

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
    <div className={styles.panel}>
      {formState.error ? (
        <p className={styles.error} role="alert">
          {formState.error}
        </p>
      ) : null}

      {selectedAction === null ? (
        <>
          <p className={styles.intro}>
            בחרו את הפעולה המתאימה לפרויקט זה. ניתן לבצע פעולה אחת בכל פעם.
          </p>
          <div className={styles.actionChooser}>
            <Button
              onClick={() => setSelectedAction("approve")}
              disabled={isPending}
            >
              אישור פרויקט
            </Button>
            <Button
              variant="secondary"
              onClick={() => setSelectedAction("changes")}
              disabled={isPending}
            >
              בקשת שינויים
            </Button>
            <Button
              variant="danger"
              onClick={() => setSelectedAction("reject")}
              disabled={isPending}
            >
              דחיית פרויקט
            </Button>
          </div>
        </>
      ) : null}

      {selectedAction === "approve" ? (
        <div className={styles.actionPanel}>
          <p className={styles.actionIntro}>
            לאשר את הפרויקט. ניתן להוסיף הערה שתופיע בהיסטוריית הבדיקה.
          </p>
          <FormField
            label="הערה (אופציונלי)"
            htmlFor="approve-note"
            error={fieldErrors.note}
          >
            <textarea
              id="approve-note"
              className={formFieldStyles.textarea}
              value={approveNote}
              onChange={(event) => setApproveNote(event.target.value)}
              rows={4}
              disabled={isPending}
            />
          </FormField>
          <div className={styles.actionFooter}>
            <Button
              variant="ghost"
              onClick={resetSelection}
              disabled={isPending}
            >
              חזרה
            </Button>
            <Button
              onClick={() => setConfirmAction("approve")}
              loading={pendingAction === "approve"}
              loadingLabel="מאשר..."
              disabled={isPending}
            >
              אישור פרויקט
            </Button>
          </div>
        </div>
      ) : null}

      {selectedAction === "changes" ? (
        <div className={styles.actionPanel}>
          <p className={styles.actionIntro}>
            פרטו מה נדרש לשנות — ההודעה תישלח לאיש המקצוע ותופיע בהיסטוריית
            הבדיקה.
          </p>
          <FormField
            label="הודעה (חובה)"
            htmlFor="changes-message"
            error={fieldErrors.message}
          >
            <textarea
              ref={changesRef}
              id="changes-message"
              className={formFieldStyles.textarea}
              value={changesMessage}
              onChange={(event) => setChangesMessage(event.target.value)}
              rows={4}
              required
              disabled={isPending}
              aria-invalid={Boolean(fieldErrors.message)}
            />
          </FormField>
          <div className={styles.actionFooter}>
            <Button
              variant="ghost"
              onClick={resetSelection}
              disabled={isPending}
            >
              חזרה
            </Button>
            <Button
              variant="secondary"
              onClick={handleRequestChanges}
              loading={pendingAction === "changes"}
              loadingLabel="שולח..."
              disabled={isPending}
            >
              שליחת בקשת שינויים
            </Button>
          </div>
        </div>
      ) : null}

      {selectedAction === "reject" ? (
        <div className={styles.actionPanel}>
          <p className={styles.actionIntro}>
            לדחות את הפרויקט. יש לציין סיבה — ההודעה תישלח לאיש המקצוע.
          </p>
          <FormField
            label="סיבת דחייה (חובה)"
            htmlFor="reject-reason"
            error={fieldErrors.reason}
          >
            <textarea
              ref={rejectRef}
              id="reject-reason"
              className={formFieldStyles.textarea}
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              rows={4}
              required
              disabled={isPending}
              aria-invalid={Boolean(fieldErrors.reason)}
            />
          </FormField>
          <div className={styles.actionFooter}>
            <Button
              variant="ghost"
              onClick={resetSelection}
              disabled={isPending}
            >
              חזרה
            </Button>
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
      ) : null}

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
    </div>
  );
}
