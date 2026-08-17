"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  approveArchitectRequestAction,
  declineArchitectRequestAction,
} from "@/app/admin/architect-requests/actions";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import Button from "@/components/ui/Button/Button";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import type { ArchitectRequestListItem } from "@/types/admin-user";
import styles from "./ArchitectRequestRowActions.module.scss";

type ArchitectRequestRowActionsProps = {
  request: ArchitectRequestListItem;
  layout?: "table" | "card";
};

type PendingAction = "approve" | "decline" | null;

export default function ArchitectRequestRowActions({
  request,
  layout = "table",
}: ArchitectRequestRowActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [isPending, startTransition] = useTransition();

  const confirmApprove = () => {
    startTransition(async () => {
      const result = await approveArchitectRequestAction(request.id);

      if (result.error) {
        toast({ type: "error", message: result.error });
        setPendingAction(null);
        return;
      }

      toast({ type: "success", message: "הרשאת אדריכל אושרה." });
      setPendingAction(null);
      router.refresh();
    });
  };

  const confirmDecline = () => {
    startTransition(async () => {
      const result = await declineArchitectRequestAction(request.id);

      if (result.error) {
        toast({ type: "error", message: result.error });
        setPendingAction(null);
        return;
      }

      toast({ type: "success", message: "בקשת האדריכל נדחתה." });
      setPendingAction(null);
      router.refresh();
    });
  };

  return (
    <>
      <div className={layout === "card" ? styles.cardActions : styles.actions}>
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={isPending}
          loading={isPending && pendingAction === "approve"}
          loadingLabel="מאשר..."
          onClick={() => setPendingAction("approve")}
        >
          אישור
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={isPending}
          loading={isPending && pendingAction === "decline"}
          loadingLabel="דוחה..."
          onClick={() => setPendingAction("decline")}
        >
          דחייה
        </Button>
      </div>

      <ConfirmDialog
        open={pendingAction === "approve"}
        title="אישור הרשאת אדריכל"
        description={`לאשר את בקשת האדריכל של ${request.fullName ?? request.email}?`}
        confirmLabel="אישור"
        tone="default"
        loading={isPending}
        onConfirm={confirmApprove}
        onCancel={() => setPendingAction(null)}
      />

      <ConfirmDialog
        open={pendingAction === "decline"}
        title="דחיית בקשת אדריכל"
        description={`לדחות את בקשת האדריכל של ${request.fullName ?? request.email}?`}
        confirmLabel="דחייה"
        tone="danger"
        loading={isPending}
        onConfirm={confirmDecline}
        onCancel={() => setPendingAction(null)}
      />
    </>
  );
}
