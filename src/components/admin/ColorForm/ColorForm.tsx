"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createColorAction,
  updateColorAction,
} from "@/app/admin/colors/actions";
import type {
  AdminColorFormInput,
  ColorFormState,
} from "@/types/admin-color";
import HexPreview from "./HexPreview";
import styles from "../ProductForm/form-section.module.scss";

type ColorFormProps = {
  mode: "create" | "edit";
  initialColor: AdminColorFormInput;
  colorId?: string;
  showSavedBanner?: boolean;
};

const initialState: ColorFormState = {};

export default function ColorForm({
  mode,
  initialColor,
  colorId,
  showSavedBanner = false,
}: ColorFormProps) {
  const router = useRouter();
  const [formState, setFormState] = useState(initialState);
  const [color, setColor] = useState(initialColor);
  const [isPending, startTransition] = useTransition();
  const [savedBanner, setSavedBanner] = useState(showSavedBanner);

  const updateField = <K extends keyof AdminColorFormInput>(
    key: K,
    value: AdminColorFormInput[K],
  ) => {
    setColor((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = () => {
    setSavedBanner(false);
    setFormState(initialState);

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createColorAction(color)
          : await updateColorAction(colorId ?? "", color);

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
          הצבע נשמר בהצלחה.
        </p>
      )}

      {formState.error && (
        <p className={styles.formError} role="alert">
          {formState.error}
        </p>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>פרטי צבע</h2>

        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="nameHe">
              שם בעברית
            </label>
            <input
              id="nameHe"
              className={styles.input}
              value={color.nameHe}
              onChange={(event) => updateField("nameHe", event.target.value)}
            />
            {fieldErrors.nameHe && (
              <p className={styles.fieldError}>{fieldErrors.nameHe}</p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="nameEn">
              שם באנגלית
            </label>
            <input
              id="nameEn"
              className={styles.input}
              value={color.nameEn}
              onChange={(event) => updateField("nameEn", event.target.value)}
            />
            {fieldErrors.nameEn && (
              <p className={styles.fieldError}>{fieldErrors.nameEn}</p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="code">
              קוד (אופציונלי)
            </label>
            <input
              id="code"
              className={styles.input}
              dir="ltr"
              value={color.code}
              onChange={(event) => updateField("code", event.target.value)}
            />
            {fieldErrors.code && (
              <p className={styles.fieldError}>{fieldErrors.code}</p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="hex">
              HEX
            </label>
            <div className={styles.inlineRow}>
              <input
                id="hex"
                className={styles.input}
                dir="ltr"
                value={color.hex}
                onChange={(event) => updateField("hex", event.target.value)}
              />
              <HexPreview hex={color.hex} />
            </div>
            {fieldErrors.hex && (
              <p className={styles.fieldError}>{fieldErrors.hex}</p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="sortOrder">
              סדר מיון
            </label>
            <input
              id="sortOrder"
              type="number"
              min={0}
              className={styles.input}
              value={color.sortOrder}
              onChange={(event) => updateField("sortOrder", event.target.value)}
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
              checked={color.isActive}
              onChange={(event) => updateField("isActive", event.target.checked)}
            />
            צבע פעיל
          </label>
        </div>
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
        <Link href="/admin/colors" className={styles.cancelLink}>
          ביטול
        </Link>
      </div>
    </div>
  );
}
