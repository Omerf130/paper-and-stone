"use client";

import { useState, useTransition } from "react";
import { reassignProjectArchitectAction } from "@/app/admin/projects/crm-actions";
import AdminCrmArchitectPicker from "@/components/admin/crm/AdminCrmArchitectPicker/AdminCrmArchitectPicker";
import Button from "@/components/ui/Button/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import type { ArchitectLookupItem } from "@/lib/admin/architects/architect-lookup-queries";
import type { AdminProjectDetailView } from "@/types/admin-project";
import styles from "../ProjectClientReassignPanel/ProjectClientReassignPanel.module.scss";

type AdminProjectArchitectReassignPanelProps = {
  project: AdminProjectDetailView;
  currentArchitectLabel: string;
  embedded?: boolean;
};

export default function AdminProjectArchitectReassignPanel({
  project,
  currentArchitectLabel,
  embedded = false,
}: AdminProjectArchitectReassignPanelProps) {
  const { toast } = useToast();
  const [selectedArchitect, setSelectedArchitect] =
    useState<ArchitectLookupItem | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleReassign = () => {
    if (!selectedArchitect) {
      toast({ type: "error", message: "יש לבחור אדריכל לפני עדכון השיוך." });
      return;
    }

    startTransition(async () => {
      const result = await reassignProjectArchitectAction(
        project.id,
        selectedArchitect.id,
      );

      if (result.error) {
        toast({ type: "error", message: result.error });
        setConfirmOpen(false);
        return;
      }

      toast({ type: "success", message: "שיוך האדריכל עודכן." });
      setConfirmOpen(false);
      setSelectedArchitect(null);
    });
  };

  return (
    <section
      className={embedded ? styles.embeddedPanel : styles.panel}
      aria-labelledby={embedded ? undefined : "architect-reassign-title"}
    >
      {embedded ? null : (
        <h3 id="architect-reassign-title" className={styles.title}>
          שיוך אדריכל
        </h3>
      )}

      {embedded ? null : (
        <p className={styles.current}>אדריכל: {currentArchitectLabel}</p>
      )}

      <AdminCrmArchitectPicker
        selectedArchitectId={selectedArchitect?.id ?? project.ownerUserId}
        selectedArchitectLabel={
          selectedArchitect
            ? selectedArchitect.fullName ?? selectedArchitect.email
            : currentArchitectLabel
        }
        onSelect={setSelectedArchitect}
        disabled={isPending}
      />

      <Button
        type="button"
        variant="secondary"
        onClick={() => setConfirmOpen(true)}
        disabled={
          isPending ||
          !selectedArchitect ||
          selectedArchitect.id === project.ownerUserId
        }
        loading={isPending}
        loadingLabel="מעדכן..."
      >
        עדכון שיוך אדריכל
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        title="עדכון שיוך אדריכל"
        description={`להעביר את הפרויקט ל${selectedArchitect?.fullName ?? selectedArchitect?.email}?`}
        confirmLabel="עדכון"
        loading={isPending}
        onConfirm={handleReassign}
        onCancel={() => setConfirmOpen(false)}
      />
    </section>
  );
}
