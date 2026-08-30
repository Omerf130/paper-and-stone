import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Supplier from "@/models/Supplier";
import type { AdminSupplierFormInput } from "@/types/admin-supplier";

export async function getAdminSupplierById(
  id: string,
): Promise<AdminSupplierFormInput | null> {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  await connectDB();

  const supplier = await Supplier.findById(id).lean();

  if (!supplier) {
    return null;
  }

  return {
    name: supplier.name,
    code: supplier.code ?? "",
    isActive: supplier.isActive,
  };
}
