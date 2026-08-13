import { unstable_cache } from "next/cache";
import { getCatalogPageContent } from "@/lib/cms/get-cms-content";
import { mapCatalogToPublic } from "@/lib/cms/map-catalog-to-public";
import { CATALOG_CONTENT_CACHE_TAG } from "@/lib/cms/revalidate-catalog-paths";
import type { PublicCatalogPageContentView } from "@/types/public-catalog-content";

export async function loadPublicCatalogPageContentUncached(): Promise<PublicCatalogPageContentView> {
  const content = await getCatalogPageContent();
  return mapCatalogToPublic(content);
}

export async function getPublicCatalogPageContent(): Promise<PublicCatalogPageContentView> {
  return unstable_cache(
    async () => loadPublicCatalogPageContentUncached(),
    [CATALOG_CONTENT_CACHE_TAG],
    { tags: [CATALOG_CONTENT_CACHE_TAG] },
  )();
}
