import { connectDB } from "@/lib/db/mongoose";
import Product from "@/models/Product";
import { verifyActiveCategory } from "@/lib/products/getActiveCategories";
import {
  PRODUCT_ERRORS,
  isDuplicateKeyError,
  mapProductInputToWriteFields,
  type ProductWriteFields,
} from "@/lib/products/product-validation";

export class ProductMutationError extends Error {
  fieldErrors?: Record<string, string>;

  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

async function assertValidCategory(categoryId: string): Promise<void> {
  const isValid = await verifyActiveCategory(categoryId);
  if (!isValid) {
    throw new ProductMutationError(PRODUCT_ERRORS.INVALID_CATEGORY, {
      categoryId: PRODUCT_ERRORS.INVALID_CATEGORY,
    });
  }
}

export async function createProduct(
  fields: ProductWriteFields,
): Promise<string> {
  await connectDB();
  await assertValidCategory(fields.categoryId);

  try {
    const product = await Product.create({
      nameHe: fields.nameHe,
      nameEn: fields.nameEn,
      slug: fields.slug,
      sku: fields.sku,
      categoryId: fields.categoryId,
      brand: fields.brand,
      designer: fields.designer,
      shortDescription: fields.shortDescription,
      longDescription: fields.longDescription,
      isActive: fields.isActive,
      isFeatured: fields.isFeatured,
      width: fields.width,
      depth: fields.depth,
      height: fields.height,
      seatHeight: fields.seatHeight,
      materials: fields.materials,
      maintenance: fields.maintenance,
      warranty: fields.warranty,
      countryOfOrigin: fields.countryOfOrigin,
      fabrics: fields.fabrics,
      sizes: fields.sizes,
    });

    return product._id.toString();
  } catch (error: unknown) {
    const duplicateField = isDuplicateKeyError(error);
    if (duplicateField === "slug") {
      throw new ProductMutationError(PRODUCT_ERRORS.DUPLICATE_SLUG, {
        slug: PRODUCT_ERRORS.DUPLICATE_SLUG,
      });
    }
    if (duplicateField === "sku") {
      throw new ProductMutationError(PRODUCT_ERRORS.DUPLICATE_SKU, {
        sku: PRODUCT_ERRORS.DUPLICATE_SKU,
      });
    }
    throw error;
  }
}

export async function updateProduct(
  id: string,
  fields: ProductWriteFields,
): Promise<void> {
  await connectDB();
  await assertValidCategory(fields.categoryId);

  try {
    const result = await Product.updateOne(
      { _id: id },
      {
        $set: {
          nameHe: fields.nameHe,
          nameEn: fields.nameEn,
          slug: fields.slug,
          sku: fields.sku,
          categoryId: fields.categoryId,
          brand: fields.brand,
          designer: fields.designer,
          shortDescription: fields.shortDescription,
          longDescription: fields.longDescription,
          isActive: fields.isActive,
          isFeatured: fields.isFeatured,
          width: fields.width,
          depth: fields.depth,
          height: fields.height,
          seatHeight: fields.seatHeight,
          materials: fields.materials,
          maintenance: fields.maintenance,
          warranty: fields.warranty,
          countryOfOrigin: fields.countryOfOrigin,
          fabrics: fields.fabrics,
          sizes: fields.sizes,
        },
      },
    );

    if (result.matchedCount === 0) {
      throw new ProductMutationError(PRODUCT_ERRORS.GENERIC);
    }
  } catch (error: unknown) {
    if (error instanceof ProductMutationError) {
      throw error;
    }

    const duplicateField = isDuplicateKeyError(error);
    if (duplicateField === "slug") {
      throw new ProductMutationError(PRODUCT_ERRORS.DUPLICATE_SLUG, {
        slug: PRODUCT_ERRORS.DUPLICATE_SLUG,
      });
    }
    if (duplicateField === "sku") {
      throw new ProductMutationError(PRODUCT_ERRORS.DUPLICATE_SKU, {
        sku: PRODUCT_ERRORS.DUPLICATE_SKU,
      });
    }
    throw error;
  }
}

export { mapProductInputToWriteFields };
