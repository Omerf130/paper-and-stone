"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  createMaterialAction,
  updateMaterialAction,
} from "@/app/admin/materials/actions";
import Button from "@/components/ui/Button/Button";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import type {
  AdminColorOption,
  AdminMaterialFormInput,
  MaterialFormState,
} from "@/types/admin-material";
import { MATERIAL_TYPE_LABELS, MATERIAL_TYPES } from "@/types/material";
import ColorAssignmentEditor from "./ColorAssignmentEditor";
import styles from "../ProductForm/form-section.module.scss";

type MaterialFormProps = {
  mode: "create" | "edit";
  initialMaterial: AdminMaterialFormInput;
  activeColors: AdminColorOption[];
  linkedColorDetails: AdminColorOption[];
  materialId?: string;
};

const initialState: MaterialFormState = {};

export default function MaterialForm({
  mode,
  initialMaterial,
  activeColors,
  linkedColorDetails,
  materialId,
}: MaterialFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [formState, setFormState] = useState(initialState);
  const [material, setMaterial] = useState(initialMaterial);
  const [isPending, startTransition] = useTransition();

  const linkedInactiveColors = useMemo(
    () =>
      linkedColorDetails.filter(
        (color) => !color.isActive && material.colorIds.includes(color.id),
      ),
    [linkedColorDetails, material.colorIds],
  );

  const updateField = <K extends keyof AdminMaterialFormInput>(
    key: K,
    value: AdminMaterialFormInput[K],
  ) => {
    setMaterial((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = () => {
    setFormState(initialState);

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createMaterialAction(material)
          : await updateMaterialAction(materialId ?? "", material);

      setFormState(result);

      if (result.fieldErrors) {
        return;
      }

      if (result.error) {
        toast({ type: "error", message: result.error });
        return;
      }

      toast({ type: "success", message: "החומר נשמר" });
      router.refresh();
    });
  };

  const fieldErrors = formState.fieldErrors ?? {};

  return (
    <div className={styles.stack}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>פרטי חומר</h2>

        <div className={styles.fieldGrid}>
          <FormField
            label="שם בעברית"
            htmlFor="material-nameHe"
            error={fieldErrors.nameHe}
            errorId="material-nameHe-error"
          >
            <input
              id="material-nameHe"
              className={formFieldStyles.input}
              value={material.nameHe}
              onChange={(event) => updateField("nameHe", event.target.value)}
              aria-invalid={Boolean(fieldErrors.nameHe)}
              aria-describedby={
                fieldErrors.nameHe ? "material-nameHe-error" : undefined
              }
            />
          </FormField>

          <FormField
            label="שם באנגלית"
            htmlFor="material-nameEn"
            error={fieldErrors.nameEn}
            errorId="material-nameEn-error"
          >
            <input
              id="material-nameEn"
              className={formFieldStyles.input}
              value={material.nameEn}
              onChange={(event) => updateField("nameEn", event.target.value)}
              aria-invalid={Boolean(fieldErrors.nameEn)}
              aria-describedby={
                fieldErrors.nameEn ? "material-nameEn-error" : undefined
              }
            />
          </FormField>

          <FormField
            label="קוד (אופציונלי)"
            htmlFor="material-code"
            error={fieldErrors.code}
            errorId="material-code-error"
          >
            <input
              id="material-code"
              className={formFieldStyles.input}
              dir="ltr"
              value={material.code}
              onChange={(event) => updateField("code", event.target.value)}
              aria-invalid={Boolean(fieldErrors.code)}
              aria-describedby={
                fieldErrors.code ? "material-code-error" : undefined
              }
            />
          </FormField>

          <FormField
            label="סוג חומר"
            htmlFor="material-type"
            error={fieldErrors.type}
            errorId="material-type-error"
          >
            <select
              id="material-type"
              className={formFieldStyles.input}
              value={material.type}
              onChange={(event) =>
                updateField(
                  "type",
                  event.target.value as AdminMaterialFormInput["type"],
                )
              }
              aria-invalid={Boolean(fieldErrors.type)}
              aria-describedby={
                fieldErrors.type ? "material-type-error" : undefined
              }
            >
              {MATERIAL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {MATERIAL_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="סדר מיון"
            htmlFor="material-sortOrder"
            error={fieldErrors.sortOrder}
            errorId="material-sortOrder-error"
          >
            <input
              id="material-sortOrder"
              type="number"
              min={0}
              className={formFieldStyles.input}
              value={material.sortOrder}
              onChange={(event) => updateField("sortOrder", event.target.value)}
              aria-invalid={Boolean(fieldErrors.sortOrder)}
              aria-describedby={
                fieldErrors.sortOrder ? "material-sortOrder-error" : undefined
              }
            />
          </FormField>
        </div>

        <div className={styles.checkboxRow}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={material.isActive}
              onChange={(event) => updateField("isActive", event.target.checked)}
            />
            חומר פעיל
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <ColorAssignmentEditor
          activeColors={activeColors}
          linkedInactiveColors={linkedInactiveColors}
          selectedColorIds={material.colorIds}
          onChange={(colorIds) => updateField("colorIds", colorIds)}
          fieldError={fieldErrors.colorIds}
        />
      </section>

      <div className={styles.actions}>
        <Button onClick={handleSubmit} loading={isPending} loadingLabel="שמירה...">
          שמירה
        </Button>
        <Button href="/admin/materials" variant="ghost">
          ביטול
        </Button>
      </div>
    </div>
  );
}
