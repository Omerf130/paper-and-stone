import type { HomepageSectionKey } from "@/types/cms-content";
import type { PublicHomepageContentView } from "@/types/public-homepage-content";

const KNOWN_SECTION_KEYS = new Set<HomepageSectionKey>([
  "hero",
  "categories",
  "featuredProducts",
  "about",
  "professionals",
  "inspiration",
  "closing",
]);

export function buildVisibleHomepageSections(
  homepage: PublicHomepageContentView,
  featuredProductCount: number,
): HomepageSectionKey[] {
  const visibleSections: HomepageSectionKey[] = [];

  for (const key of homepage.sectionOrder) {
    if (!KNOWN_SECTION_KEYS.has(key)) {
      continue;
    }

    if (!homepage.sectionVisibility[key]) {
      continue;
    }

    if (key === "featuredProducts" && featuredProductCount === 0) {
      continue;
    }

    visibleSections.push(key);
  }

  if (!visibleSections.includes("hero")) {
    visibleSections.unshift("hero");
  }

  return visibleSections;
}
