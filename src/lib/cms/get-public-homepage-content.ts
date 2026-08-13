import { unstable_cache } from "next/cache";
import { getHomepageContent } from "@/lib/cms/get-cms-content";
import { getHomepageCategoryRecords } from "@/lib/cms/get-homepage-category-records";
import { mapHomepageToPublic } from "@/lib/cms/map-homepage-to-public";
import { HOMEPAGE_CONTENT_CACHE_TAG } from "@/lib/cms/revalidate-homepage-paths";
import type { PublicHomepageContentView } from "@/types/public-homepage-content";

export async function loadPublicHomepageContentUncached(): Promise<PublicHomepageContentView> {
  const content = await getHomepageContent();

  const referencedCategoryIds = content.categories.items
    .map((item) => item.categoryId)
    .filter((id): id is string => Boolean(id));

  const categoryRecords = await getHomepageCategoryRecords(referencedCategoryIds);

  return mapHomepageToPublic(content, categoryRecords);
}

export async function getPublicHomepageContent(): Promise<PublicHomepageContentView> {
  return unstable_cache(
    async () => loadPublicHomepageContentUncached(),
    [HOMEPAGE_CONTENT_CACHE_TAG],
    { tags: [HOMEPAGE_CONTENT_CACHE_TAG] },
  )();
}
