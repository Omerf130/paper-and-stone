"use client";

import Link from "next/link";
import type { AdminMaterialWithColors } from "@/lib/products/material-options/getActiveMaterialsWithColors";
import type { ProductMaterialOptionInput } from "@/types/admin-product";
import HexPreview from "../ColorForm/HexPreview";
import styles from "./form-section.module.scss";

type MaterialOptionsEditorProps = {
  materialOptions: ProductMaterialOptionInput[];
  activeMaterials: AdminMaterialWithColors[];
  assignedMaterials: AdminMaterialWithColors[];
  onChange: (materialOptions: ProductMaterialOptionInput[]) => void;
  fieldErrors: Record<string, string>;
};

function findMaterialDetails(
  materialId: string,
  activeMaterials: AdminMaterialWithColors[],
  assignedMaterials: AdminMaterialWithColors[],
): AdminMaterialWithColors | undefined {
  return (
    assignedMaterials.find((material) => material.id === materialId) ??
    activeMaterials.find((material) => material.id === materialId)
  );
}

export default function MaterialOptionsEditor({
  materialOptions,
  activeMaterials,
  assignedMaterials,
  onChange,
  fieldErrors,
}: MaterialOptionsEditorProps) {
  const assignedMaterialIds = new Set(
    materialOptions.map((option) => option.materialId),
  );

  const availableMaterials = activeMaterials.filter(
    (material) => !assignedMaterialIds.has(material.id),
  );

  const addMaterial = (materialId: string) => {
    if (!materialId || assignedMaterialIds.has(materialId)) {
      return;
    }

    const material = activeMaterials.find((item) => item.id === materialId);
    if (!material) {
      return;
    }

    onChange([
      ...materialOptions,
      {
        materialId,
        allowedColorIds: material.colors[0] ? [material.colors[0].id] : [],
      },
    ]);
  };

  const removeMaterial = (materialId: string) => {
    onChange(
      materialOptions.filter((option) => option.materialId !== materialId),
    );
  };

  const updateColors = (materialId: string, allowedColorIds: string[]) => {
    onChange(
      materialOptions.map((option) =>
        option.materialId === materialId
          ? { ...option, allowedColorIds }
          : option,
      ),
    );
  };

  return (
    <div className={styles.stack}>
      <p style={{ margin: 0, fontSize: "0.875rem", color: "inherit" }}>
        בחרו חומרים וצבעים מהספרייה המרכזית.{" "}
        <Link href="/admin/materials">ניהול חומרים</Link>
        {" · "}
        <Link href="/admin/colors">ניהול צבעים</Link>
      </p>

      {fieldErrors.materialOptions ? (
        <p className={styles.fieldError}>{fieldErrors.materialOptions}</p>
      ) : null}

      {materialOptions.map((option, optionIndex) => {
        const material = findMaterialDetails(
          option.materialId,
          activeMaterials,
          assignedMaterials,
        );

        if (!material) {
          return null;
        }

        const inactiveLabel = material.isActive ? "" : " (לא פעיל)";

        return (
          <div key={option.materialId} className={styles.nestedCard}>
            <div className={styles.row}>
              <div className={styles.field}>
                <p className={styles.subheading}>
                  {material.nameHe}
                  {inactiveLabel}
                </p>
              </div>
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => removeMaterial(option.materialId)}
              >
                הסרת חומר
              </button>
            </div>

            <div className={styles.subsection}>
              <p className={styles.subheading}>צבעים זמינים למוצר</p>
              <ul className={styles.stack}>
                {material.colors
                  .filter(
                    (color) =>
                      color.isActive ||
                      option.allowedColorIds.includes(color.id),
                  )
                  .map((color) => {
                  const isSelected = option.allowedColorIds.includes(color.id);
                  const isInactive = !color.isActive;

                  return (
                    <li key={color.id}>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isInactive && isSelected}
                          onChange={(event) => {
                            if (event.target.checked) {
                              updateColors(option.materialId, [
                                ...option.allowedColorIds,
                                color.id,
                              ]);
                              return;
                            }

                            updateColors(
                              option.materialId,
                              option.allowedColorIds.filter(
                                (id) => id !== color.id,
                              ),
                            );
                          }}
                        />
                        <HexPreview hex={color.hex} size="sm" />
                        <span>
                          {color.nameHe}
                          {isInactive ? " (לא פעיל)" : ""}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              {fieldErrors[`materialOptions.${optionIndex}.allowedColorIds`] ? (
                <p className={styles.fieldError}>
                  {fieldErrors[`materialOptions.${optionIndex}.allowedColorIds`]}
                </p>
              ) : null}
            </div>
          </div>
        );
      })}

      {availableMaterials.length > 0 ? (
        <div className={styles.field}>
          <label className={styles.label} htmlFor="add-material">
            הוספת חומר
          </label>
          <select
            id="add-material"
            className={styles.select}
            defaultValue=""
            onChange={(event) => {
              addMaterial(event.target.value);
              event.target.value = "";
            }}
          >
            <option value="">בחרו חומר מהספרייה</option>
            {availableMaterials.map((material) => (
              <option key={material.id} value={material.id}>
                {material.nameHe}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <p style={{ margin: 0, fontSize: "0.875rem", color: "inherit" }}>
          {activeMaterials.length === 0 ? (
            <>
              אין חומרים פעילים בספרייה.{" "}
              <Link href="/admin/materials/new">יצירת חומר חדש</Link>
            </>
          ) : (
            "כל החומרים הפעילים כבר משויכים למוצר זה."
          )}
        </p>
      )}
    </div>
  );
}
