import { connectDB } from "@/lib/db/mongoose";
import Material from "@/models/Material";
import type { AdminMaterialListItem } from "@/types/admin-material";

export async function getAdminMaterials(): Promise<AdminMaterialListItem[]> {
  await connectDB();

  const materials = await Material.find({})
    .sort({ sortOrder: 1, nameEn: 1 })
    .lean();

  return materials.map((material) => ({
    id: material._id.toString(),
    nameEn: material.nameEn,
    code: material.code,
    type: material.type,
    variantCount: material.variants?.length ?? material.colorIds?.length ?? 0,
    isActive: material.isActive,
    updatedAt: material.updatedAt.toISOString(),
  }));
}
