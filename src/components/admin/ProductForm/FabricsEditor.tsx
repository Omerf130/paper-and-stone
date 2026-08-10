"use client";

import {
  createColorKey,
  createFabricKey,
} from "@/lib/products/config-keys";
import type {
  ProductColorInput,
  ProductFabricInput,
} from "@/types/admin-product";
import { VISUAL_TONES } from "@/types/admin-product";
import styles from "./form-section.module.scss";

type FabricsEditorProps = {
  fabrics: ProductFabricInput[];
  onChange: (fabrics: ProductFabricInput[]) => void;
  fieldErrors: Record<string, string>;
};

export default function FabricsEditor({
  fabrics,
  onChange,
  fieldErrors,
}: FabricsEditorProps) {
  const addFabric = () => {
    const existingKeys = fabrics.map((fabric) => fabric.key);
    onChange([
      ...fabrics,
      {
        key: createFabricKey("בד חדש", existingKeys),
        label: "",
        colors: [],
      },
    ]);
  };

  const updateFabricLabel = (index: number, label: string) => {
    onChange(
      fabrics.map((fabric, fabricIndex) =>
        fabricIndex === index ? { ...fabric, label } : fabric,
      ),
    );
  };

  const removeFabric = (index: number) => {
    onChange(fabrics.filter((_, fabricIndex) => fabricIndex !== index));
  };

  const addColor = (fabricIndex: number) => {
    const fabric = fabrics[fabricIndex];
    const existingKeys = fabric.colors.map((color) => color.key);

    onChange(
      fabrics.map((currentFabric, currentIndex) =>
        currentIndex === fabricIndex
          ? {
              ...currentFabric,
              colors: [
                ...currentFabric.colors,
                {
                  key: createColorKey("צבע חדש", existingKeys),
                  label: "",
                  visualTone: "gray",
                },
              ],
            }
          : currentFabric,
      ),
    );
  };

  const updateColor = (
    fabricIndex: number,
    colorIndex: number,
    updates: Partial<ProductColorInput>,
  ) => {
    onChange(
      fabrics.map((fabric, currentFabricIndex) => {
        if (currentFabricIndex !== fabricIndex) {
          return fabric;
        }

        return {
          ...fabric,
          colors: fabric.colors.map((color, currentColorIndex) =>
            currentColorIndex === colorIndex
              ? { ...color, ...updates }
              : color,
          ),
        };
      }),
    );
  };

  const removeColor = (fabricIndex: number, colorIndex: number) => {
    onChange(
      fabrics.map((fabric, currentFabricIndex) =>
        currentFabricIndex === fabricIndex
          ? {
              ...fabric,
              colors: fabric.colors.filter(
                (_, currentColorIndex) => currentColorIndex !== colorIndex,
              ),
            }
          : fabric,
      ),
    );
  };

  return (
    <div className={styles.stack}>
      {fabrics.map((fabric, fabricIndex) => (
        <div key={fabric.key} className={styles.nestedCard}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label
                className={styles.label}
                htmlFor={`fabric-label-${fabric.key}`}
              >
                שם בד
              </label>
              <input
                id={`fabric-label-${fabric.key}`}
                className={styles.input}
                value={fabric.label}
                onChange={(event) =>
                  updateFabricLabel(fabricIndex, event.target.value)
                }
              />
              {fieldErrors[`fabrics.${fabricIndex}.label`] && (
                <p className={styles.fieldError}>
                  {fieldErrors[`fabrics.${fabricIndex}.label`]}
                </p>
              )}
            </div>
            <button
              type="button"
              className={styles.removeButton}
              onClick={() => removeFabric(fabricIndex)}
            >
              הסרת בד
            </button>
          </div>

          <div className={styles.subsection}>
            <p className={styles.subheading}>צבעים</p>
            {fabric.colors.map((color, colorIndex) => (
              <div key={color.key} className={styles.inlineRow}>
                <div className={styles.field}>
                  <label
                    className={styles.label}
                    htmlFor={`color-label-${color.key}`}
                  >
                    שם צבע
                  </label>
                  <input
                    id={`color-label-${color.key}`}
                    className={styles.input}
                    value={color.label}
                    onChange={(event) =>
                      updateColor(fabricIndex, colorIndex, {
                        label: event.target.value,
                      })
                    }
                  />
                </div>
                <div className={styles.field}>
                  <label
                    className={styles.label}
                    htmlFor={`color-tone-${color.key}`}
                  >
                    גוון תצוגה
                  </label>
                  <select
                    id={`color-tone-${color.key}`}
                    className={styles.select}
                    value={color.visualTone}
                    onChange={(event) =>
                      updateColor(fabricIndex, colorIndex, {
                        visualTone: event.target.value as ProductColorInput["visualTone"],
                      })
                    }
                  >
                    {VISUAL_TONES.map((tone) => (
                      <option key={tone} value={tone}>
                        {tone}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => removeColor(fabricIndex, colorIndex)}
                >
                  הסרת צבע
                </button>
              </div>
            ))}
            <button
              type="button"
              className={styles.addButton}
              onClick={() => addColor(fabricIndex)}
            >
              הוספת צבע
            </button>
          </div>
        </div>
      ))}

      <button type="button" className={styles.addButton} onClick={addFabric}>
        הוספת בד
      </button>
    </div>
  );
}
