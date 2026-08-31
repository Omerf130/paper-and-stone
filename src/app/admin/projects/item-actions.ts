"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { requireAdmin } from "@/lib/auth/authorization";
import { connectDB } from "@/lib/db/mongoose";
import Product from "@/models/Product";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import {
  addProductToProjectAsAdmin,
  removeProjectItemAsAdmin,
  updateProjectItemAsAdmin,
} from "@/lib/projects/project-admin-item-mutations";
import {
  PROJECT_ERRORS,
  parseAddToProjectInput,
  parseUpdateProjectItemInput,
} from "@/lib/projects/project-validation";
import { mapProductToView } from "@/lib/products/mapProductToView";
import { getAdminProducts } from "@/lib/products/getAdminProducts";
import type { AddToProjectInput, ProjectFormState, UpdateProjectItemInput } from "@/types/project";
import type { ProductView } from "@/types/product";

export async function addProductToProjectAsAdminAction(
  input: AddToProjectInput,
): Promise<{ error?: string; success?: boolean }> {
  await requireAdmin();

  const parsed = parseAddToProjectInput(input);
  if (!parsed.success) {
    return { error: Object.values(parsed.fieldErrors)[0] };
  }

  try {
    await addProductToProjectAsAdmin(
      parsed.data.projectId,
      parsed.data.productSlug,
      parsed.data.quantity,
      parsed.data.selectedMaterialId,
      parsed.data.selectedColorId,
      parsed.data.selectedSizeKey,
      parsed.data.roomId,
    );
    revalidatePath(`/admin/projects/${parsed.data.projectId}`);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message };
    }

    return { error: PROJECT_ERRORS.GENERIC };
  }
}

export async function updateProjectItemAsAdminAction(
  input: UpdateProjectItemInput,
): Promise<ProjectFormState> {
  await requireAdmin();

  const parsed = parseUpdateProjectItemInput(input);
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors };
  }

  try {
    await updateProjectItemAsAdmin(
      parsed.data.projectId,
      parsed.data.itemId,
      parsed.data.quantity,
      parsed.data.selectedMaterialId,
      parsed.data.selectedColorId,
      parsed.data.selectedSizeKey,
    );
    revalidatePath(`/admin/projects/${parsed.data.projectId}`);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message };
    }

    return { error: PROJECT_ERRORS.GENERIC };
  }
}

export async function removeProjectItemAsAdminAction(
  projectId: string,
  itemId: string,
): Promise<ProjectFormState> {
  await requireAdmin();

  try {
    await removeProjectItemAsAdmin(projectId, itemId);
    revalidatePath(`/admin/projects/${projectId}`);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message };
    }

    return { error: PROJECT_ERRORS.GENERIC };
  }
}

export type AdminProductSearchResult = {
  id: string;
  nameHe: string;
  sku: string;
  slug: string;
};

export async function searchAdminProductsForProjectAction(
  query: string,
): Promise<{ products: AdminProductSearchResult[]; error?: string }> {
  await requireAdmin();

  try {
    const result = await getAdminProducts({
      query: query.trim() || null,
      visibility: "visible",
      categoryId: null,
      supplierId: null,
      featured: null,
    });

    await connectDB();
    const productIds = result.products.map((product) => product.id);
    const slugById = new Map<string, string>();

    if (productIds.length > 0) {
      const products = await Product.find({
        _id: { $in: productIds.map((id) => new Types.ObjectId(id)) },
      })
        .select("_id slug")
        .lean();

      for (const product of products) {
        slugById.set(product._id.toString(), product.slug);
      }
    }

    return {
      products: result.products
        .map((product) => {
          const slug = slugById.get(product.id);
          if (!slug) {
            return null;
          }

          return {
            id: product.id,
            nameHe: product.nameHe,
            sku: product.sku,
            slug,
          };
        })
        .filter((product): product is AdminProductSearchResult => product != null),
    };
  } catch {
    return { products: [], error: "לא ניתן לחפש מוצרים." };
  }
}

export async function getAdminProductViewForProjectAction(
  productId: string,
): Promise<{ product?: ProductView; error?: string }> {
  await requireAdmin();

  if (!Types.ObjectId.isValid(productId)) {
    return { error: "מוצר לא נמצא." };
  }

  try {
    await connectDB();
    const product = await Product.findById(productId)
      .populate<{ categoryId: { nameHe: string } | null }>("categoryId", "nameHe")
      .lean();

    if (!product) {
      return { error: "מוצר לא נמצא." };
    }

    return { product: await mapProductToView(product) };
  } catch {
    return { error: "לא ניתן לטעון את המוצר." };
  }
}
