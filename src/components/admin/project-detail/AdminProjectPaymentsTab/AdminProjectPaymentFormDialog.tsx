"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  createProjectPaymentAction,
  updateProjectPaymentAction,
} from "@/app/admin/projects/payment-actions";
import Button from "@/components/ui/Button/Button";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import dialogStyles from "@/components/professional/projects/project-room-dialog.module.scss";
import {
  PROJECT_PAYMENT_METHODS,
  PROJECT_PAYMENT_METHOD_LABELS,
  type AdminProjectPaymentView,
  type ProjectPaymentMethod,
} from "@/types/project-payment";

type AdminProjectPaymentFormDialogProps = {
  projectId: string;
  open: boolean;
  payment?: AdminProjectPaymentView;
  onClose: () => void;
};

function toDateInputValue(isoDate?: string): string {
  if (!isoDate) {
    return new Date().toISOString().slice(0, 10);
  }

  return isoDate.slice(0, 10);
}

function agorotToShekelsInput(amountAgorot: number): string {
  return (amountAgorot / 100).toFixed(2).replace(/\.?0+$/, "");
}

export default function AdminProjectPaymentFormDialog({
  projectId,
  open,
  payment,
  onClose,
}: AdminProjectPaymentFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isEditing = Boolean(payment);
  const [amountShekels, setAmountShekels] = useState("");
  const [paymentDate, setPaymentDate] = useState(toDateInputValue());
  const [paymentMethod, setPaymentMethod] = useState<ProjectPaymentMethod>("bank_transfer");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
      setAmountShekels(payment ? agorotToShekelsInput(payment.amountAgorot) : "");
      setPaymentDate(toDateInputValue(payment?.paymentDate));
      setPaymentMethod(payment?.paymentMethod ?? "bank_transfer");
      setNote(payment?.note ?? "");
      setError(undefined);
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, payment]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  const handleSubmit = () => {
    setError(undefined);

    startTransition(async () => {
      const payload = {
        projectId,
        amountShekels,
        paymentDate,
        paymentMethod,
        note,
      };

      const result = isEditing && payment
        ? await updateProjectPaymentAction({ ...payload, paymentId: payment.id })
        : await createProjectPaymentAction(payload);

      if (result.error) {
        setError(result.error);
        return;
      }

      onClose();
    });
  };

  return (
    <dialog
      ref={dialogRef}
      className={dialogStyles.dialog}
      aria-labelledby="admin-payment-form-title"
    >
      <div className={dialogStyles.panel}>
        <header className={dialogStyles.header}>
          <h2 id="admin-payment-form-title" className={dialogStyles.title}>
            {isEditing ? "עריכת תשלום" : "הוספת תשלום"}
          </h2>
          <button
            type="button"
            className={dialogStyles.closeButton}
            aria-label="סגירה"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <FormField
          label="סכום (₪)"
          htmlFor="admin-payment-amount"
          required
          error={error}
        >
          <input
            id="admin-payment-amount"
            type="text"
            inputMode="decimal"
            className={formFieldStyles.input}
            value={amountShekels}
            onChange={(event) => setAmountShekels(event.target.value)}
            disabled={isPending}
            aria-invalid={error ? true : undefined}
          />
        </FormField>

        <FormField label="תאריך תשלום" htmlFor="admin-payment-date" required>
          <input
            id="admin-payment-date"
            type="date"
            className={formFieldStyles.input}
            value={paymentDate}
            onChange={(event) => setPaymentDate(event.target.value)}
            disabled={isPending}
          />
        </FormField>

        <FormField label="אמצעי תשלום" htmlFor="admin-payment-method" required>
          <select
            id="admin-payment-method"
            className={formFieldStyles.input}
            value={paymentMethod}
            onChange={(event) =>
              setPaymentMethod(event.target.value as ProjectPaymentMethod)
            }
            disabled={isPending}
          >
            {PROJECT_PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {PROJECT_PAYMENT_METHOD_LABELS[method]}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="הערה" htmlFor="admin-payment-note">
          <textarea
            id="admin-payment-note"
            className={formFieldStyles.input}
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            disabled={isPending}
          />
        </FormField>

        <div className={dialogStyles.actions}>
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            ביטול
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isPending}
            loadingLabel={isEditing ? "שומר..." : "מוסיף..."}
          >
            {isEditing ? "שמירה" : "הוספת תשלום"}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
