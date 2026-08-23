"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setClientProjectItemStatusAction } from "@/app/client/projects/item-status-actions";
import Button from "@/components/ui/Button/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import ProjectItemStatusBadge from "@/components/shared/ProjectItemStatusBadge/ProjectItemStatusBadge";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import type { ClientProjectItemWorkflowStatusView } from "@/types/client-project";
import styles from "./ClientProjectItemWorkflow.module.scss";

type ClientProjectItemWorkflowProps = {
  projectId: string;
  projectItemId: string;
  workflow: ClientProjectItemWorkflowStatusView;
};

export default function ClientProjectItemWorkflow({
  projectId,
  projectItemId,
  workflow,
}: ClientProjectItemWorkflowProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const canApprove = workflow.allowedTargetStatuses.includes("client_approved");
  const canReject = workflow.allowedTargetStatuses.includes("client_rejected");
  const showReviewActions =
    workflow.status === "client_review" && (canApprove || canReject);

  const runTransition = (targetStatus: "client_approved" | "client_rejected") => {
    setError(undefined);
    startTransition(async () => {
      const result = await setClientProjectItemStatusAction({
        projectId,
        projectItemId,
        targetStatus,
      });

      if (result.error) {
        setError(result.error);
        toast({ type: "error", message: result.error });
        return;
      }

      setIsRejectDialogOpen(false);
      toast({
        type: "success",
        message:
          targetStatus === "client_approved"
            ? "המוצר אושר בהצלחה"
            : "המוצר נדחה",
      });
      router.refresh();
    });
  };

  return (
    <div className={styles.workflow} aria-live="polite">
      <div className={styles.statusRow}>
        <ProjectItemStatusBadge
          status={workflow.status}
          role="client"
          presentation={workflow.presentation}
          size="prominent"
        />
      </div>

      {workflow.presentation.description ? (
        <p className={styles.context}>{workflow.presentation.description}</p>
      ) : null}

      {showReviewActions ? (
        <div className={styles.actions}>
          {canApprove ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              disabled={isPending}
              loading={isPending}
              loadingLabel="מאשר..."
              onClick={() => runTransition("client_approved")}
            >
              אישור מוצר
            </Button>
          ) : null}
          {canReject ? (
            <Button
              type="button"
              variant="danger"
              size="md"
              disabled={isPending}
              onClick={() => setIsRejectDialogOpen(true)}
            >
              דחיית מוצר
            </Button>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <ConfirmDialog
        open={isRejectDialogOpen}
        title="דחיית מוצר"
        description="האם לדחות את המוצר? לאחר הדחייה האדריכל יוכל לטפל בבקשה."
        confirmLabel="דחיית המוצר"
        cancelLabel="ביטול"
        tone="danger"
        loading={isPending}
        onConfirm={() => runTransition("client_rejected")}
        onCancel={() => setIsRejectDialogOpen(false)}
      />
    </div>
  );
}
