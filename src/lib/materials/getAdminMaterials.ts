import { connectDB } from "@/lib/db/mongoose";
import Material from "@/models/Material";
import type { AdminMaterialListItem } from "@/types/admin-material";
import type { MaterialType } from "@/types/material";

export async function getAdminMaterials(): Promise<AdminMaterialListItem[]> {
  await connectDB();

  const materials = await Material.find({})
    .sort({ sortOrder: 1, nameHe: 1 })
    .lean();

  return materials.map((material) => ({
    id: material._id.toString(),
    nameHe: material.nameHe,
    nameEn: material.nameEn,
    code: material.code,
    type: material.type as MaterialType,
    colorCount: material.colorIds?.length ?? 0,
    isActive: material.isActive,
    sortOrder: material.sortOrder,
    updatedAt: material.updatedAt.toISOString(),
  }));
}
