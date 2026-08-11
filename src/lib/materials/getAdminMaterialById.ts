import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Material from "@/models/Material";
import type { AdminMaterialFormInput } from "@/types/admin-material";
import type { MaterialType } from "@/types/material";

export async function getAdminMaterialById(
  id: string,
): Promise<AdminMaterialFormInput | null> {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  await connectDB();

  const material = await Material.findById(id).lean();

  if (!material) {
    return null;
  }

  return {
    nameHe: material.nameHe,
    nameEn: material.nameEn ?? "",
    code: material.code ?? "",
    type: material.type as MaterialType,
    sortOrder: material.sortOrder.toString(),
    isActive: material.isActive,
    colorIds: (material.colorIds ?? []).map((colorId) => colorId.toString()),
  };
}
