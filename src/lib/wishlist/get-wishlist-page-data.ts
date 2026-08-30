import { connectDB } from "@/lib/db/mongoose";
import Product from "@/models/Product";
import { getWishlistProductSlugs } from "@/lib/wishlist/wishlist-queries";
import { mapProductToCatalogView } from "@/lib/products/mapProductToCatalogView";
import type { CatalogProductView } from "@/types/catalog";

export type WishlistPageData = {
  products: CatalogProductView[];
  totalSaved: number;
};

export async function getWishlistPageData(
  userId: string,
): Promise<WishlistPageData> {
  const slugs = await getWishlistProductSlugs(userId);

  if (slugs.length === 0) {
    return { products: [], totalSaved: 0 };
  }

  await connectDB();

  const products = await Product.find({
    slug: { $in: slugs },
    isActive: true,
  })
    .populate<{ categoryId: { nameHe: string } | null }>("categoryId", "nameHe")
    .lean();

  const productsBySlug = new Map(
    products.map((product) => [product.slug, mapProductToCatalogView(product)]),
  );

  const orderedProducts = slugs
    .map((slug) => productsBySlug.get(slug))
    .filter((product): product is CatalogProductView => product !== undefined);

  return {
    products: orderedProducts,
    totalSaved: slugs.length,
  };
}

export function hasWishlistProducts(data: WishlistPageData): boolean {
  return data.products.length > 0;
}
