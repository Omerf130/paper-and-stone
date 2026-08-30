import type { IProductMediaItem } from "@/models/Product";
import type { AdminMediaItemView } from "@/types/admin-product-media";

export function mapMediaItemToAdmin(
  item: IProductMediaItem | null | undefined,
): AdminMediaItemView | null {
  if (!item) {
    return null;
  }

  return {
    id: item._id.toString(),
    storageKey: item.storageKey,
    url: item.url,
    mediaType: item.mediaType,
    mimeType: item.mimeType,
    originalFilename: item.originalFilename,
    byteSize: item.byteSize,
    altText: item.altText ?? "",
    sortOrder: item.sortOrder,
    createdAt: item.createdAt.toISOString(),
    width: item.width,
    height: item.height,
    normalized: item.normalized,
  };
}

export function mapGalleryToAdmin(
  items: IProductMediaItem[] | null | undefined,
): AdminMediaItemView[] {
  if (!items?.length) {
    return [];
  }

  return items
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => mapMediaItemToAdmin(item))
    .filter((item): item is AdminMediaItemView => item !== null);
}
