import type { HomepageCategoryPresentationItemView } from "@/types/cms-content";
import type { PublicHomepageCategoryTileView } from "@/types/public-homepage-content";
import type { HomepageCategoryRecord } from "@/lib/cms/get-homepage-category-records";

function resolveCategoryTileTitle(
  item: HomepageCategoryPresentationItemView,
  category: HomepageCategoryRecord | undefined,
): string {
  const displayTitle = item.displayTitle?.trim();

  if (displayTitle) {
    return displayTitle;
  }

  return category?.nameHe ?? "";
}

function resolveCategoryTileHref(
  item: HomepageCategoryPresentationItemView,
  category: HomepageCategoryRecord | undefined,
): string | undefined {
  if (!item.categoryId || !category || !category.isActive) {
    return undefined;
  }

  return `/products?category=${encodeURIComponent(category.slug)}`;
}

export function resolvePublicHomepageCategoryTiles(
  items: HomepageCategoryPresentationItemView[],
  categoryRecords: Map<string, HomepageCategoryRecord>,
): PublicHomepageCategoryTileView[] {
  return [...items]
    .filter((item) => item.isVisible)
    .sort((left, right) => left.order - right.order)
    .map((item) => {
      const category = item.categoryId
        ? categoryRecords.get(item.categoryId)
        : undefined;

      return {
        id: item.id,
        title: resolveCategoryTileTitle(item, category),
        layout: item.layout,
        image: item.image
          ? {
              url: item.image.url,
              alt: item.image.isDecorative
                ? ""
                : item.image.alt?.trim() || resolveCategoryTileTitle(item, category),
              width: item.image.width,
              height: item.image.height,
            }
          : undefined,
        href: resolveCategoryTileHref(item, category),
      };
    });
}
