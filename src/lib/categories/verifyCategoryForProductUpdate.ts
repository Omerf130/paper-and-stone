import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { PRODUCT_ERRORS } from "@/lib/products/product-validation";
import { ProductMutationError } from "@/lib/products/product-mutation-error";
import { isProductAssignableCategoryKind } from "@/types/category-kind";

export async function verifyCategoryForProductUpdate(
  categoryId: string,
  productId: string,
): Promise<void> {
  if (!Types.ObjectId.isValid(categoryId)) {
    throw new ProductMutationError(PRODUCT_ERRORS.INVALID_CATEGORY, {
      categoryId: PRODUCT_ERRORS.INVALID_CATEGORY,
    });
  }

  await connectDB();

  const product = await Product.findById(productId).select("categoryId").lean();

  if (!product) {
    throw new ProductMutationError(PRODUCT_ERRORS.GENERIC);
  }

  const existingCategoryId = product.categoryId.toString();
  const category = await Category.findById(categoryId)
    .select("_id isActive kind taxonomyKey parentId")
    .lean();

  if (!category) {
    throw new ProductMutationError(PRODUCT_ERRORS.INVALID_CATEGORY, {
      categoryId: PRODUCT_ERRORS.INVALID_CATEGORY,
    });
  }

  if (categoryId === existingCategoryId) {
    return;
  }

  if (!category.isActive) {
    throw new ProductMutationError(PRODUCT_ERRORS.INVALID_CATEGORY, {
      categoryId: PRODUCT_ERRORS.INVALID_CATEGORY,
    });
  }

  if (!isProductAssignableCategoryKind(category.kind)) {
    throw new ProductMutationError(PRODUCT_ERRORS.INVALID_CATEGORY, {
      categoryId: PRODUCT_ERRORS.INVALID_CATEGORY,
    });
  }

  if (!category.taxonomyKey || !category.parentId) {
    throw new ProductMutationError(PRODUCT_ERRORS.INVALID_CATEGORY, {
      categoryId: PRODUCT_ERRORS.INVALID_CATEGORY,
    });
  }
}
