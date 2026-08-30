import { connectDB } from "@/lib/db/mongoose";
import Color from "@/models/Color";
import Material from "@/models/Material";
import type { AdminMaterialVariantOption } from "@/types/admin-material";

export type AdminMaterialWithColors = {
  id: string;
  nameEn: string;
  type: string;
  isActive: boolean;
  colors: AdminMaterialVariantOption[];
};

async function resolveMaterialColors(
  material: {
    _id: { toString(): string };
    variants?: Array<{
      _id: { toString(): string };
      name: string;
      hex?: string;
      swatchImage?: { url: string };
      isActive: boolean;
    }>;
    colorIds?: { toString(): string }[];
  },
  colorById: Map<string, AdminMaterialVariantOption>,
): Promise<AdminMaterialVariantOption[]> {
  if (material.variants?.length) {
    return material.variants.map((variant) => ({
      id: variant._id.toString(),
      name: variant.name,
      hex: variant.hex,
      swatchImageUrl: variant.swatchImage?.url,
      isActive: variant.isActive,
    }));
  }

  return (material.colorIds ?? [])
    .map((colorId) => colorById.get(colorId.toString()))
    .filter((color): color is AdminMaterialVariantOption => color !== undefined);
}

export async function getActiveMaterialsWithColors(): Promise<
  AdminMaterialWithColors[]
> {
  await connectDB();

  const materials = await Material.find({ isActive: true })
    .sort({ sortOrder: 1, nameEn: 1 })
    .select("nameEn type isActive variants colorIds")
    .lean();

  const legacyColorIds = [
    ...new Set(
      materials.flatMap((material) =>
        material.variants?.length
          ? []
          : (material.colorIds ?? []).map((id) => id.toString()),
      ),
    ),
  ];

  const colors = legacyColorIds.length
    ? await Color.find({ _id: { $in: legacyColorIds }, isActive: true })
        .select("nameHe hex isActive")
        .lean()
    : [];

  const colorById = new Map(
    colors.map((color) => [
      color._id.toString(),
      {
        id: color._id.toString(),
        name: color.nameHe,
        hex: color.hex,
        isActive: color.isActive,
      },
    ]),
  );

  return Promise.all(
    materials.map(async (material) => ({
      id: material._id.toString(),
      nameEn: material.nameEn,
      type: material.type,
      isActive: material.isActive,
      colors: await resolveMaterialColors(material, colorById),
    })),
  );
}

export async function getMaterialsByIds(
  ids: string[],
): Promise<AdminMaterialWithColors[]> {
  if (ids.length === 0) {
    return [];
  }

  await connectDB();

  const materials = await Material.find({ _id: { $in: ids } })
    .select("nameEn type isActive variants colorIds")
    .lean();

  const legacyColorIds = [
    ...new Set(
      materials.flatMap((material) =>
        material.variants?.length
          ? []
          : (material.colorIds ?? []).map((id) => id.toString()),
      ),
    ),
  ];

  const colors = legacyColorIds.length
    ? await Color.find({ _id: { $in: legacyColorIds } })
        .select("nameHe hex isActive")
        .lean()
    : [];

  const colorById = new Map(
    colors.map((color) => [
      color._id.toString(),
      {
        id: color._id.toString(),
        name: color.nameHe,
        hex: color.hex,
        isActive: color.isActive,
      },
    ]),
  );

  const materialById = new Map(
    await Promise.all(
      materials.map(async (material) => [
        material._id.toString(),
        {
          id: material._id.toString(),
          nameEn: material.nameEn,
          type: material.type,
          isActive: material.isActive,
          colors: await resolveMaterialColors(material, colorById),
        },
      ] as const),
    ),
  );

  return ids
    .map((id) => materialById.get(id))
    .filter(
      (material): material is AdminMaterialWithColors => material !== undefined,
    );
}

export function getMaterialVariantPaletteIds(material: {
  variants?: Array<{ _id: { toString(): string } }>;
  colorIds?: Array<{ toString(): string }>;
}): string[] {
  if (material.variants?.length) {
    return material.variants.map((variant) => variant._id.toString());
  }

  return (material.colorIds ?? []).map((id) => id.toString());
}
