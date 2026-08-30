import { connectDB } from "@/lib/db/mongoose";
import Color from "@/models/Color";
import Material from "@/models/Material";
import type {
  ProductMaterialColorView,
  ProductMaterialOptionView,
} from "@/types/product";

type StoredOption = {
  materialId: { toString(): string };
  allowedColorIds: { toString(): string }[];
};

type MaterialRecord = {
  _id: { toString(): string };
  nameEn?: string;
  nameHe?: string;
  type: string;
  variants?: Array<{
    _id: { toString(): string };
    name: string;
    hex?: string;
    isActive: boolean;
  }>;
  colorIds?: { toString(): string }[];
};

type ColorRecord = {
  _id: { toString(): string };
  nameHe: string;
  hex: string;
};

function resolveMaterialName(material: MaterialRecord): string {
  return material.nameEn ?? material.nameHe ?? "";
}

function resolveVariantColorView(
  material: MaterialRecord,
  variantId: string,
  colorById: Map<string, ColorRecord>,
): ProductMaterialColorView | null {
  const variant = material.variants?.find(
    (entry) => entry._id.toString() === variantId,
  );
  if (variant?.hex) {
    return {
      id: variantId,
      name: variant.name,
      hex: variant.hex,
    };
  }

  const color = colorById.get(variantId);
  if (!color) {
    return null;
  }

  return {
    id: variantId,
    name: color.nameHe,
    hex: color.hex,
  };
}

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
      const variantId = colorRef.toString();
      const mapped = resolveVariantColorView(material, variantId, colorById);
      if (mapped) {
        mappedColors.push(mapped);
      }
    }

    if (mappedColors.length === 0) {
      continue;
    }

    result.push({
      materialId,
      materialName: resolveMaterialName(material),
      materialType: material.type,
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
      .select("nameEn nameHe type variants colorIds")
      .lean(),
    Color.find({ _id: { $in: colorIds } })
      .select("nameHe hex")
      .lean(),
  ]);

  return mapStoredOptionsToView(storedOptions, materials, colors);
}

export function getMaterialPaletteVariantIds(material: {
  variants?: Array<{ _id: { toString(): string } }>;
  colorIds?: Array<{ toString(): string }>;
}): string[] {
  if (material.variants?.length) {
    return material.variants.map((variant) => variant._id.toString());
  }

  return (material.colorIds ?? []).map((id) => id.toString());
}
