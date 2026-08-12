import { connectDB } from "@/lib/db/mongoose";
import { mapProductToView } from "@/lib/products/mapProductToView";
import {
  hasMaterials,
  hasSizes,
} from "@/lib/products/product-display-helpers";
import {
  getColorById,
  getMaterialById,
} from "@/lib/products/configurator-helpers";
import Product from "@/models/Product";
import type { IProduct } from "@/models/Product";
import type { ProductView } from "@/types/product";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import { PROJECT_ERRORS } from "@/lib/projects/project-validation";
import {
  normalizeOptionalId,
} from "@/lib/projects/project-item-matching";

export type VerifiedProjectItemSelection = {
  productId: string;
  productView: ProductView;
  selectedMaterialId: string | null;
  selectedColorId: string | null;
  selectedSizeKey: string | null;
};

type LeanProduct = Omit<IProduct, "categoryId"> & {
  categoryId: { nameHe: string } | null;
};

async function loadProductLean(
  filter: Record<string, unknown>,
): Promise<LeanProduct | null> {
  await connectDB();

  return Product.findOne(filter)
    .populate<{ categoryId: { nameHe: string } | null }>({
      path: "categoryId",
      select: "nameHe",
    })
    .lean() as Promise<LeanProduct | null>;
}

export async function loadActiveProductBySlug(
  slug: string,
): Promise<{ product: LeanProduct; productView: ProductView } | null> {
  const product = await loadProductLean({ slug, isActive: true });

  if (!product) {
    return null;
  }

  const productView = await mapProductToView(product);
  return { product, productView };
}

export async function loadProductById(
  productId: string,
): Promise<{ product: LeanProduct; productView: ProductView } | null> {
  const product = await loadProductLean({ _id: productId });

  if (!product) {
    return null;
  }

  const productView = await mapProductToView(product);
  return { product, productView };
}

function validateSelectionAgainstProductView(
  productView: ProductView,
  selectedMaterialId?: string,
  selectedColorId?: string,
  selectedSizeKey?: string,
): Omit<VerifiedProjectItemSelection, "productId"> {
  const materialsAvailable = hasMaterials(productView);
  const sizesAvailable = hasSizes(productView);

  const materialId = normalizeOptionalId(selectedMaterialId);
  const colorId = normalizeOptionalId(selectedColorId);
  const sizeKey = normalizeOptionalId(selectedSizeKey);

  if (materialsAvailable) {
    if (!materialId) {
      throw new ProjectMutationError(PROJECT_ERRORS.INVALID_SELECTION);
    }

    const material = getMaterialById(productView, materialId);
    if (!material) {
      throw new ProjectMutationError(PROJECT_ERRORS.INVALID_SELECTION);
    }

    if (material.colors.length > 0) {
      if (!colorId) {
        throw new ProjectMutationError(PROJECT_ERRORS.INVALID_SELECTION);
      }

      const color = getColorById(material, colorId);
      if (!color) {
        throw new ProjectMutationError(PROJECT_ERRORS.INVALID_SELECTION);
      }
    } else if (colorId) {
      throw new ProjectMutationError(PROJECT_ERRORS.INVALID_SELECTION);
    }
  } else if (materialId || colorId) {
    throw new ProjectMutationError(PROJECT_ERRORS.INVALID_SELECTION);
  }

  if (sizesAvailable) {
    if (!sizeKey) {
      throw new ProjectMutationError(PROJECT_ERRORS.INVALID_SELECTION);
    }

    const size = productView.sizes.find((entry) => entry.id === sizeKey);
    if (!size) {
      throw new ProjectMutationError(PROJECT_ERRORS.INVALID_SELECTION);
    }
  } else if (sizeKey) {
    throw new ProjectMutationError(PROJECT_ERRORS.INVALID_SELECTION);
  }

  return {
    productView,
    selectedMaterialId: materialId,
    selectedColorId: colorId,
    selectedSizeKey: sizeKey,
  };
}

export async function verifyProjectItemSelectionForAdd(
  productSlug: string,
  selectedMaterialId?: string,
  selectedColorId?: string,
  selectedSizeKey?: string,
): Promise<VerifiedProjectItemSelection> {
  const loaded = await loadActiveProductBySlug(productSlug);

  if (!loaded) {
    throw new ProjectMutationError(PROJECT_ERRORS.INVALID_PRODUCT);
  }

  const verified = validateSelectionAgainstProductView(
    loaded.productView,
    selectedMaterialId,
    selectedColorId,
    selectedSizeKey,
  );

  return {
    ...verified,
    productId: loaded.product._id.toString(),
  };
}

export async function verifyProjectItemSelectionForEdit(
  productId: string,
  selectedMaterialId?: string,
  selectedColorId?: string,
  selectedSizeKey?: string,
): Promise<VerifiedProjectItemSelection> {
  const loaded = await loadProductById(productId);

  if (!loaded) {
    throw new ProjectMutationError(PROJECT_ERRORS.INVALID_PRODUCT);
  }

  const verified = validateSelectionAgainstProductView(
    loaded.productView,
    selectedMaterialId,
    selectedColorId,
    selectedSizeKey,
  );

  return {
    ...verified,
    productId: loaded.product._id.toString(),
  };
}
