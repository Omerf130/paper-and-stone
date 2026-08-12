import {
  getColorById,
  getMaterialById,
} from "@/lib/products/configurator-helpers";
import type { ProductView } from "@/types/product";
import type { IProjectItemSnapshot } from "@/models/Project";
import type { VerifiedProjectItemSelection } from "@/lib/projects/verifyProjectItemSelection";

export function buildProjectItemSnapshot(
  productView: ProductView,
  selection: Pick<
    VerifiedProjectItemSelection,
    "selectedMaterialId" | "selectedColorId" | "selectedSizeKey"
  >,
): IProjectItemSnapshot {
  const snapshot: IProjectItemSnapshot = {
    productName: productView.nameHe,
    productSlug: productView.slug,
    sku: productView.sku || undefined,
  };

  if (selection.selectedMaterialId) {
    const material = getMaterialById(productView, selection.selectedMaterialId);
    if (material) {
      snapshot.materialName = material.materialName;
    }
  }

  if (selection.selectedMaterialId && selection.selectedColorId) {
    const material = getMaterialById(productView, selection.selectedMaterialId);
    const color = material
      ? getColorById(material, selection.selectedColorId)
      : undefined;
    if (color) {
      snapshot.colorName = color.name;
      snapshot.colorHex = color.hex;
    }
  }

  if (selection.selectedSizeKey) {
    const size = productView.sizes.find(
      (entry) => entry.id === selection.selectedSizeKey,
    );
    if (size) {
      snapshot.sizeLabel = size.label;
    }
  }

  return snapshot;
}
