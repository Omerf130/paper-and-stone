"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  approveClientAccountAction,
  rejectClientAccountAction,
} from "@/app/admin/client-requests/actions";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import Button from "@/components/ui/Button/Button";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import type { ClientRequestListItem } from "@/types/admin-user";
import styles from "./ClientRequestRowActions.module.scss";

type ClientRequestRowActionsProps = {
  request: ClientRequestListItem;
  layout?: "table" | "card";
};

type PendingAction = "approve" | "reject" | null;

export default function ClientRequestRowActions({
  request,
  layout = "table",
}: ClientRequestRowActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [isPending, startTransition] = useTransition();

  const confirmApprove = () => {
    startTransition(async () => {
      const result = await approveClientAccountAction(request.id);

      if (result.error) {
        toast({ type: "error", message: result.error });
        setPendingAction(null);
        return;
      }

      toast({ type: "success", message: "הרשמת הלקוח אושרה." });
      setPendingAction(null);
      router.refresh();
    });
  };

  const confirmReject = () => {
    startTransition(async () => {
      const result = await rejectClientAccountAction(request.id);

      if (result.error) {
        toast({ type: "error", message: result.error });
        setPendingAction(null);
        return;
      }

      toast({ type: "success", message: "הרשמת הלקוח נדחתה." });
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
          loading={isPending && pendingAction === "reject"}
          loadingLabel="דוחה..."
          onClick={() => setPendingAction("reject")}
        >
          דחייה
        </Button>
      </div>

      <ConfirmDialog
        open={pendingAction === "approve"}
        title="אישור הרשמת לקוח"
        description={`לאשר את הרשמת הלקוח של ${request.fullName ?? request.email}?`}
        confirmLabel="אישור"
        tone="default"
        loading={isPending}
        onConfirm={confirmApprove}
        onCancel={() => setPendingAction(null)}
      />

      <ConfirmDialog
        open={pendingAction === "reject"}
        title="דחיית הרשמת לקוח"
        description={`לדחות את הרשמת הלקוח של ${request.fullName ?? request.email}?`}
        confirmLabel="דחייה"
        tone="danger"
        loading={isPending}
        onConfirm={confirmReject}
        onCancel={() => setPendingAction(null)}
      />
    </>
  );
}
