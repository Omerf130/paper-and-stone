import { connectDB } from "@/lib/db/mongoose";
import Color from "@/models/Color";
import Material from "@/models/Material";
import type {
  ProductMaterialColorView,
  ProductMaterialOptionView,
} from "@/types/product";
import { isMaterialType } from "@/types/material";

type StoredOption = {
  materialId: { toString(): string };
  allowedColorIds: { toString(): string }[];
};

type MaterialRecord = {
  _id: { toString(): string };
  nameHe: string;
  type: string;
};

type ColorRecord = {
  _id: { toString(): string };
  nameHe: string;
  hex: string;
};

export function mapStoredOptionsToView(
  storedOptions: StoredOption[],
  materials: MaterialRecord[],
  colors: ColorRecord[],
): ProductMaterialOptionView[] {
  const materialById = new Map(
    materials.map((material) => [material._id.toString(), material]),
  );
  const colorById = new Map(
    colors.map((color) => [color._id.toString(), color]),
  );

  const result: ProductMaterialOptionView[] = [];

  for (const option of storedOptions) {
    const materialId = option.materialId.toString();
    const material = materialById.get(materialId);
    if (!material) {
      continue;
    }

    const mappedColors: ProductMaterialColorView[] = [];

    for (const colorRef of option.allowedColorIds) {
      const colorId = colorRef.toString();
      const color = colorById.get(colorId);
      if (!color) {
        continue;
      }

      mappedColors.push({
        id: colorId,
        name: color.nameHe,
        hex: color.hex,
      });
    }

    if (mappedColors.length === 0) {
      continue;
    }

    result.push({
      materialId,
      materialName: material.nameHe,
      materialType: isMaterialType(material.type) ? material.type : "OTHER",
      colors: mappedColors,
    });
  }

  return result;
}

export async function mapProductMaterialOptionsToView(
  storedOptions: StoredOption[],
): Promise<ProductMaterialOptionView[]> {
  if (!storedOptions.length) {
    return [];
  }

  await connectDB();

  const materialIds = [
    ...new Set(storedOptions.map((option) => option.materialId.toString())),
  ];
  const colorIds = [
    ...new Set(
      storedOptions.flatMap((option) =>
        option.allowedColorIds.map((id) => id.toString()),
      ),
    ),
  ];

  const [materials, colors] = await Promise.all([
    Material.find({ _id: { $in: materialIds } })
      .select("nameHe type")
      .lean(),
    Color.find({ _id: { $in: colorIds } })
      .select("nameHe hex")
      .lean(),
  ]);

  return mapStoredOptionsToView(storedOptions, materials, colors);
}
