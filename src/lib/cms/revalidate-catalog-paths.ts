import { revalidatePath, revalidateTag } from "next/cache";

export const CATALOG_CONTENT_CACHE_TAG = "catalog-content";

export async function revalidateCatalogPaths(): Promise<void> {
  revalidateTag(CATALOG_CONTENT_CACHE_TAG, { expire: 0 });
  revalidatePath("/admin/content/catalog");
  revalidatePath("/products");
}
