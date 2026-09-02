import type { PublicCategoryView } from "@/types/catalog";
import type { PublicHomepageCategoryTileView } from "@/types/public-homepage-content";
import type { PublicCategoryNavItemView } from "@/types/public-category-nav";

function resolveSlugFromTileHref(href: string | undefined): string | null {
  if (!href) {
    return null;
  }

  try {
    const url = new URL(href, "http://localhost");
    return url.searchParams.get("category");
  } catch {
    return null;
  }
}

export function buildPublicCategoryNavPresentation(
  categories: PublicCategoryView[],
  tiles: PublicHomepageCategoryTileView[],
): PublicCategoryNavItemView[] {
  const imageBySlug = new Map<string, PublicCategoryNavItemView["image"]>();

  for (const tile of tiles) {
    const slug = resolveSlugFromTileHref(tile.href);

    if (slug && tile.image && !imageBySlug.has(slug)) {
      imageBySlug.set(slug, tile.image);
    }
  }

  return categories.map((category) => ({
    slug: category.slug,
    nameHe: category.nameHe,
    href: `/products?category=${encodeURIComponent(category.slug)}`,
    image: imageBySlug.get(category.slug),
  }));
}
