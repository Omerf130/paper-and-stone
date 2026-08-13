import { connectDB } from "@/lib/db/mongoose";
import Category from "@/models/Category";

export type HomepageCategoryRecord = {
  id: string;
  nameHe: string;
  slug: string;
  isActive: boolean;
};

export async function getHomepageCategoryRecords(
  categoryIds: string[],
): Promise<Map<string, HomepageCategoryRecord>> {
  const uniqueIds = [...new Set(categoryIds.filter(Boolean))];

  if (uniqueIds.length === 0) {
    return new Map();
  }

  await connectDB();

  const categories = await Category.find({ _id: { $in: uniqueIds } })
    .select("_id nameHe slug isActive")
    .lean();

  const records = new Map<string, HomepageCategoryRecord>();

  for (const category of categories) {
    const id = category._id.toString();
    records.set(id, {
      id,
      nameHe: category.nameHe,
      slug: category.slug,
      isActive: category.isActive,
    });
  }

  return records;
}
