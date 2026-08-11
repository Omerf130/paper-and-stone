import type { IProduct } from "@/models/Product";
import type {
  ProductMaterialColorView,
  ProductMaterialOptionView,
} from "@/types/product";
import type { MaterialType } from "@/types/material";
import { LEGACY_FALLBACK_HEX } from "./material-option-errors";

export function mapLegacyFabricsToMaterialOptionsView(
  fabrics: IProduct["fabrics"],
): ProductMaterialOptionView[] {
  if (!fabrics?.length) {
    return [];
  }

  return fabrics.map((fabric) => ({
    materialId: fabric.key,
    materialName: fabric.label,
    materialType: "FABRIC" as MaterialType,
    colors: (fabric.colors ?? []).map(
      (color): ProductMaterialColorView => ({
        id: color.key,
        name: color.label,
        hex: LEGACY_FALLBACK_HEX,
      }),
    ),
  }));
}
