"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateProjectItemAction } from "@/app/professional/projects/actions";
import {
  getMaterialById,
  resolveValidColorId,
} from "@/lib/products/configurator-helpers";
import {
  hasMaterials,
  hasSizes,
} from "@/lib/products/product-display-helpers";
import type { ProjectItemView } from "@/types/project";
import type { ProductView } from "@/types/product";
import formStyles from "@/components/admin/ProductForm/form-section.module.scss";
import styles from "./ProjectItemEditor.module.scss";

const MAX_QUANTITY = 999;

type ProjectItemEditorProps = {
  projectId: string;
  item: ProjectItemView;
  product: ProductView;
  onSaved: () => void;
};

export default function ProjectItemEditor({
  projectId,
  item,
  product,
  onSaved,
}: ProjectItemEditorProps) {
  const router = useRouter();
  const [materialId, setMaterialId] = useState(item.selectedMaterialId ?? "");
  const [colorId, setColorId] = useState(item.selectedColorId ?? "");
  const [sizeKey, setSizeKey] = useState(item.selectedSizeKey ?? "");
  const [quantity, setQuantity] = useState(item.quantity);
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const materialsAvailable = hasMaterials(product);
  const sizesAvailable = hasSizes(product);
  const currentMaterial = materialId
    ? getMaterialById(product, materialId)
    : undefined;

  const handleMaterialChange = (nextMaterialId: string) => {
    const material = getMaterialById(product, nextMaterialId);
    if (!material) {
      return;
    }

    setMaterialId(nextMaterialId);
    setColorId((previous) =>
      previous
        ? resolveValidColorId(material, previous) ?? material.colors[0]?.id ?? ""
        : material.colors[0]?.id ?? "",
    );
  };

  const handleSave = () => {
    setError(undefined);

    startTransition(async () => {
      const result = await updateProjectItemAction({
        projectId,
        itemId: item.id,
        quantity,
        selectedMaterialId: materialId || undefined,
        selectedColorId: colorId || undefined,
        selectedSizeKey: sizeKey || undefined,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      router.refresh();
      onSaved();
    });
  };

  return (
    <div className={styles.editor}>
      {materialsAvailable && currentMaterial ? (
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>חומר</legend>
          <div className={styles.optionGroup}>
            {product.materialOptions.map((material) => (
              <button
                key={material.materialId}
                type="button"
                className={
                  materialId === material.materialId
                    ? styles.optionActive
                    : styles.optionButton
                }
                aria-pressed={materialId === material.materialId}
                onClick={() => handleMaterialChange(material.materialId)}
              >
                {material.materialName}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      {currentMaterial && currentMaterial.colors.length > 0 ? (
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>צבע</legend>
          <div className={styles.optionGroup}>
            {currentMaterial.colors.map((color) => (
              <button
                key={color.id}
                type="button"
                className={
                  colorId === color.id ? styles.optionActive : styles.optionButton
                }
                aria-pressed={colorId === color.id}
                onClick={() => setColorId(color.id)}
              >
                {color.name}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      {sizesAvailable ? (
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>מידה</legend>
          <div className={styles.optionGroup}>
            {product.sizes.map((size) => (
              <button
                key={size.id}
                type="button"
                className={
                  sizeKey === size.id ? styles.optionActive : styles.optionButton
                }
                aria-pressed={sizeKey === size.id}
                onClick={() => setSizeKey(size.id)}
              >
                {size.label}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div className={styles.quantityRow}>
        <label htmlFor={`quantity-${item.id}`} className={styles.label}>
          כמות
        </label>
        <input
          id={`quantity-${item.id}`}
          type="number"
          min={1}
          max={MAX_QUANTITY}
          className={formStyles.input}
          value={quantity}
          onChange={(event) =>
            setQuantity(Number.parseInt(event.target.value, 10) || 1)
          }
        />
      </div>

      {error ? (
        <p className={formStyles.formError} role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        className={formStyles.submitButton}
        onClick={handleSave}
        disabled={isPending}
      >
        {isPending ? "שומר..." : "שמירת שינויים"}
      </button>
    </div>
  );
}
