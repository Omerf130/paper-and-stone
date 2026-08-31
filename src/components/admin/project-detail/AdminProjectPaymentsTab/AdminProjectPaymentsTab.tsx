"use client";

import { useState, useTransition } from "react";
import { deleteProjectPaymentAction } from "@/app/admin/projects/payment-actions";
import AdminProjectPaymentFormDialog from "@/components/admin/project-detail/AdminProjectPaymentsTab/AdminProjectPaymentFormDialog";
import AdminProjectPaymentHistory from "@/components/admin/project-detail/AdminProjectPaymentsTab/AdminProjectPaymentHistory";
import AdminProjectPaymentSummary from "@/components/admin/project-detail/AdminProjectPaymentsTab/AdminProjectPaymentSummary";
import Button from "@/components/ui/Button/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import type { AdminProjectDetailWithThumbnails } from "@/lib/projects/getAdminProjects";
import type { AdminProjectPaymentView } from "@/types/project-payment";
import styles from "./AdminProjectPaymentsTab.module.scss";

type AdminProjectPaymentsTabProps = {
  project: AdminProjectDetailWithThumbnails;
};

export default function AdminProjectPaymentsTab({
  project,
}: AdminProjectPaymentsTabProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<
    AdminProjectPaymentView | undefined
  >();
  const [deletingPayment, setDeletingPayment] = useState<
    AdminProjectPaymentView | undefined
  >();
  const [deleteError, setDeleteError] = useState<string | undefined>();
  const [isDeleting, startDeleteTransition] = useTransition();

  const payments = project.payments ?? [];
  const paymentSummary = project.paymentSummary ?? {
    totalPaidAgorot: 0,
    totalPaidFormatted: "₪0",
    isOverpaid: false,
    isProjectTotalKnown: false,
  };

  const openCreateForm = () => {
    setEditingPayment(undefined);
    setFormOpen(true);
  };

  const openEditForm = (payment: AdminProjectPaymentView) => {
    setEditingPayment(payment);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingPayment(undefined);
  };

  const handleConfirmDelete = () => {
    if (!deletingPayment) {
      return;
    }

    setDeleteError(undefined);

    startDeleteTransition(async () => {
      const result = await deleteProjectPaymentAction(
        project.id,
        deletingPayment.id,
      );

      if (result.error) {
        setDeleteError(result.error);
        return;
      }

      setDeletingPayment(undefined);
    });
  };

  return (
    <div className={styles.tab}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h2 className={styles.title}>תשלומים</h2>
          <p className={styles.subtitle}>רישום תשלומים ידני מול סכום הפרויקט כולל מע״מ</p>
        </div>
        <Button onClick={openCreateForm}>+ הוספת תשלום</Button>
      </header>

      <AdminProjectPaymentSummary summary={paymentSummary} />

      <AdminProjectPaymentHistory
        payments={payments}
        onEdit={openEditForm}
        onDelete={setDeletingPayment}
      />

      <AdminProjectPaymentFormDialog
        projectId={project.id}
        open={formOpen}
        payment={editingPayment}
        onClose={closeForm}
      />

      <ConfirmDialog
        open={Boolean(deletingPayment)}
        title="מחיקת תשלום"
        description={
          deleteError ??
          `האם למחוק תשלום בסך ${deletingPayment?.amountFormatted ?? ""}?`
        }
        confirmLabel="מחיקה"
        tone="danger"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeletingPayment(undefined);
          setDeleteError(undefined);
        }}
      />
    </div>
  );
}
