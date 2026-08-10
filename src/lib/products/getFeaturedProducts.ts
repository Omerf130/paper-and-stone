import { connectDB } from "@/lib/db/mongoose";
import Category from "@/models/Category";
import Product from "@/models/Product";
import type { CatalogProductView } from "@/types/catalog";
import { mapProductToCatalogView } from "./mapProductToCatalogView";

const FEATURED_PRODUCT_LIMIT = 4;

export async function getFeaturedProducts(): Promise<CatalogProductView[]> {
  await connectDB();

  const products = await Product.find({ isActive: true, isFeatured: true })
    .populate<{ categoryId: { nameHe: string } | null }>({
      path: "categoryId",
      model: Category,
      select: "nameHe",
    })
    .select("nameHe nameEn slug brand categoryId")
    .sort({ updatedAt: -1 })
    .limit(FEATURED_PRODUCT_LIMIT)
    .lean();

  return products.map(mapProductToCatalogView);
}

export { FEATURED_PRODUCT_LIMIT };
