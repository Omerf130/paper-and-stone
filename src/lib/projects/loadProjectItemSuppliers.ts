import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Product from "@/models/Product";
import Supplier from "@/models/Supplier";

export type ProjectItemSupplierInfo = {
  supplierId?: string;
  supplierName?: string;
};

export async function loadProjectItemSuppliers(
  productIds: string[],
): Promise<Record<string, ProjectItemSupplierInfo>> {
  await connectDB();

  const uniqueIds = [...new Set(productIds.filter((id) => Types.ObjectId.isValid(id)))];
  if (uniqueIds.length === 0) {
    return {};
  }

  const products = await Product.find({
    _id: { $in: uniqueIds.map((id) => new Types.ObjectId(id)) },
  })
    .select("supplierId")
    .lean();

  const supplierIds = [
    ...new Set(
      products
        .map((product) => product.supplierId?.toString())
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const suppliers =
    supplierIds.length > 0
      ? await Supplier.find({
          _id: { $in: supplierIds.map((id) => new Types.ObjectId(id)) },
        })
          .select("name")
          .lean()
      : [];

  const supplierNameById = new Map(
    suppliers.map((supplier) => [supplier._id.toString(), supplier.name]),
  );

  const result: Record<string, ProjectItemSupplierInfo> = {};

  for (const product of products) {
    const productId = product._id.toString();
    const supplierId = product.supplierId?.toString();

    result[productId] = {
      supplierId,
      supplierName: supplierId ? supplierNameById.get(supplierId) : undefined,
    };
  }

  return result;
}
