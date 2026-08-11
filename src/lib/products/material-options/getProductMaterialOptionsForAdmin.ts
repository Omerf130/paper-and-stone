import type { ProductMaterialOptionInput } from "./product-material-option-input";
import {
  getActiveMaterialsWithColors,
  getMaterialsByIds,
  type AdminMaterialWithColors,
} from "./getActiveMaterialsWithColors";

export type ProductMaterialOptionsAdminData = {
  activeMaterials: AdminMaterialWithColors[];
  assignedMaterials: AdminMaterialWithColors[];
};

export async function getProductMaterialOptionsForAdmin(
  materialOptions: ProductMaterialOptionInput[],
): Promise<ProductMaterialOptionsAdminData> {
  const activeMaterials = await getActiveMaterialsWithColors();
  const assignedMaterialIds = materialOptions.map((option) => option.materialId);

  const assignedMaterials =
    assignedMaterialIds.length > 0
      ? await getMaterialsByIds(assignedMaterialIds)
      : [];

  return {
    activeMaterials,
    assignedMaterials,
  };
}
