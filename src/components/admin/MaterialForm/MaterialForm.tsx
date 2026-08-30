"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  createMaterialAction,
  updateMaterialAction,
} from "@/app/admin/materials/actions";
import { createMaterialTypeAction } from "@/app/admin/materials/material-type-actions";
import Button from "@/components/ui/Button/Button";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import type {
  AdminMaterialFormInput,
  AdminMaterialProductLink,
  MaterialFormState,
  MaterialTypeOption,
} from "@/types/admin-material";
import { slugifyMaterialTypeKey } from "@/lib/materials/material-type-validation";
import MaterialProductLinksEditor from "./MaterialProductLinksEditor";
import MaterialVariantsEditor from "./MaterialVariantsEditor";
import styles from "../ProductForm/form-section.module.scss";

type MaterialFormProps = {
  mode: "create" | "edit";
  initialMaterial: AdminMaterialFormInput;
  materialTypeOptions: MaterialTypeOption[];
  materialId?: string;
  initialProductLinks?: AdminMaterialProductLink[];
};

const initialState: MaterialFormState = {};

export default function MaterialForm({
  mode,
  initialMaterial,
  materialTypeOptions,
  materialId,
  initialProductLinks = [],
}: MaterialFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [formState, setFormState] = useState(initialState);
  const [material, setMaterial] = useState(initialMaterial);
  const [typeOptions, setTypeOptions] = useState(materialTypeOptions);
  const [isPending, startTransition] = useTransition();
  const [showAddType, setShowAddType] = useState(false);
  const [newTypeLabel, setNewTypeLabel] = useState("");
  const [newTypeKey, setNewTypeKey] = useState("");

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

  const handleAddType = () => {
    startTransition(async () => {
      const result = await createMaterialTypeAction({
        key: newTypeKey || slugifyMaterialTypeKey(newTypeLabel),
        labelEn: newTypeLabel,
      });

      if (result.fieldErrors || result.error) {
        toast({
          type: "error",
          message: result.error ?? "לא ניתן להוסיף סוג חומר",
        });
        return;
      }

      if (result.createdKey) {
        setTypeOptions((current) => [
          ...current,
          { key: result.createdKey!, labelEn: newTypeLabel.trim() },
        ]);
        updateField("type", result.createdKey);
        setShowAddType(false);
        setNewTypeLabel("");
        setNewTypeKey("");
        toast({ type: "success", message: "סוג החומר נוסף" });
      }
    });
  };

  const fieldErrors = formState.fieldErrors ?? {};

  const sortedTypeOptions = useMemo(
    () => [...typeOptions].sort((a, b) => a.labelEn.localeCompare(b.labelEn)),
    [typeOptions],
  );

  return (
    <div className={styles.stack}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>פרטי חומר</h2>

        <div className={styles.fieldGrid}>
          <FormField
            label="שם (English)"
            htmlFor="material-nameEn"
            error={fieldErrors.nameEn}
            errorId="material-nameEn-error"
          >
            <input
              id="material-nameEn"
              className={formFieldStyles.input}
              dir="ltr"
              value={material.nameEn}
              onChange={(event) => updateField("nameEn", event.target.value)}
              aria-invalid={Boolean(fieldErrors.nameEn)}
            />
          </FormField>

          <FormField
            label="קוד (אופציונלי)"
            htmlFor="material-code"
            error={fieldErrors.code}
          >
            <input
              id="material-code"
              className={formFieldStyles.input}
              dir="ltr"
              value={material.code}
              onChange={(event) => updateField("code", event.target.value)}
            />
          </FormField>

          <FormField
            label="סוג חומר"
            htmlFor="material-type"
            error={fieldErrors.type}
          >
            <select
              id="material-type"
              className={formFieldStyles.input}
              value={material.type}
              onChange={(event) => updateField("type", event.target.value)}
            >
              {sortedTypeOptions.map((type) => (
                <option key={type.key} value={type.key}>
                  {type.labelEn}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className={styles.inlineActionRow}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowAddType((current) => !current)}
          >
            {showAddType ? "ביטול" : "הוספת סוג"}
          </Button>
        </div>

        {showAddType ? (
          <div className={styles.fieldGrid}>
            <FormField label="שם סוג (English)" htmlFor="new-type-label">
              <input
                id="new-type-label"
                className={formFieldStyles.input}
                dir="ltr"
                value={newTypeLabel}
                onChange={(event) => {
                  setNewTypeLabel(event.target.value);
                  setNewTypeKey(slugifyMaterialTypeKey(event.target.value));
                }}
              />
            </FormField>
            <FormField label="Key" htmlFor="new-type-key">
              <input
                id="new-type-key"
                className={formFieldStyles.input}
                dir="ltr"
                value={newTypeKey}
                onChange={(event) =>
                  setNewTypeKey(event.target.value.toUpperCase())
                }
              />
            </FormField>
            <div className={styles.actions}>
              <Button type="button" size="sm" onClick={handleAddType}>
                שמירת סוג
              </Button>
            </div>
          </div>
        ) : null}

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
        <MaterialVariantsEditor
          variants={material.variants}
          onChange={(variants) => updateField("variants", variants)}
          fieldErrors={fieldErrors}
        />
      </section>

      {mode === "edit" && materialId ? (
        <section className={styles.section}>
          <MaterialProductLinksEditor
            materialId={materialId}
            variants={material.variants}
            initialLinks={initialProductLinks}
          />
        </section>
      ) : null}

      <div className={styles.actions}>
        <Button onClick={handleSubmit} loading={isPending} loadingLabel="שמירה...">
          שמירה
        </Button>
        <Button href="/admin/materials" variant="ghost">
          ביטול
        </Button>
        {mode === "edit" ? (
          <Link href="/admin/products" className={styles.helperText}>
            ניהול מוצרים
          </Link>
        ) : null}
      </div>
    </div>
  );
}
