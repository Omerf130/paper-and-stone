import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import { verifyCategoryForProductUpdate } from "@/lib/categories/verifyCategoryForProductUpdate";
import { deleteOldBlobBestEffort } from "@/lib/media/product-media-mutations";
import { verifyActiveSupplier } from "@/lib/suppliers/supplier-mutations";
import Product from "@/models/Product";
import Project from "@/models/Project";
import ProjectQuote from "@/models/ProjectQuote";
import { verifyActiveCategory } from "@/lib/products/getActiveCategories";
import { ProductMutationError } from "@/lib/products/product-mutation-error";
import { verifyProductMaterialOptions } from "@/lib/products/material-options/verifyProductMaterialOptions";
import {
  PRODUCT_ERRORS,
  isDuplicateKeyError,
  mapProductInputToWriteFields,
  type ProductWriteFields,
} from "@/lib/products/product-validation";

export { ProductMutationError };

export const PRODUCT_DELETE_ERRORS = {
  NOT_FOUND: "המוצר לא נמצא",
  IN_USE:
    "לא ניתן למחוק מוצר שמשויך לפריטים בפרויקטים או להצעות מחיר. הסירו אותו מהפרויקטים תחילה.",
  GENERIC: "אירעה שגיאה במחיקת המוצר. נסו שוב.",
} as const;

async function assertValidSupplier(supplierId: string): Promise<void> {
  const isValid = await verifyActiveSupplier(supplierId);
  if (!isValid) {
    throw new ProductMutationError(PRODUCT_ERRORS.INVALID_SUPPLIER, {
      supplierId: PRODUCT_ERRORS.INVALID_SUPPLIER,
    });
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

function toStoredMaterialOptions(
  materialOptions: ProductWriteFields["materialOptions"],
) {
  return materialOptions.map((option) => ({
    materialId: new Types.ObjectId(option.materialId),
    allowedColorIds: option.allowedColorIds.map(
      (colorId) => new Types.ObjectId(colorId),
    ),
  }));
}

async function assertValidMaterialOptions(
  fields: ProductWriteFields,
  productId?: string,
): Promise<void> {
  const previous =
    productId !== undefined
      ? await (async () => {
          const { getProductMaterialOptionsFromDb } = await import(
            "@/lib/products/material-options/verifyProductMaterialOptions"
          );
          return getProductMaterialOptionsFromDb(productId);
        })()
      : [];

  const result = await verifyProductMaterialOptions(
    fields.materialOptions,
    previous,
  );

  if (!result.ok) {
    throw new ProductMutationError(result.message, {
      [result.field]: result.message,
    });
  }
}

function toStoredDocuments(
  documents: ProductWriteFields["documents"],
) {
  return documents.map((document) => ({
    label: document.label,
    url: document.url,
    fileType: document.fileType,
    sortOrder: document.sortOrder,
    createdAt: new Date(),
  }));
}

export async function createProduct(
  fields: ProductWriteFields,
): Promise<string> {
  await connectDB();
  await assertValidCategory(fields.categoryId);
  await assertValidSupplier(fields.supplierId);
  await assertValidMaterialOptions(fields);

  try {
    const product = await Product.create({
      nameHe: fields.nameHe,
      nameEn: fields.nameEn,
      slug: fields.slug,
      sku: fields.sku,
      skuNormalized: fields.skuNormalized,
      categoryId: fields.categoryId,
      supplierId: fields.supplierId,
      internalCatalogName: fields.internalCatalogName,
      catalogCode: fields.catalogCode,
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
      materialOptions: toStoredMaterialOptions(fields.materialOptions),
      sizes: fields.sizes,
      documents: toStoredDocuments(fields.documents),
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
  await verifyCategoryForProductUpdate(fields.categoryId, id);
  await assertValidSupplier(fields.supplierId);
  await assertValidMaterialOptions(fields, id);

  try {
    const result = await Product.updateOne(
      { _id: id },
      {
        $set: {
          nameHe: fields.nameHe,
          nameEn: fields.nameEn,
          slug: fields.slug,
          sku: fields.sku,
      skuNormalized: fields.skuNormalized,
          categoryId: fields.categoryId,
          supplierId: fields.supplierId,
          internalCatalogName: fields.internalCatalogName,
          catalogCode: fields.catalogCode,
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
          materialOptions: toStoredMaterialOptions(fields.materialOptions),
          sizes: fields.sizes,
          documents: toStoredDocuments(fields.documents),
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

function collectProductMediaStorageKeys(
  media: {
    primaryImage?: { storageKey: string } | null;
    gallery?: Array<{ storageKey: string }>;
    technicalDrawing?: { storageKey: string } | null;
    recolorMask?: { storageKey: string } | null;
  } | null | undefined,
): string[] {
  if (!media) {
    return [];
  }

  const keys: string[] = [];

  if (media.primaryImage?.storageKey) {
    keys.push(media.primaryImage.storageKey);
  }

  if (media.technicalDrawing?.storageKey) {
    keys.push(media.technicalDrawing.storageKey);
  }

  if (media.recolorMask?.storageKey) {
    keys.push(media.recolorMask.storageKey);
  }

  for (const item of media.gallery ?? []) {
    if (item.storageKey) {
      keys.push(item.storageKey);
    }
  }

  return keys;
}

export async function deleteProduct(productId: string): Promise<void> {
  if (!Types.ObjectId.isValid(productId)) {
    throw new ProductMutationError(PRODUCT_DELETE_ERRORS.NOT_FOUND);
  }

  await connectDB();

  const objectId = new Types.ObjectId(productId);

  const [projectItemCount, quoteCount, product] = await Promise.all([
    Project.countDocuments({ "items.productId": objectId }),
    ProjectQuote.countDocuments({ productId: objectId }),
    Product.findById(productId).select("media").lean(),
  ]);

  if (!product) {
    throw new ProductMutationError(PRODUCT_DELETE_ERRORS.NOT_FOUND);
  }

  if (projectItemCount > 0 || quoteCount > 0) {
    throw new ProductMutationError(PRODUCT_DELETE_ERRORS.IN_USE);
  }

  const storageKeys = collectProductMediaStorageKeys(product.media);

  await Product.findByIdAndDelete(productId);

  await Promise.all(storageKeys.map((key) => deleteOldBlobBestEffort(key)));
}

export { mapProductInputToWriteFields };
