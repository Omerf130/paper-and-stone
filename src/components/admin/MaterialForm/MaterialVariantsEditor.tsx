"use client";

import Button from "@/components/ui/Button/Button";
import HexPreview from "@/components/admin/ColorForm/HexPreview";
import type { MaterialVariantInput } from "@/types/material-variant";
import styles from "./MaterialVariantsEditor.module.scss";

type MaterialVariantsEditorProps = {
  variants: MaterialVariantInput[];
  onChange: (variants: MaterialVariantInput[]) => void;
  fieldErrors: Record<string, string>;
};

function createEmptyVariant(): MaterialVariantInput {
  return {
    name: "",
    hex: "",
    isActive: true,
  };
}

export default function MaterialVariantsEditor({
  variants,
  onChange,
  fieldErrors,
}: MaterialVariantsEditorProps) {
  const updateVariant = (
    index: number,
    patch: Partial<MaterialVariantInput>,
  ) => {
    onChange(
      variants.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, ...patch } : variant,
      ),
    );
  };

  const removeVariant = (index: number) => {
    onChange(variants.filter((_, variantIndex) => variantIndex !== index));
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>גרסאות צבע / ויזואל</h2>
          <p className={styles.helperText}>
            שם באנגלית + HEX או swatch (swatch ניתן להוסיף לאחר שמירה).
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onChange([...variants, createEmptyVariant()])}
        >
          הוספת variant
        </Button>
      </div>

      {variants.length === 0 ? (
        <p className={styles.helperText}>טרם הוגדרו variants לחומר זה.</p>
      ) : (
        <ul className={styles.list}>
          {variants.map((variant, index) => (
            <li key={variant.id ?? `new-${index}`} className={styles.variantRow}>
              <p className={styles.variantIndex}>Variant {index + 1}</p>

              <div className={styles.fieldCompact}>
                <label className={styles.fieldLabel} htmlFor={`variant-name-${index}`}>
                  שם (English)
                </label>
                <input
                  id={`variant-name-${index}`}
                  className={styles.input}
                  dir="ltr"
                  value={variant.name}
                  onChange={(event) =>
                    updateVariant(index, { name: event.target.value })
                  }
                  aria-invalid={Boolean(fieldErrors[`variants.${index}.name`])}
                />
                {fieldErrors[`variants.${index}.name`] ? (
                  <span className={styles.helperText}>
                    {fieldErrors[`variants.${index}.name`]}
                  </span>
                ) : null}
              </div>

              <div className={styles.fieldCompact}>
                <label className={styles.fieldLabel} htmlFor={`variant-hex-${index}`}>
                  HEX
                </label>
                <div className={styles.hexRow}>
                  <input
                    id={`variant-hex-${index}`}
                    className={styles.input}
                    dir="ltr"
                    value={variant.hex ?? ""}
                    onChange={(event) =>
                      updateVariant(index, { hex: event.target.value })
                    }
                    aria-invalid={Boolean(fieldErrors[`variants.${index}.hex`])}
                  />
                  {variant.hex ? <HexPreview hex={variant.hex} size="sm" /> : null}
                </div>
                {fieldErrors[`variants.${index}.hex`] ? (
                  <span className={styles.helperText}>
                    {fieldErrors[`variants.${index}.hex`]}
                  </span>
                ) : null}
              </div>

              <label className={styles.activeToggle}>
                <input
                  type="checkbox"
                  checked={variant.isActive}
                  onChange={(event) =>
                    updateVariant(index, { isActive: event.target.checked })
                  }
                />
                פעיל
              </label>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeVariant(index)}
              >
                הסרה
              </Button>

              {variant.swatchImage?.url ? (
                <p className={styles.swatchNote} title={variant.swatchImage.url}>
                  Swatch: {variant.swatchImage.url}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
