import { connectDB } from "@/lib/db/mongoose";
import { mapProductToView } from "@/lib/products/mapProductToView";
import Category from "@/models/Category";
import Product from "@/models/Product";
import type { ProductView } from "@/types/product";

export async function getProductBySlug(slug: string): Promise<ProductView | null> {
  await connectDB();

  const product = await Product.findOne({ slug, isActive: true })
    .populate<{ categoryId: { nameHe: string } | null }>({
      path: "categoryId",
      model: Category,
      select: "nameHe",
    })
    .lean();

  if (!product) {
    return null;
  }

  return await mapProductToView(product);
}
