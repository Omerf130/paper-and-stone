"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  createMaterialAction,
  updateMaterialAction,
} from "@/app/admin/materials/actions";
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
  showSavedBanner?: boolean;
};

const initialState: MaterialFormState = {};

export default function MaterialForm({
  mode,
  initialMaterial,
  activeColors,
  linkedColorDetails,
  materialId,
  showSavedBanner = false,
}: MaterialFormProps) {
  const router = useRouter();
  const [formState, setFormState] = useState(initialState);
  const [material, setMaterial] = useState(initialMaterial);
  const [isPending, startTransition] = useTransition();
  const [savedBanner, setSavedBanner] = useState(showSavedBanner);

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
    setSavedBanner(false);
    setFormState(initialState);

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createMaterialAction(material)
          : await updateMaterialAction(materialId ?? "", material);

      setFormState(result);

      if (result.success) {
        setSavedBanner(true);
        router.refresh();
      }
    });
  };

  const fieldErrors = formState.fieldErrors ?? {};

  return (
    <div className={styles.stack}>
      {(savedBanner || showSavedBanner) && (
        <p className={styles.formSuccess} role="status">
          החומר נשמר בהצלחה.
        </p>
      )}

      {formState.error && (
        <p className={styles.formError} role="alert">
          {formState.error}
        </p>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>פרטי חומר</h2>

        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="material-nameHe">
              שם בעברית
            </label>
            <input
              id="material-nameHe"
              className={styles.input}
              value={material.nameHe}
              onChange={(event) => updateField("nameHe", event.target.value)}
            />
            {fieldErrors.nameHe && (
              <p className={styles.fieldError}>{fieldErrors.nameHe}</p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="material-nameEn">
              שם באנגלית
            </label>
            <input
              id="material-nameEn"
              className={styles.input}
              value={material.nameEn}
              onChange={(event) => updateField("nameEn", event.target.value)}
            />
            {fieldErrors.nameEn && (
              <p className={styles.fieldError}>{fieldErrors.nameEn}</p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="material-code">
              קוד (אופציונלי)
            </label>
            <input
              id="material-code"
              className={styles.input}
              dir="ltr"
              value={material.code}
              onChange={(event) => updateField("code", event.target.value)}
            />
            {fieldErrors.code && (
              <p className={styles.fieldError}>{fieldErrors.code}</p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="material-type">
              סוג חומר
            </label>
            <select
              id="material-type"
              className={styles.select}
              value={material.type}
              onChange={(event) =>
                updateField(
                  "type",
                  event.target.value as AdminMaterialFormInput["type"],
                )
              }
            >
              {MATERIAL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {MATERIAL_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
            {fieldErrors.type && (
              <p className={styles.fieldError}>{fieldErrors.type}</p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="material-sortOrder">
              סדר מיון
            </label>
            <input
              id="material-sortOrder"
              type="number"
              min={0}
              className={styles.input}
              value={material.sortOrder}
              onChange={(event) =>
                updateField("sortOrder", event.target.value)
              }
            />
            {fieldErrors.sortOrder && (
              <p className={styles.fieldError}>{fieldErrors.sortOrder}</p>
            )}
          </div>
        </div>

        <div className={styles.checkboxRow}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={material.isActive}
              onChange={(event) =>
                updateField("isActive", event.target.checked)
              }
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
        <button
          type="button"
          className={styles.submitButton}
          disabled={isPending}
          onClick={handleSubmit}
        >
          {isPending ? "שומר..." : "שמירה"}
        </button>
        <Link href="/admin/materials" className={styles.cancelLink}>
          ביטול
        </Link>
      </div>
    </div>
  );
}
