import { connectDB } from "@/lib/db/mongoose";
import { CATALOG_PRIMARY_IMAGE_SELECT } from "@/lib/media/product-media-select";
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
    .select(`nameHe nameEn slug brand categoryId ${CATALOG_PRIMARY_IMAGE_SELECT}`)
    .sort({ updatedAt: -1 })
    .limit(FEATURED_PRODUCT_LIMIT)
    .lean();

  return products.map(mapProductToCatalogView);
}

export { FEATURED_PRODUCT_LIMIT };
