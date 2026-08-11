import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Category from "@/models/Category";

export async function resolveActiveCategorySlug(
  categorySlug: string | null | undefined,
): Promise<Types.ObjectId | null> {
  const slug = categorySlug?.trim();

  if (!slug) {
    return null;
  }

  await connectDB();

  const category = await Category.findOne({ slug, isActive: true })
    .select("_id")
    .lean();

  if (!category) {
    return null;
  }

  return category._id;
}
