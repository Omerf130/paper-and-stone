import { connectDB } from "@/lib/db/mongoose";
import Color from "@/models/Color";
import type { AdminColorOption } from "@/types/admin-material";

export async function getActiveColorsForPicker(): Promise<AdminColorOption[]> {
  await connectDB();

  const colors = await Color.find({ isActive: true })
    .sort({ sortOrder: 1, nameHe: 1 })
    .select("nameHe nameEn hex isActive")
    .lean();

  return colors.map((color) => ({
    id: color._id.toString(),
    name: color.nameEn?.trim() || color.nameHe,
    hex: color.hex,
    isActive: color.isActive,
  }));
}

export async function getColorsByIds(
  colorIds: string[],
): Promise<AdminColorOption[]> {
  if (colorIds.length === 0) {
    return [];
  }

  await connectDB();

  const colors = await Color.find({ _id: { $in: colorIds } })
    .select("nameHe nameEn hex isActive")
    .lean();

  const colorById = new Map(
    colors.map((color) => [
      color._id.toString(),
      {
        id: color._id.toString(),
        name: color.nameEn?.trim() || color.nameHe,
        hex: color.hex,
        isActive: color.isActive,
      },
    ]),
  );

  return colorIds
    .map((id) => colorById.get(id))
    .filter((color): color is NonNullable<typeof color> => color !== undefined);
}
