import { connectDB } from "@/lib/db/mongoose";
import WishlistItem from "@/models/WishlistItem";

export async function isProductWishlisted(
  userId: string,
  productSlug: string,
): Promise<boolean> {
  await connectDB();

  const item = await WishlistItem.findOne({
    userId,
    productSlug,
  })
    .select("_id")
    .lean();

  return item !== null;
}

export async function toggleWishlistItem(
  userId: string,
  productSlug: string,
): Promise<{ isWishlisted: boolean }> {
  await connectDB();

  const existing = await WishlistItem.findOne({ userId, productSlug }).select("_id");

  if (existing) {
    await WishlistItem.deleteOne({ _id: existing._id });
    return { isWishlisted: false };
  }

  await WishlistItem.create({ userId, productSlug });
  return { isWishlisted: true };
}

export async function removeWishlistItem(
  userId: string,
  productSlug: string,
): Promise<boolean> {
  await connectDB();

  const result = await WishlistItem.deleteOne({ userId, productSlug });
  return result.deletedCount > 0;
}

export async function getWishlistProductSlugs(userId: string): Promise<string[]> {
  await connectDB();

  const items = await WishlistItem.find({ userId })
    .sort({ createdAt: -1 })
    .select("productSlug")
    .lean();

  return items.map((item) => item.productSlug);
}

export async function getWishlistItemCount(userId: string): Promise<number> {
  await connectDB();
  return WishlistItem.countDocuments({ userId });
}
