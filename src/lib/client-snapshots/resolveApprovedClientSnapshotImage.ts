import type { ProductThumbnailView } from "@/lib/products/loadProductThumbnailMap";
import type { ClientApprovedProjectImageView } from "@/types/client-approved-project";

export function resolveApprovedClientSnapshotImage(
  thumbnail: ProductThumbnailView | undefined,
  productName: string,
): ClientApprovedProjectImageView | undefined {
  if (!thumbnail) {
    return undefined;
  }

  const url = thumbnail.url?.trim();
  if (!url) {
    return undefined;
  }

  const sourceAlt = thumbnail.altText?.trim();
  return {
    url,
    alt: sourceAlt || productName,
  };
}
