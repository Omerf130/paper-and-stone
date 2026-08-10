import { connectDB } from "@/lib/db/mongoose";
import Category from "@/models/Category";
import Product from "@/models/Product";
import type { CatalogProductView } from "@/types/catalog";
import { mapProductToCatalogView } from "./mapProductToCatalogView";

export async function getPublicProducts(): Promise<CatalogProductView[]> {
  await connectDB();

  const products = await Product.find({ isActive: true })
    .populate<{ categoryId: { nameHe: string } | null }>({
      path: "categoryId",
      model: Category,
      select: "nameHe",
    })
    .select("nameHe nameEn slug brand categoryId")
    .sort({ nameHe: 1 })
    .lean();

  return products.map(mapProductToCatalogView);
}
