import type { CatalogPageContentView } from "@/types/cms-content";
import type { PublicCatalogPageContentView } from "@/types/public-catalog-content";

export function mapCatalogToPublic(
  content: CatalogPageContentView,
): PublicCatalogPageContentView {
  return {
    eyebrow: content.eyebrow,
    heading: content.heading,
    supportingText: content.supportingText,
  };
}
