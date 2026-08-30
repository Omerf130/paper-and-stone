"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createSupplierAction,
  updateSupplierAction,
} from "@/app/admin/suppliers/actions";
import Button from "@/components/ui/Button/Button";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import type {
  AdminSupplierFormInput,
  SupplierFormState,
} from "@/types/admin-supplier";
import styles from "../ProductForm/form-section.module.scss";

type SupplierFormProps = {
  mode: "create" | "edit";
  initialSupplier: AdminSupplierFormInput;
  supplierId?: string;
};

const initialState: SupplierFormState = {};

export default function SupplierForm({
  mode,
  initialSupplier,
  supplierId,
}: SupplierFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [formState, setFormState] = useState(initialState);
  const [supplier, setSupplier] = useState(initialSupplier);
  const [isPending, startTransition] = useTransition();

  const updateField = <K extends keyof AdminSupplierFormInput>(
    key: K,
    value: AdminSupplierFormInput[K],
  ) => {
    setSupplier((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = () => {
    setFormState(initialState);

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createSupplierAction(supplier)
          : await updateSupplierAction(supplierId ?? "", supplier);

      setFormState(result);

      if (result.fieldErrors) {
        return;
      }

      if (result.error) {
        toast({ type: "error", message: result.error });
        return;
      }

      toast({ type: "success", message: "הספק נשמר" });
      router.refresh();
    });
  };

  const fieldErrors = formState.fieldErrors ?? {};

  return (
    <div className={styles.stack}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>פרטי ספק</h2>

        <div className={styles.fieldGrid}>
          <FormField
            label="שם ספק"
            htmlFor="supplier-name"
            error={fieldErrors.name}
          >
            <input
              id="supplier-name"
              className={formFieldStyles.input}
              value={supplier.name}
              onChange={(event) => updateField("name", event.target.value)}
            />
          </FormField>

          <FormField label="קוד (אופציונלי)" htmlFor="supplier-code">
            <input
              id="supplier-code"
              className={formFieldStyles.input}
              dir="ltr"
              value={supplier.code}
              onChange={(event) => updateField("code", event.target.value)}
            />
          </FormField>
        </div>

        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={supplier.isActive}
            onChange={(event) => updateField("isActive", event.target.checked)}
          />
          ספק פעיל
        </label>
      </section>

      <div className={styles.actions}>
        <Button onClick={handleSubmit} loading={isPending} loadingLabel="שמירה...">
          שמירה
        </Button>
        <Button href="/admin/suppliers" variant="ghost">
          ביטול
        </Button>
      </div>
    </div>
  );
}
