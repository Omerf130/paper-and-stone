import { connectDB } from "@/lib/db/mongoose";
import Category from "@/models/Category";
import Product from "@/models/Product";
import type { AdminDashboardStats } from "@/types/admin-product";

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  await connectDB();

  const [
    totalProducts,
    activeProducts,
    featuredProducts,
    activeCategories,
  ] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ isFeatured: true }),
    Category.countDocuments({ isActive: true }),
  ]);

  return {
    totalProducts,
    activeProducts,
    featuredProducts,
    activeCategories,
  };
}
