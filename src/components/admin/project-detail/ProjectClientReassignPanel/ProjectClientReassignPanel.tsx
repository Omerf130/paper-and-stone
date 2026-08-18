"use client";

import { useState, useTransition } from "react";
import { reassignProjectClientAction } from "@/app/admin/projects/onboarding-actions";
import AdminClientPicker from "@/components/admin/project-detail/AdminClientPicker/AdminClientPicker";
import Button from "@/components/ui/Button/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import type { ClientLookupItem } from "@/lib/admin/clients/client-lookup-queries";
import type { AdminProjectDetailView } from "@/types/admin-project";
import styles from "./ProjectClientReassignPanel.module.scss";

type ProjectClientReassignPanelProps = {
  project: AdminProjectDetailView;
};

export default function ProjectClientReassignPanel({
  project,
}: ProjectClientReassignPanelProps) {
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<ClientLookupItem | null>(
    null,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleReassign = () => {
    if (!selectedClient) {
      toast({ type: "error", message: "יש לבחור לקוח לפני עדכון השיוך." });
      return;
    }

    startTransition(async () => {
      const result = await reassignProjectClientAction(
        project.id,
        selectedClient.id,
      );

      if (result.error) {
        toast({ type: "error", message: result.error });
        setConfirmOpen(false);
        return;
      }

      toast({ type: "success", message: "שיוך הלקוח עודכן." });
      setConfirmOpen(false);
      setSelectedClient(null);
    });
  };

  return (
    <section className={styles.panel} aria-labelledby="client-reassign-title">
      <h3 id="client-reassign-title" className={styles.title}>
        שיוך לקוח
      </h3>

      <p className={styles.current}>
        לקוח משויך: {project.assignedClientFullName ?? "—"}
      </p>

      <AdminClientPicker
        selectedClientId={selectedClient?.id ?? project.clientUserId}
        selectedClientLabel={
          selectedClient
            ? selectedClient.fullName ?? selectedClient.email
            : project.assignedClientFullName
        }
        onSelect={setSelectedClient}
        disabled={isPending}
      />

      <Button
        type="button"
        variant="secondary"
        onClick={() => setConfirmOpen(true)}
        disabled={
          isPending ||
          !selectedClient ||
          selectedClient.id === project.clientUserId
        }
        loading={isPending}
        loadingLabel="מעדכן..."
      >
        עדכון שיוך לקוח
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        title="עדכון שיוך לקוח"
        description={`לשייך את הפרויקט ל${selectedClient?.fullName ?? selectedClient?.email}?`}
        confirmLabel="עדכון"
        loading={isPending}
        onConfirm={handleReassign}
        onCancel={() => setConfirmOpen(false)}
      />
    </section>
  );
}
