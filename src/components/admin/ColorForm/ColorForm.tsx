"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createColorAction,
  updateColorAction,
} from "@/app/admin/colors/actions";
import Button from "@/components/ui/Button/Button";
import FormField, { formFieldStyles } from "@/components/ui/FormField/FormField";
import { useToast } from "@/components/ui/Toast/ToastProvider";
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
};

const initialState: ColorFormState = {};

export default function ColorForm({
  mode,
  initialColor,
  colorId,
}: ColorFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [formState, setFormState] = useState(initialState);
  const [color, setColor] = useState(initialColor);
  const [isPending, startTransition] = useTransition();

  const updateField = <K extends keyof AdminColorFormInput>(
    key: K,
    value: AdminColorFormInput[K],
  ) => {
    setColor((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = () => {
    setFormState(initialState);

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createColorAction(color)
          : await updateColorAction(colorId ?? "", color);

      setFormState(result);

      if (result.fieldErrors) {
        return;
      }

      if (result.error) {
        toast({ type: "error", message: result.error });
        return;
      }

      toast({ type: "success", message: "הצבע נשמר" });
      router.refresh();
    });
  };

  const fieldErrors = formState.fieldErrors ?? {};

  return (
    <div className={styles.stack}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>פרטי צבע</h2>

        <div className={styles.fieldGrid}>
          <FormField
            label="שם בעברית"
            htmlFor="color-nameHe"
            error={fieldErrors.nameHe}
            errorId="color-nameHe-error"
          >
            <input
              id="color-nameHe"
              className={formFieldStyles.input}
              value={color.nameHe}
              onChange={(event) => updateField("nameHe", event.target.value)}
              aria-invalid={Boolean(fieldErrors.nameHe)}
              aria-describedby={
                fieldErrors.nameHe ? "color-nameHe-error" : undefined
              }
            />
          </FormField>

          <FormField
            label="שם באנגלית"
            htmlFor="color-nameEn"
            error={fieldErrors.nameEn}
            errorId="color-nameEn-error"
          >
            <input
              id="color-nameEn"
              className={formFieldStyles.input}
              value={color.nameEn}
              onChange={(event) => updateField("nameEn", event.target.value)}
              aria-invalid={Boolean(fieldErrors.nameEn)}
              aria-describedby={
                fieldErrors.nameEn ? "color-nameEn-error" : undefined
              }
            />
          </FormField>

          <FormField
            label="קוד (אופציונלי)"
            htmlFor="color-code"
            error={fieldErrors.code}
            errorId="color-code-error"
          >
            <input
              id="color-code"
              className={formFieldStyles.input}
              dir="ltr"
              value={color.code}
              onChange={(event) => updateField("code", event.target.value)}
              aria-invalid={Boolean(fieldErrors.code)}
              aria-describedby={fieldErrors.code ? "color-code-error" : undefined}
            />
          </FormField>

          <FormField
            label="HEX"
            htmlFor="color-hex"
            error={fieldErrors.hex}
            errorId="color-hex-error"
          >
            <div className={styles.inlineRow}>
              <input
                id="color-hex"
                className={formFieldStyles.input}
                dir="ltr"
                value={color.hex}
                onChange={(event) => updateField("hex", event.target.value)}
                aria-invalid={Boolean(fieldErrors.hex)}
                aria-describedby={fieldErrors.hex ? "color-hex-error" : undefined}
              />
              <HexPreview hex={color.hex} />
            </div>
          </FormField>

          <FormField
            label="סדר מיון"
            htmlFor="color-sortOrder"
            error={fieldErrors.sortOrder}
            errorId="color-sortOrder-error"
          >
            <input
              id="color-sortOrder"
              type="number"
              min={0}
              className={formFieldStyles.input}
              value={color.sortOrder}
              onChange={(event) => updateField("sortOrder", event.target.value)}
              aria-invalid={Boolean(fieldErrors.sortOrder)}
              aria-describedby={
                fieldErrors.sortOrder ? "color-sortOrder-error" : undefined
              }
            />
          </FormField>
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
        <Button onClick={handleSubmit} loading={isPending} loadingLabel="שמירה...">
          שמירה
        </Button>
        <Button href="/admin/colors" variant="ghost">
          ביטול
        </Button>
      </div>
    </div>
  );
}
