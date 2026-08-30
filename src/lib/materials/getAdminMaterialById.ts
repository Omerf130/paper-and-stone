import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Material from "@/models/Material";
import type { AdminMaterialFormInput } from "@/types/admin-material";

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
    nameEn: material.nameEn,
    code: material.code ?? "",
    type: material.type,
    isActive: material.isActive,
    variants: (material.variants ?? []).map((variant) => ({
      id: variant._id.toString(),
      name: variant.name,
      hex: variant.hex ?? "",
      swatchImage: variant.swatchImage,
      isActive: variant.isActive,
    })),
  };
}
