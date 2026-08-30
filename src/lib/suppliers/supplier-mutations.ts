import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import { isDuplicateCodeError } from "@/lib/shared/duplicate-key";
import Supplier from "@/models/Supplier";
import {
  SUPPLIER_ERRORS,
  type SupplierWriteFields,
} from "./supplier-validation";

export class SupplierMutationError extends Error {
  fieldErrors?: Record<string, string>;

  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

export async function createSupplier(
  fields: SupplierWriteFields,
): Promise<string> {
  await connectDB();

  try {
    const supplier = await Supplier.create({
      name: fields.name,
      code: fields.code,
      isActive: fields.isActive,
    });

    return supplier._id.toString();
  } catch (error: unknown) {
    if (isDuplicateCodeError(error)) {
      throw new SupplierMutationError(SUPPLIER_ERRORS.DUPLICATE_CODE, {
        code: SUPPLIER_ERRORS.DUPLICATE_CODE,
      });
    }

    throw error;
  }
}

export async function updateSupplier(
  id: string,
  fields: SupplierWriteFields,
): Promise<void> {
  await connectDB();

  try {
    const result = await Supplier.updateOne(
      { _id: id },
      {
        $set: {
          name: fields.name,
          isActive: fields.isActive,
          ...(fields.code !== undefined ? { code: fields.code } : {}),
        },
        ...(fields.code === undefined ? { $unset: { code: 1 } } : {}),
      },
    );

    if (result.matchedCount === 0) {
      throw new SupplierMutationError(SUPPLIER_ERRORS.GENERIC);
    }
  } catch (error: unknown) {
    if (error instanceof SupplierMutationError) {
      throw error;
    }

    if (isDuplicateCodeError(error)) {
      throw new SupplierMutationError(SUPPLIER_ERRORS.DUPLICATE_CODE, {
        code: SUPPLIER_ERRORS.DUPLICATE_CODE,
      });
    }

    throw error;
  }
}

export async function verifyActiveSupplier(
  supplierId: string,
): Promise<boolean> {
  if (!Types.ObjectId.isValid(supplierId)) {
    return false;
  }

  await connectDB();
  const supplier = await Supplier.findOne({
    _id: supplierId,
    isActive: true,
  })
    .select("_id")
    .lean();

  return Boolean(supplier);
}

export async function verifySupplierExists(
  supplierId: string,
): Promise<boolean> {
  if (!Types.ObjectId.isValid(supplierId)) {
    return false;
  }

  await connectDB();
  const supplier = await Supplier.findById(supplierId).select("_id").lean();
  return Boolean(supplier);
}

export async function getSupplierNameById(
  supplierId: string,
): Promise<string | undefined> {
  if (!Types.ObjectId.isValid(supplierId)) {
    return undefined;
  }

  await connectDB();
  const supplier = await Supplier.findById(supplierId).select("name").lean();
  return supplier?.name;
}
