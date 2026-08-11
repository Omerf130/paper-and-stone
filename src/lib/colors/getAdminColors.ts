import { connectDB } from "@/lib/db/mongoose";
import Color from "@/models/Color";
import Material from "@/models/Material";
import type { AdminColorListItem } from "@/types/admin-color";

type MaterialCountResult = {
  _id: string;
  count: number;
};

export async function getAdminColors(): Promise<AdminColorListItem[]> {
  await connectDB();

  const [colors, materialCounts] = await Promise.all([
    Color.find({}).sort({ sortOrder: 1, nameHe: 1 }).lean(),
    Material.aggregate<MaterialCountResult>([
      { $unwind: "$colorIds" },
      { $group: { _id: "$colorIds", count: { $sum: 1 } } },
    ]),
  ]);

  const countByColorId = new Map<string, number>(
    materialCounts.map((item) => [item._id.toString(), item.count]),
  );

  return colors.map((color) => ({
    id: color._id.toString(),
    nameHe: color.nameHe,
    nameEn: color.nameEn,
    code: color.code,
    hex: color.hex,
    isActive: color.isActive,
    sortOrder: color.sortOrder,
    materialCount: countByColorId.get(color._id.toString()) ?? 0,
    updatedAt: color.updatedAt.toISOString(),
  }));
}
