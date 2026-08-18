"use client";

import { useState, useTransition } from "react";
import {
  approveProjectOnboardingAction,
  rejectProjectOnboardingAction,
} from "@/app/admin/projects/onboarding-actions";
import AdminClientPicker from "@/components/admin/project-detail/AdminClientPicker/AdminClientPicker";
import Button from "@/components/ui/Button/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import type { ClientLookupItem } from "@/lib/admin/clients/client-lookup-queries";
import type { AdminProjectDetailView } from "@/types/admin-project";
import styles from "./ProjectOnboardingReviewPanel.module.scss";

type ProjectOnboardingReviewPanelProps = {
  project: AdminProjectDetailView;
};

type PendingAction = "approve" | "reject" | null;

export default function ProjectOnboardingReviewPanel({
  project,
}: ProjectOnboardingReviewPanelProps) {
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<ClientLookupItem | null>(
    null,
  );
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    if (!selectedClient) {
      toast({ type: "error", message: "יש לבחור לקוח לפני אישור הפרויקט." });
      return;
    }

    startTransition(async () => {
      const result = await approveProjectOnboardingAction(
        project.id,
        selectedClient.id,
      );

      if (result.error) {
        toast({ type: "error", message: result.error });
        setPendingAction(null);
        return;
      }

      toast({ type: "success", message: "הפרויקט אושר לפתיחה." });
      setPendingAction(null);
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      const result = await rejectProjectOnboardingAction(
        project.id,
        rejectReason,
      );

      if (result.error) {
        toast({ type: "error", message: result.error });
        setPendingAction(null);
        return;
      }

      toast({ type: "success", message: "בקשת הפתיחה נדחתה." });
      setPendingAction(null);
    });
  };

  return (
    <section className={styles.panel} aria-labelledby="onboarding-review-title">
      <h3 id="onboarding-review-title" className={styles.title}>
        אישור פתיחת פרויקט
      </h3>

      <dl className={styles.meta}>
        <div>
          <dt>אדריכל</dt>
          <dd>{project.professionalName ?? project.professionalEmail}</dd>
        </div>
        <div>
          <dt>מיקום</dt>
          <dd>{project.location ?? "—"}</dd>
        </div>
        <div>
          <dt>תיאור</dt>
          <dd>{project.description ?? "—"}</dd>
        </div>
      </dl>

      <AdminClientPicker
        selectedClientId={selectedClient?.id}
        selectedClientLabel={
          selectedClient
            ? selectedClient.fullName ?? selectedClient.email
            : null
        }
        onSelect={setSelectedClient}
        disabled={isPending}
      />

      {!showRejectForm ? (
        <div className={styles.actions}>
          <Button
            type="button"
            onClick={() => setPendingAction("approve")}
            disabled={isPending || !selectedClient}
            loading={isPending && pendingAction === "approve"}
            loadingLabel="מאשר..."
          >
            אישור פתיחה
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowRejectForm(true)}
            disabled={isPending}
          >
            דחייה
          </Button>
        </div>
      ) : (
        <div className={styles.rejectPanel}>
          <FormField label="סיבת דחייה (אופציונלי)" htmlFor="reject-reason">
            <textarea
              id="reject-reason"
              className={formFieldStyles.textarea}
              rows={3}
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              disabled={isPending}
            />
          </FormField>
          <div className={styles.actions}>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowRejectForm(false)}
              disabled={isPending}
            >
              חזרה
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => setPendingAction("reject")}
              disabled={isPending}
            >
              דחיית בקשה
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={pendingAction === "approve"}
        title="אישור פתיחת פרויקט"
        description={`לאשר את פתיחת הפרויקט עבור ${selectedClient?.fullName ?? selectedClient?.email}?`}
        confirmLabel="אישור"
        loading={isPending}
        onConfirm={handleApprove}
        onCancel={() => setPendingAction(null)}
      />

      <ConfirmDialog
        open={pendingAction === "reject"}
        title="דחיית בקשת פתיחה"
        description="האם לדחות את בקשת פתיחת הפרויקט?"
        confirmLabel="דחייה"
        tone="danger"
        loading={isPending}
        onConfirm={handleReject}
        onCancel={() => {
          setPendingAction(null);
          setShowRejectForm(false);
        }}
      />
    </section>
  );
}
