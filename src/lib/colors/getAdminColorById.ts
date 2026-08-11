import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Color from "@/models/Color";
import type { AdminColorFormInput } from "@/types/admin-color";

export async function getAdminColorById(
  id: string,
): Promise<AdminColorFormInput | null> {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  await connectDB();

  const color = await Color.findById(id).lean();

  if (!color) {
    return null;
  }

  return {
    nameHe: color.nameHe,
    nameEn: color.nameEn ?? "",
    code: color.code ?? "",
    hex: color.hex,
    sortOrder: color.sortOrder.toString(),
    isActive: color.isActive,
  };
}
