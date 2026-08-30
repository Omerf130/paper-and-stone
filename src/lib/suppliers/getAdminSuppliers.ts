import { connectDB } from "@/lib/db/mongoose";
import Product from "@/models/Product";
import Supplier from "@/models/Supplier";
import type { AdminSupplierListItem } from "@/types/admin-supplier";
import type { SupplierOption } from "@/types/admin-supplier";

export async function getAdminSuppliers(): Promise<AdminSupplierListItem[]> {
  await connectDB();

  const suppliers = await Supplier.find()
    .sort({ name: 1 })
    .select("name code isActive updatedAt")
    .lean();

  const productCounts = await Product.aggregate<{ _id: unknown; count: number }>(
    [
      { $match: { supplierId: { $exists: true, $ne: null } } },
      { $group: { _id: "$supplierId", count: { $sum: 1 } } },
    ],
  );

  const countBySupplierId = new Map(
    productCounts.map((entry) => [entry._id?.toString() ?? "", entry.count]),
  );

  return suppliers.map((supplier) => ({
    id: supplier._id.toString(),
    name: supplier.name,
    code: supplier.code,
    isActive: supplier.isActive,
    productCount: countBySupplierId.get(supplier._id.toString()) ?? 0,
    updatedAt: supplier.updatedAt.toISOString(),
  }));
}

export async function getSupplierFormOptions(): Promise<SupplierOption[]> {
  await connectDB();

  const suppliers = await Supplier.find({ isActive: true })
    .sort({ name: 1 })
    .select("name isActive")
    .lean();

  return suppliers.map((supplier) => ({
    id: supplier._id.toString(),
    name: supplier.name,
    isActive: supplier.isActive,
  }));
}

export async function getAllSupplierFormOptions(): Promise<SupplierOption[]> {
  await connectDB();

  const suppliers = await Supplier.find()
    .sort({ name: 1 })
    .select("name isActive")
    .lean();

  return suppliers.map((supplier) => ({
    id: supplier._id.toString(),
    name: supplier.name,
    isActive: supplier.isActive,
  }));
}
