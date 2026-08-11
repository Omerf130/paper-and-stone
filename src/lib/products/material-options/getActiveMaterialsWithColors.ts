import { connectDB } from "@/lib/db/mongoose";
import Color from "@/models/Color";
import Material from "@/models/Material";
import type { AdminColorOption } from "@/types/admin-material";
import type { MaterialType } from "@/types/material";
import { isMaterialType } from "@/types/material";

export type AdminMaterialWithColors = {
  id: string;
  nameHe: string;
  type: MaterialType;
  isActive: boolean;
  colors: AdminColorOption[];
};

export async function getActiveMaterialsWithColors(): Promise<
  AdminMaterialWithColors[]
> {
  await connectDB();

  const materials = await Material.find({ isActive: true })
    .sort({ sortOrder: 1, nameHe: 1 })
    .select("nameHe type isActive colorIds")
    .lean();

  const allColorIds = [
    ...new Set(
      materials.flatMap((material) =>
        (material.colorIds ?? []).map((id) => id.toString()),
      ),
    ),
  ];

  const colors = allColorIds.length
    ? await Color.find({ _id: { $in: allColorIds }, isActive: true })
        .select("nameHe hex isActive")
        .lean()
    : [];

  const colorById = new Map(
    colors.map((color) => [
      color._id.toString(),
      {
        id: color._id.toString(),
        nameHe: color.nameHe,
        hex: color.hex,
        isActive: color.isActive,
      },
    ]),
  );

  return materials.map((material) => ({
    id: material._id.toString(),
    nameHe: material.nameHe,
    type: isMaterialType(material.type) ? material.type : "OTHER",
    isActive: material.isActive,
    colors: (material.colorIds ?? [])
      .map((colorId) => colorById.get(colorId.toString()))
      .filter((color): color is AdminColorOption => color !== undefined),
  }));
}

export async function getMaterialsByIds(
  ids: string[],
): Promise<AdminMaterialWithColors[]> {
  if (ids.length === 0) {
    return [];
  }

  await connectDB();

  const materials = await Material.find({ _id: { $in: ids } })
    .select("nameHe type isActive colorIds")
    .lean();

  const allColorIds = [
    ...new Set(
      materials.flatMap((material) =>
        (material.colorIds ?? []).map((id) => id.toString()),
      ),
    ),
  ];

  const colors = allColorIds.length
    ? await Color.find({ _id: { $in: allColorIds } })
        .select("nameHe hex isActive")
        .lean()
    : [];

  const colorById = new Map(
    colors.map((color) => [
      color._id.toString(),
      {
        id: color._id.toString(),
        nameHe: color.nameHe,
        hex: color.hex,
        isActive: color.isActive,
      },
    ]),
  );

  const materialById = new Map(
    materials.map((material) => [
      material._id.toString(),
      {
        id: material._id.toString(),
        nameHe: material.nameHe,
        type: isMaterialType(material.type) ? material.type : "OTHER",
        isActive: material.isActive,
        colors: (material.colorIds ?? [])
          .map((colorId) => colorById.get(colorId.toString()))
          .filter((color): color is AdminColorOption => color !== undefined),
      },
    ]),
  );

  return ids
    .map((id) => materialById.get(id))
    .filter(
      (material): material is AdminMaterialWithColors => material !== undefined,
    );
}
