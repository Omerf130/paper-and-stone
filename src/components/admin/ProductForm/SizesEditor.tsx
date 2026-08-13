"use client";

import { createSizeKey } from "@/lib/products/config-keys";
import Button from "@/components/ui/Button/Button";
import type { ProductSizeInput } from "@/types/admin-product";
import styles from "./form-section.module.scss";

type SizesEditorProps = {
  sizes: ProductSizeInput[];
  onChange: (sizes: ProductSizeInput[]) => void;
  fieldErrors: Record<string, string>;
};

export default function SizesEditor({
  sizes,
  onChange,
  fieldErrors,
}: SizesEditorProps) {
  const addSize = () => {
    const existingKeys = sizes.map((size) => size.key);
    onChange([
      ...sizes,
      {
        key: createSizeKey("מידה חדשה", existingKeys),
        label: "",
      },
    ]);
  };

  const updateSizeLabel = (index: number, label: string) => {
    onChange(
      sizes.map((size, sizeIndex) =>
        sizeIndex === index ? { ...size, label } : size,
      ),
    );
  };

  const removeSize = (index: number) => {
    onChange(sizes.filter((_, sizeIndex) => sizeIndex !== index));
  };

  return (
    <div className={styles.stack}>
      <p className={styles.subheading}>מידות לבחירה בקונפיגורטור</p>
      {sizes.map((size, index) => (
        <div key={size.key} className={styles.inlineRow}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={`size-label-${size.key}`}>
              תווית מידה
            </label>
            <input
              id={`size-label-${size.key}`}
              className={styles.input}
              value={size.label}
              onChange={(event) => updateSizeLabel(index, event.target.value)}
            />
            {fieldErrors[`sizes.${index}.label`] && (
              <p className={styles.fieldError}>
                {fieldErrors[`sizes.${index}.label`]}
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeSize(index)}
          >
            הסרת מידה
          </Button>
        </div>
      ))}

      <Button type="button" variant="secondary" size="sm" onClick={addSize}>
        הוספת מידה
      </Button>
    </div>
  );
}
